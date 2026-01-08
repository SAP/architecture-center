resource "random_uuid" "uuid" {}

resource "btp_subaccount" "subaccount" {
  name      = var.subaccount_name
  subdomain = random_uuid.uuid.result
  region    = lower(var.region)
  # usage     = "USED_FOR_PRODUCTION"
}

# The services AI Core, Destination, CF runtime must be manually entitled and available at the global account level
# before they can be entitled on the subaccount level.

resource "btp_subaccount_entitlement" "ai_core" {
  subaccount_id = btp_subaccount.subaccount.id
  service_name  = "aicore"
  plan_name     = "extended"
}

data "btp_subaccount_service_plan" "ai_core" {
  subaccount_id = btp_subaccount.subaccount.id
  offering_name = "aicore"
  name          = "extended"
  depends_on    = [btp_subaccount_entitlement.ai_core]
}

resource "btp_subaccount_service_instance" "ai_core" {
  subaccount_id  = btp_subaccount.subaccount.id
  serviceplan_id = data.btp_subaccount_service_plan.ai_core.id
  name           = "aicore"
  depends_on     = [btp_subaccount_entitlement.ai_core, btp_subaccount_role_collection_assignment.subaccount_service_admins]
}

resource "btp_subaccount_service_binding" "ai_core_binding" {
  subaccount_id       = btp_subaccount.subaccount.id
  service_instance_id = btp_subaccount_service_instance.ai_core.id
  name                = "ai-core-key"
}

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

resource "btp_subaccount_service_instance" "destination" {
  subaccount_id  = btp_subaccount.subaccount.id
  serviceplan_id = data.btp_subaccount_service_plan.destination.id
  name           = "destination"
  depends_on     = [btp_subaccount_entitlement.destination]
}

resource "btp_subaccount_entitlement" "cf_runtime" {
  subaccount_id = btp_subaccount.subaccount.id
  service_name  = "APPLICATION_RUNTIME"
  plan_name     = "MEMORY"
  # memory in GBs
  amount = 1
}

resource "btp_subaccount_environment_instance" "cloudfoundry" {
  subaccount_id    = btp_subaccount.subaccount.id
  name             = var.cf_org_name
  environment_type = "cloudfoundry"
  service_name     = "cloudfoundry"
  plan_name        = "standard"
  landscape_label  = var.cf_landscape_label
  parameters = jsonencode({
    instance_name = var.cf_org_name
  })
}

resource "cloudfoundry_space" "dev" {
  name = "dev"
  org  = jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["Org ID"]
}

resource "btp_subaccount_role_collection_assignment" "subaccount_admins" {
  for_each             = toset(var.subaccount_admins)
  subaccount_id        = btp_subaccount.subaccount.id
  role_collection_name = "Subaccount Administrator"
  user_name            = each.value
}

resource "btp_subaccount_role_collection_assignment" "subaccount_service_admins" {
  for_each             = toset(var.subaccount_admins)
  subaccount_id        = btp_subaccount.subaccount.id
  role_collection_name = "Subaccount Service Administrator"
  user_name            = each.value
}

resource "cloudfoundry_org_role" "organization_manager" {
  for_each = toset(var.cf_org_members)
  username = each.value
  type     = "organization_manager"
  org      = jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["Org ID"]
}

resource "cloudfoundry_org_role" "organization_user" {
  for_each = toset(var.cf_org_members)
  username = each.value
  type     = "organization_user"
  org      = jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["Org ID"]
}

resource "cloudfoundry_space_role" "space_manager" {
  for_each   = toset(var.cf_space_members)
  username   = each.value
  type       = "space_manager"
  space      = cloudfoundry_space.dev.id
  depends_on = [cloudfoundry_org_role.organization_user, cloudfoundry_org_role.organization_manager]
}

resource "cloudfoundry_space_role" "space_developer" {
  for_each   = toset(var.cf_space_members)
  username   = each.value
  type       = "space_developer"
  space      = cloudfoundry_space.dev.id
  depends_on = [cloudfoundry_org_role.organization_user, cloudfoundry_org_role.organization_manager]
}