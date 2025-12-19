variable "globalaccount_subdomain" {
  type        = string
  description = "Looks something like sa1010002681"
}

variable "subaccount_name" {
  type = string
}

variable "region" {
  type        = string
  description = "The region in which the subaccount will be created"
}

variable "cf_landscape_label" {
  type        = string
  description = "The (extension) landscape to use for Cloud Foundry (CF)"
}

variable "cf_org_name" {
  type        = string
  description = "The name to use for the CF org in the subaccount"
}

variable "subaccount_admins" {
  type = list(string)
}

variable "cf_org_admins" {
  type = list(string)
}

variable "cf_space_managers" {
  type = list(string)
}