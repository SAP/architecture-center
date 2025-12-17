# Discovery Center Mission: Develop a CAP-based (multitenant) application using GenAI and RAG (4371) - Step 1

## Overview

This sample shows how to create a landscape for the Discovery Center Mission - [Develop a CAP-based (multitenant) application using GenAI and RAG](https://discovery-center.cloud.sap/missiondetail/4371/)

## Content of setup

The setup comprises the following resources:

- Creation of the SAP BTP subaccount
- Entitlements of services
- Subscriptions to applications
- Role collection assignments to users
- Management of users and roles on org and space level

## Deploying the resources

To deploy the resources you must:

1. Set your credentials as environment variables
   
   ```bash
   export BTP_USERNAME ='<Email address of your BTP user>'
   export BTP_PASSWORD ='<Password of your BTP user>'
   export CF_USER ='<Email address of your BTP user>'
   export CF_PASSWORD ='<Password of your BTP user>'   
   ```

2. Change the variables in the `sample.tfvars` file in the main folder to meet your requirements

   > The minimal set of parameters you should specify (besides user_email and password) is global account (i.e. its subdomain) and the used custom_idp and all user assignments

   > ⚠ NOTE: You should pay attention **specifically** to the users defined in the sample.tfvars whether they already exist in your SAP BTP accounts. Otherwise, you might get error messages like, e.g., `Error: The user could not be found: jane.doe@test.com`.


3. Initialize your workspace:

   ```bash
   terraform init
   ```

4. You can check what Terraform plans to apply based on your configuration:

   ```bash
   terraform plan -var-file="sample.tfvars"
   ```

5. Apply your configuration to provision the resources:

   ```bash
   terraform apply -var-file="sample.tfvars"
   ```

## In the end

You probably want to remove the assets after trying them out to avoid unnecessary costs. To do so execute the following command:

```bash
terraform destroy -var-file="sample.tfvars"
```