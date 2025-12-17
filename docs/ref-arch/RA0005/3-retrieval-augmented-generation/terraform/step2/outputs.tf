output "subaccount_id" {
  value = var.subaccount_id
}

output "cf_org_id" {
  value = var.cf_org_id
}

output "cf_api_url" {
  value = var.cf_api_url
}

output "cf_space_name" {
  value = cloudfoundry_space.dev.name
}