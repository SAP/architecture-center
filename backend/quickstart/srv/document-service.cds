using { ac.quickstart as my } from '../db/schema';

service DocumentService @(odata:'/quickstart/document-service') {
  entity Users as projection on my.Users;
  entity DocumentContributors as projection on my.DocumentContributors;
  entity Tags as projection on my.Tags;
  entity DocumentTags as projection on my.DocumentTags;
  entity DocumentAssets as projection on my.DocumentAssets;
  entity Documents as projection on my.Documents;

  action createNewDocument(title: String, description: String, parentId: UUID, tags: array of String,
    contributorsUsernames: array of String, editorState: String) returns Documents;

  action setDocumentContributors(documentId: UUID, contributorsUsernames: array of String) returns Documents;
  action setDocumentTags(documentId: UUID, tags: array of String) returns Documents;
}
