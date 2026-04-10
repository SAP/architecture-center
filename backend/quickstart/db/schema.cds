using { cuid } from '@sap/cds/common';

namespace ac.quickstart;

  type ContributorAccess : String enum {
    // for now, contributors have VIEW rights only, but in the future might be allowed
    // to EDIT documents as well.
    VIEW;
  }

  entity Users: cuid {
    // the GitHub username
    username: String(39) not null;
  }

  entity DocumentContributors {
    key document: Association to Documents;
    key user: Association to Users;
    accessLevel: ContributorAccess not null default #VIEW;
  }

  entity Tags {
    key code: String(60);
    label: String(120);
    description: String(2000);
  }

  entity DocumentTags {
    key document: Association to Documents;
    key tag: Association to Tags;
  }

  entity DocumentAssets: cuid {
    mediaType: String(127) not null @Core.IsMediaType;
    content: LargeBinary @Core.MediaType: mediaType;
    filename: String(255) not null;
    document: Association to Documents not null;
  }

  entity Documents: cuid {
    title: String(255) not null;
    description: String(2000);
    parent: Association to Documents;
    tags: Composition of many DocumentTags
      on tags.document = $self;
    author: Association to Users not null;
    contributors: Composition of many DocumentContributors
      on contributors.document = $self;
    assets: Composition of many DocumentAssets
      on assets.document = $self;
    editorState: LargeString;
  }
