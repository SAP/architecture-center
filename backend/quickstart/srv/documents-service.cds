using { ac.quickstart as my } from '../db/schema';

service DocumentsService @(odata:'/quickstart') {

  entity Documents as projection on my.Documents;
}
