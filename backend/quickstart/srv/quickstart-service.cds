using { ac.quickstart as my } from '../db/schema';

service QuickstartService @(odata:'/quickstart') {

  entity Documents as projection on my.Documents;
  entity Users as projection on my.Users;
  entity DocumentContributors as projection on my.DocumentContributors;
}
