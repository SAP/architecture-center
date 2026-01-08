variable "globalaccount_subdomain" {
  type        = string
  description = "The subdomain of the global account. It looks similar to sa1010002681"
}

variable "subaccount_name" {
  type = string
}

variable "region" {
  type        = string
  description = "The main region of the subaccount"
}

variable "cf_landscape_label" {
  type        = string
  description = "The landscape used for Cloud Foundry (CF). More and more these are extension landscapes such as eu10-004, us10-002"
}

variable "cf_org_name" {
  type        = string
  description = "The name used for the CF org in the subaccount"
}

variable "subaccount_admins" {
  type = list(string)
}

# Don't add the user that is running Terraform or it will throw an error.
# They will be added anyway to the CF org.
variable "cf_org_members" {
  type = list(string)
}

# User must be in the CF org before they can be added to the CF space
variable "cf_space_members" {
  type = list(string)
}