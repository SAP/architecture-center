using { ac.quickstart as my } from '../db/schema';

service DocumentService @(odata:'/quickstart/document-service') {

  entity Documents as projection on my.Documents;
  entity Users as projection on my.Users;
  entity DocumentContributors as projection on my.DocumentContributors;

  action assignDocumentContributors(
    documentId : UUID,
    contributors : array of String(39)
  ) returns Documents;
}
