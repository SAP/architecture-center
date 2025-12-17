######################################################################
# Customer account setup
######################################################################
variable "globalaccount" {
  type        = string
  description = "Defines the global account"
  default     = "yourglobalaccount"
}

variable "cli_server_url" {
  type        = string
  description = "Defines the CLI server URL"
  default     = "https://cli.btp.cloud.sap"
}

variable "custom_idp" {
  type        = string
  description = "The custom identity provider for the subaccount."
  default     = ""
}

variable "custom_idp_apps_origin_key" {
  type        = string
  description = "The custom identity provider for the subaccount."
  default     = "sap.custom"
}

variable "origin" {
  type        = string
  description = "Defines the origin key of the identity provider"
  default     = "sap.ids"
  # The value for the origin_key can be defined
  # but are normally set to "sap.ids", "sap.default" or "sap.custom"
}

variable "origin_key" {
  type        = string
  description = "Defines the origin key of the identity provider"
  default     = ""
  # The value for the origin_key can be defined, set to "sap.ids", "sap.default" or "sap.custom"
}


# subaccount
variable "subaccount_name" {
  type        = string
  description = "The subaccount name."
  default     = "SAP Discovery Center Mission 4371"
}
variable "subaccount_id" {
  type        = string
  description = "The subaccount ID."
  default     = ""
}

variable "subaccount_admins" {
  type        = list(string)
  description = "Defines the colleagues who are added to each subaccount as subaccount administrators."
}

variable "subaccount_service_admins" {
  type        = list(string)
  description = "Defines the colleagues who are added to each subaccount as subaccount service administrators."
}

variable "region" {
  type        = string
  description = "The region where the sub account shall be created in."
  default     = "us10"

  # Checkout https://github.com/SAP-samples/btp-service-metadata/blob/main/v0/developer/aicore.json for the latest list of regions
  # supported by the AI Core service with the "extended" service plan.
  validation {
    condition     = contains(["ap10", "eu10", "eu11", "eu20", "eu30", "jp10", "us10", "us21", "us30"], var.region)
    error_message = "Please enter a valid region for the sub account. Checkout https://github.com/SAP-samples/btp-service-metadata/blob/main/v0/developer/aicore.json for regions providing the AI Core service."
  }
}

variable "create_tfvars_file_for_step2" {
  type        = bool
  description = "Switch to enable the creation of the tfvars file for step 2."
  default     = true
}

variable "ai_core_plan_name" {
  type        = string
  description = "The name of the AI Core service plan."
  default     = "extended"
  validation {
    condition     = contains(["extended"], var.ai_core_plan_name)
    error_message = "Valid values for ai_core_plan_name are: extended."
  }
}

variable "cf_landscape_label" {
  type        = string
  description = "In case there are multiple environments available for a subaccount, you can use this label to choose with which one you want to go. If nothing is given, we take by default the first available."
  default     = ""
}


variable "cf_space_name" {
  type        = string
  description = "Name of the Cloud Foundry space."
  default     = "dev"

  validation {
    condition     = can(regex("^.{1,255}$", var.cf_space_name))
    error_message = "The Cloud Foundry space name must not be emtpy and not exceed 255 characters."
  }
}

variable "cf_space_developers" {
  type        = list(string)
  description = "CF Space developers"
}

variable "cf_space_managers" {
  type        = list(string)
  description = "CF Space managers"
}

variable "cf_org_admins" {
  type        = list(string)
  description = "CF Org Admins"
}

variable "cf_org_users" {
  type        = list(string)
  description = "CF Org Users"
}

variable "cf_org_name" {
  type        = string
  description = "Name of the Cloud Foundry org."
  default     = "mission-3774-sap-task-center"

  validation {
    condition     = can(regex("^.{1,255}$", var.cf_org_name))
    error_message = "The Cloud Foundry org name must not be emtpy and not exceed 255 characters."
  }
}
