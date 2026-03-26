using { ac.quickstart as my } from '../db/schema';

service DocumentService @(odata:'/quickstart/document-service', requires: 'authenticated-user') {
  @restrict: [
    {
      grant: 'READ',
      where: (document.author.username = $user or exists document.contributors[user.username = $user])
    },
    {
      grant: 'WRITE',
      where: (document.author.username = $user)
    }
  ]
  entity DocumentContributors as projection on my.DocumentContributors;

  @readonly
  entity Tags as projection on my.Tags;

  @restrict: [
    {
      grant: 'READ',
      where: (document.author.username = $user or exists document.contributors[user.username = $user])
    },
    {
      grant: 'WRITE',
      where: (document.author.username = $user)
    }
  ]
  entity DocumentTags as projection on my.DocumentTags;

  @restrict: [
    {
      grant: 'READ',
      where: (document.author.username = $user or exists document.contributors[user.username = $user])
    },
    {
      grant: 'WRITE',
      where: (document.author.username = $user)
    }
  ]
  entity DocumentAssets as projection on my.DocumentAssets;

  @restrict: [
    {
      grant: 'READ',
      where: (author.username = $user or exists contributors[user.username = $user])
    },
    {
      grant: ['UPDATE', 'DELETE'],
      where: (author.username = $user)
    }
  ]
  entity Documents as projection on my.Documents;

  action createNewDocument(title: String, description: String, parentId: UUID, tags: array of String,
    contributorsUsernames: array of String, editorState: String) returns Documents;

  action setDocumentContributors(documentId: UUID, contributorsUsernames: array of String) returns Documents;
  action setDocumentTags(documentId: UUID, tags: array of String) returns Documents;
}
