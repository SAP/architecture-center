using { cuid, managed } from '@sap/cds/common';

namespace ac.quickstart;

  entity Documents: cuid, managed {
    title: String;
    description: String;
    parent: Association to Documents;
    tags: Array of String;
    // A GitHub username
    authors: String;
    contributors: Array of String;
    editorState: LargeString;
  }
