terraform {
  required_providers {
    btp = {
      source  = "SAP/btp"
      version = "1.18.1"
    }
    cloudfoundry = {
      source  = "cloudfoundry/cloudfoundry"
      version = "1.11.0"
    }
  }
}

provider "btp" {
  globalaccount  = var.globalaccount_subdomain
  cli_server_url = "https://cli.btp.cloud.sap"
}

provider "cloudfoundry" {}