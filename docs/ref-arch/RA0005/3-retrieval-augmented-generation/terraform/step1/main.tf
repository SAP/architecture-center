resource "random_uuid" "uuid" {}

resource "btp_subaccount" "subaccount" {
  name      = var.subaccount_name
  subdomain = random_uuid.uuid.result
  region    = lower(var.region)
  usage     = "USED_FOR_PRODUCTION"
}

# You still need to make sure that the same services are entitled in your global account.
# Otherwise they cannot be entitled on the subaccount level.
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
  depends_on     = [btp_subaccount_entitlement.ai_core]
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
  depends_on     = [btp_subaccount_entitlement.destination, data.btp_subaccount_service_plan.destination]
}


resource "btp_subaccount_entitlement" "cf_runtime" {
  subaccount_id = btp_subaccount.subaccount.id
  service_name  = "APPLICATION_RUNTIME"
  plan_name     = "MEMORY"
  amount        = 1 # memory in GBs
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


resource "btp_subaccount_role_collection_assignment" "subaccount-admins" {
  for_each             = toset(var.subaccount_admins)
  subaccount_id        = btp_subaccount.subaccount.id
  role_collection_name = "Subaccount Administrator"
  user_name            = each.value
}

resource "cloudfoundry_org_role" "organization_manager" {
  for_each = toset(var.cf_org_admins)
  username = each.value
  type     = "organization_manager"
  org      = jsondecode(btp_subaccount_environment_instance.cloudfoundry.labels)["Org ID"]
}

resource "cloudfoundry_space_role" "space_manager" {
  for_each   = toset(var.cf_space_managers)
  username   = each.value
  type       = "space_manager"
  space      = cloudfoundry_space.dev.id
  depends_on = [cloudfoundry_org_role.organization_user, cloudfoundry_org_role.organization_manager]
}