# ------------------------------------------------------------------------------------------------------
# Provider configuration
# ------------------------------------------------------------------------------------------------------
# Your global account subdomain. Something like sa1010002681
globalaccount   = ""
region          = "eu10"
subaccount_name = "RAG Reference Architecture"
# optional: set to your tenant of SAP Cloud Identity Services that is connected
# to your own corporate identity provider
# custom_idp      = "<your_idp>.accounts.ondemand.com"

# ------------------------------------------------------------------------------------------------------
# Project specific configuration (please adapt!)
# ------------------------------------------------------------------------------------------------------

# Don't add the user, that is executing the TF script to subaccount_admins or subaccount_service_admins!
subaccount_admins         = ["another.user@test.com"]
subaccount_service_admins = ["another.user@test.com"]

# Don't add the user, that is executing the TF script to cf_org_admins or cf_org_users!
cf_org_admins       = ["another.user@test.com"]
cf_org_users        = ["another.user@test.com"]
cf_space_managers   = ["another.user@test.com", "you@test.com"]
cf_space_developers = ["another.user@test.com", "you@test.com"]
