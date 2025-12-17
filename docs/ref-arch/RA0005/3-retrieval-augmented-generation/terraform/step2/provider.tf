terraform {
  required_providers {
    cloudfoundry = {
      source  = "SAP/cloudfoundry"
      version = "1.0.0-rc1"
    }
    btp = {
      source  = "SAP/btp"
      version = "~> 1.8.0"
    }
  }
}

provider "btp" {
  globalaccount  = var.globalaccount
  cli_server_url = var.cli_server_url
}


provider "cloudfoundry" {
  api_url = var.cf_api_url
}