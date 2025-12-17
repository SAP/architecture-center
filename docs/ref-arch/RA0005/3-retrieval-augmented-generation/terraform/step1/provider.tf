# ------------------------------------------------------------------------------------------------------
# Define the required providers for this module
# ------------------------------------------------------------------------------------------------------
terraform {
  required_providers {
    btp = {
      source  = "sap/btp"
      version = "~> 1.8.0"
    }
  }
}

provider "btp" {
  globalaccount  = var.globalaccount
  cli_server_url = var.cli_server_url
}
