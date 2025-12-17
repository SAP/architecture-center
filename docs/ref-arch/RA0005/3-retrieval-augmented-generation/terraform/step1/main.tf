resource "random_uuid" "uuid" {}

locals {
  random_uuid       = random_uuid.uuid.result
  # subaccount_domain = lower(replace("mission-4356-${local.random_uuid}", "_", "-"))
  subaccount_domain = local.random_uuid
  subaccount_cf_org = "rag-reference-architecture"
}
# ------------------------------------------------------------------------------------------------------
# Creation of subaccount
# ------------------------------------------------------------------------------------------------------
resource "btp_subaccount" "subaccount" {
  name      = var.subaccount_name
  subdomain = local.subaccount_domain
  region    = lower(var.region)
  usage     = "USED_FOR_PRODUCTION"
}

# ------------------------------------------------------------------------------------------------------
# Assign custom IDP to sub account (if custom_idp is set)
# ------------------------------------------------------------------------------------------------------
resource "btp_subaccount_trust_configuration" "fully_customized" {
  # Only create trust configuration if custom_idp has been set 
  count             = var.custom_idp == "" ? 0 : 1
  subaccount_id     = btp_subaccount.subaccount.id
  identity_provider = var.custom_idp
}

locals {
  custom_idp_tenant    = var.custom_idp != "" ? element(split(".", var.custom_idp), 0) : ""
  origin_key           = local.custom_idp_tenant != "" ? "${local.custom_idp_tenant}-platform" : "sap.default"
}

# ------------------------------------------------------------------------------------------------------
# Assignment of users as sub account administrators
# ------------------------------------------------------------------------------------------------------
resource "btp_subaccount_role_collection_assignment" "subaccount-admins" {
  for_each             = toset(var.subaccount_admins)
  subaccount_id        = btp_subaccount.subaccount.id
  role_collection_name = "Subaccount Administrator"
  origin               = local.origin_key
  user_name            = each.value
}
# ------------------------------------------------------------------------------------------------------
# Assignment of users as sub account service administrators
# ------------------------------------------------------------------------------------------------------
resource "btp_subaccount_role_collection_assignment" "subaccount-service-admins" {
  for_each             = toset(var.subaccount_service_admins)
  subaccount_id        = btp_subaccount.subaccount.id
  role_collection_name = "Subaccount Service Administrator"
  origin               = local.origin_key
  user_name            = each.value
}


# ------------------------------------------------------------------------------------------------------
# Prepare & setup the SAP AI Core service (ensure your global account has the respective entitlements)
# ------------------------------------------------------------------------------------------------------

# Entitle subaccount for usage of SAP AI Core service
# ------------------------------------------------------------------------------------------------------
# Checkout https://github.com/SAP-samples/btp-service-metadata/blob/main/v0/developer/aicore.json for 
# available plans and their region availability 
resource "btp_subaccount_entitlement" "ai_core" {
  subaccount_id = btp_subaccount.subaccount.id
  service_name  = "aicore"
  plan_name     = var.ai_core_plan_name
}

# Get plan for SAP AI Core service
data "btp_subaccount_service_plan" "ai_core" {
  subaccount_id = btp_subaccount.subaccount.id
  offering_name = "aicore"
  name          = var.ai_core_plan_name
  depends_on    = [btp_subaccount_entitlement.ai_core]
}

# Create service instance for SAP AI Core service
resource "btp_subaccount_service_instance" "ai_core" {
  subaccount_id  = btp_subaccount.subaccount.id
  serviceplan_id = data.btp_subaccount_service_plan.ai_core.id
  name           = "my-ai-core-instance"
  depends_on     = [btp_subaccount_entitlement.ai_core]
}

# Create service binding to SAP AI Core service (exposed for a specific user group)
resource "btp_subaccount_service_binding" "ai_core_binding" {
  subaccount_id       = btp_subaccount.subaccount.id
  service_instance_id = btp_subaccount_service_instance.ai_core.id
  name                = "ai-core-key"
}

# ------------------------------------------------------------------------------------------------------
# Setup destination
# ------------------------------------------------------------------------------------------------------
# Entitle 
resource "btp_subaccount_entitlement" "destination" {
  subaccount_id = btp_subaccount.subaccount.id
  service_name  = "destination"
  plan_name     = "lite"
}

data "btp_subaccount_service_plan" "destination" {
  subaccount_id = btp_subaccount.subaccount.id
  offering_name = "destination"
  name          = "lite"
  depends_on    = [btp_subaccount_entitlement.destination]
}

# Create service instance
resource "btp_subaccount_service_instance" "destination" {
  subaccount_id  = btp_subaccount.subaccount.id
  serviceplan_id = data.btp_subaccount_service_plan.destination.id
  name           = "destination"
  depends_on     = [btp_subaccount_service_binding.ai_core_binding, data.btp_subaccount_service_plan.destination]
  parameters = jsonencode({
    HTML5Runtime_enabled = true
    init_data = {
      subaccount = {
        existing_destinations_policy = "update"
        destinations = [
          # This is the destination to the ai-core binding
          {
            Description                = "[Do not delete] PROVIDER_AI_CORE_DESTINATION_HUB"
            Type                       = "HTTP"
            clientId                   = "${jsondecode(btp_subaccount_service_binding.ai_core_binding.credentials)["clientid"]}"
            clientSecret               = "${jsondecode(btp_subaccount_service_binding.ai_core_binding.credentials)["clientsecret"]}"
            "HTML5.DynamicDestination" = true
            "HTML5.Timeout"            = 5000
            Authentication             = "OAuth2ClientCredentials"
            Name                       = "PROVIDER_AI_CORE_DESTINATION_HUB"
            tokenServiceURL            = "${jsondecode(btp_subaccount_service_binding.ai_core_binding.credentials)["url"]}/oauth/token"
            ProxyType                  = "Internet"
            URL                        = "${jsondecode(btp_subaccount_service_binding.ai_core_binding.credentials)["serviceurls"]["AI_API_URL"]}/v2"
            tokenServiceURLType        = "Dedicated"
          }
        ]
      }
    }
  })
}



# ------------------------------------------------------------------------------------------------------
# CLOUDFOUNDRY PREPARATION
# ------------------------------------------------------------------------------------------------------
#
# Fetch all available environments for the subaccount
data "btp_subaccount_environments" "all" {
  subaccount_id = btp_subaccount.subaccount.id
}
# ------------------------------------------------------------------------------------------------------
# Take the landscape label from the first CF environment if no environment label is provided
# (this replaces the previous null_resource)
# ------------------------------------------------------------------------------------------------------
resource "terraform_data" "cf_landscape_label" {
  input = length(var.cf_landscape_label) > 0 ? var.cf_landscape_label : [for env in data.btp_subaccount_environments.all.values : env if env.service_name == "cloudfoundry" && env.environment_type == "cloudfoundry"][0].landscape_label
}
# ------------------------------------------------------------------------------------------------------
# Creation of Cloud Foundry environment
# ------------------------------------------------------------------------------------------------------
resource "btp_subaccount_environment_instance" "cloudfoundry" {
  subaccount_id    = btp_subaccount.subaccount.id
  name             = local.subaccount_cf_org
  environment_type = "cloudfoundry"
  service_name     = "cloudfoundry"
  plan_name        = "standard"
  landscape_label  = terraform_data.cf_landscape_label.output
  parameters = jsonencode({
    instance_name = local.subaccount_cf_org
  })
}
# ------------------------------------------------------------------------------------------------------
# Create tfvars file for step 2 (if variable `create_tfvars_file_for_step2` is set to true)
# ------------------------------------------------------------------------------------------------------
resource "local_file" "output_vars_step1" {
  count    = var.create_tfvars_file_for_step2 ? 1 : 0
  content  = <<-EOT
      globalaccount        = "${var.globalaccount}"
      subaccount_id        = "${btp_subaccount.subaccount.id}"
      cf_api_url           = "${jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["API Endpoint"]}"
      cf_org_id            = "${jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["Org ID"]}"
      custom_idp           = ${jsonencode(var.custom_idp)}
      cf_space_name        = "${var.cf_space_name}"
      cf_org_admins        = ${jsonencode(var.cf_org_admins)}
      cf_org_users         = ${jsonencode(var.cf_org_users)}
      cf_space_developers  = ${jsonencode(var.cf_space_developers)}
      cf_space_managers    = ${jsonencode(var.cf_space_managers)}
      EOT
  filename = "../step2/terraform.tfvars"
}