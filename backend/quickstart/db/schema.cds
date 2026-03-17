using { cuid } from '@sap/cds/common';

namespace ac.quickstart;

  entity Users: cuid {
    ghUsername: String(39);
  }

  entity DocumentContributors {
    key document: Association to Documents;
    key user: Association to Users;
  }

  entity Documents: cuid {
    title: String;
    description: String;
    parent: Association to Documents;
    tags: Array of String;
    author: Association to Users;
    contributors: Composition of many DocumentContributors
      on contributors.document = $self;
    editorState: LargeString;
  }
