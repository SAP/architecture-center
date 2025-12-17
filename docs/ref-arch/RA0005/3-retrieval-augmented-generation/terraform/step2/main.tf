# ------------------------------------------------------------------------------------------------------
# Import custom trust config and disable for user login
# ------------------------------------------------------------------------------------------------------
locals {
  available_for_user_logon = var.custom_idp != "" ? false : true
}

import {
  to = btp_subaccount_trust_configuration.default
  id = "${var.subaccount_id},sap.default"
}

resource "btp_subaccount_trust_configuration" "default" {
  subaccount_id            = var.subaccount_id
  identity_provider        = ""
  auto_create_shadow_users = false
  available_for_user_logon = local.available_for_user_logon
}


# ------------------------------------------------------------------------------------------------------
# Create space using CF provider
# ------------------------------------------------------------------------------------------------------
resource "cloudfoundry_space" "dev" {
  name = var.cf_space_name
  org  = var.cf_org_id
}

# ------------------------------------------------------------------------------------------------------
# SETUP ALL SERVICES FOR CF USAGE
# ------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------
#  USERS AND ROLES
# ------------------------------------------------------------------------------------------------------
data "btp_whoami" "me" {}

locals {
  # Remove current user if issuer (idp) of logged in user is not same as used custom idp 
  cf_org_admins = data.btp_whoami.me.issuer != var.custom_idp ? var.cf_org_admins : setsubtract(toset(var.cf_org_admins), [data.btp_whoami.me.email])
  cf_org_users  = data.btp_whoami.me.issuer != var.custom_idp ? var.cf_org_admins : setsubtract(toset(var.cf_org_users), [data.btp_whoami.me.email])

  # get origin_key from custom.idp 
  custom_idp_tenant = var.custom_idp != "" ? element(split(".", var.custom_idp), 0) : ""
  origin_key        = local.custom_idp_tenant != "" ? "${local.custom_idp_tenant}-platform" : "sap.ids"
}


# ------------------------------------------------------------------------------------------------------
# add org and space users and managers
# ------------------------------------------------------------------------------------------------------
resource "cloudfoundry_org_role" "organization_user" {
  for_each = toset(var.cf_org_users)
  username = each.value
  type     = "organization_user"
  org      = var.cf_org_id
  origin   = local.origin_key
}

resource "cloudfoundry_org_role" "organization_manager" {
  for_each = toset(var.cf_org_admins)
  username = each.value
  type     = "organization_manager"
  org      = var.cf_org_id
  origin   = local.origin_key
}

resource "cloudfoundry_space_role" "space_developer" {
  for_each   = toset(var.cf_space_developers)
  username   = each.value
  type       = "space_developer"
  space      = cloudfoundry_space.dev.id
  origin     = local.origin_key
  depends_on = [cloudfoundry_org_role.organization_user, cloudfoundry_org_role.organization_manager]
}

resource "cloudfoundry_space_role" "space_manager" {
  for_each   = toset(var.cf_space_managers)
  username   = each.value
  type       = "space_manager"
  space      = cloudfoundry_space.dev.id
  origin     = local.origin_key
  depends_on = [cloudfoundry_org_role.organization_user, cloudfoundry_org_role.organization_manager]
}