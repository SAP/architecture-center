using { ac.quickstart as my } from '../db/schema';

service DocumentService @(odata:'/quickstart/document-service') {
  entity Users as projection on my.Users;
  entity DocumentContributors as projection on my.DocumentContributors;
  entity Tags as projection on my.Tags;
  entity DocumentTags as projection on my.DocumentTags;
  entity DocumentAssets as projection on my.DocumentAssets;
  entity Documents as projection on my.Documents;
}
