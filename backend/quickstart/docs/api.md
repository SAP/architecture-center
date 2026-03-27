# Document Service API

This API is used by Quickstart to store and manage documents, contributors, tags, and attached assets. It is implemented with SAP CAP (Cloud Application Programming Model) as an OData service. Persistent data is stored in SAP HANA Cloud.

## Endpoint Overview

- `GET /quickstart/document-service/Documents?$expand=author,contributors($expand=user),assets,tags($expand=tag)`
- `POST /quickstart/document-service/createNewDocument`
- `POST /quickstart/document-service/setDocumentContributors`
- `POST /quickstart/document-service/setDocumentTags`
- `POST /quickstart/document-service/DocumentAssets`
- `PUT /quickstart/document-service/DocumentAssets(<ASSET_ID>)/content`
- `GET /quickstart/document-service/DocumentAssets(<ASSET_ID>)/content`
- `DELETE /quickstart/document-service/Documents(<DOCUMENT_ID>)`

## Endpoint Details (REST Client Format)

### 1) Authentication for Testing

Two test users are available for API testing: `alice` and `bob`.

At the moment, requests use Basic authentication and the service executes actions on behalf of the authenticated user. Soon, this will be replaced by the Quickstart backend authentication flow via GitHub identity provider, where the user is derived from the decoded token.

Basic auth reminder:

- Send an `Authorization` header with `Basic <BASE64(username:password)>`
- Use one of the test usernames (`alice` or `bob`)
- Passwords are managed separately and are intentionally not documented here

Example header pattern:

```http
Authorization: Basic <BASE64(alice:<PASSWORD>)>
```

### 2) Read Documents for Current User

This is the main read endpoint. It returns only documents visible to the current user and expands related metadata.

```http
GET <BASE_URL>/quickstart/document-service/Documents?$expand=author,contributors($expand=user),assets,tags($expand=tag) HTTP/1.1
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>
```

### 3) Create a New Document

Creates a document and optionally sets contributors, tags, and editor state in one request.

```http
POST <BASE_URL>/quickstart/document-service/createNewDocument HTTP/1.1
Content-Type: application/json
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>

{
	"title": "<DOCUMENT_TITLE>",
	"description": "<DOCUMENT_DESCRIPTION>",
	"parentId": null,
	"tags": ["<TAG_CODE_1>", "<TAG_CODE_2>"],
	"contributorsUsernames": ["<CONTRIBUTOR_USERNAME_1>", "<CONTRIBUTOR_USERNAME_2>"],
	"editorState": "<EDITOR_STATE_JSON_AS_STRING>"
}
```

### 4) Overwrite Contributors of an Existing Document

Replaces the complete contributor set of a document.

```http
POST <BASE_URL>/quickstart/document-service/setDocumentContributors HTTP/1.1
Content-Type: application/json
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>

{
	"documentId": "<DOCUMENT_ID>",
	"contributorsUsernames": ["<CONTRIBUTOR_USERNAME_1>", "<CONTRIBUTOR_USERNAME_2>"]
}
```

### 5) Overwrite Tags of an Existing Document

Replaces the complete tag set of a document.

```http
POST <BASE_URL>/quickstart/document-service/setDocumentTags HTTP/1.1
Content-Type: application/json
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>

{
	"documentId": "<DOCUMENT_ID>",
	"tags": ["<TAG_CODE_1>", "<TAG_CODE_2>"]
}
```

### 6) Upload a Document Asset (Two Steps)

Document assets are modeled as metadata plus binary content:

- Metadata is stored on `DocumentAssets` (for example media type, filename, and document association)
- File bytes are uploaded separately to the media stream endpoint (`/content`)

Step 1: create the metadata row.

```http
POST <BASE_URL>/quickstart/document-service/DocumentAssets HTTP/1.1
Content-Type: application/json
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>

{
	"ID": "<ASSET_ID>",
	"mediaType": "application/vnd.jgraph.mxfile+xml",
	"filename": "<FILENAME>",
	"document_ID": "<DOCUMENT_ID>"
}
```

Step 2: upload the binary content to the media property.

```http
PUT <BASE_URL>/quickstart/document-service/DocumentAssets(<ASSET_ID>)/content HTTP/1.1
Content-Type: application/vnd.jgraph.mxfile+xml
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>

< ./assets/<DRAWIO_FILENAME>.drawio
```

JavaScript example for uploading a `.drawio` file:

```javascript
import { readFile } from 'node:fs/promises';

const baseUrl = '<BASE_URL>';
const assetId = '<ASSET_ID>';
const filePath = './assets/<DRAWIO_FILENAME>.drawio';
const username = '<USERNAME>';
const password = '<PASSWORD>';

const drawioContent = await readFile(filePath);
const auth = Buffer.from(`${username}:${password}`).toString('base64');

const response = await fetch(
	`${baseUrl}/quickstart/document-service/DocumentAssets(${assetId})/content`,
	{
		method: 'PUT',
		headers: {
			Authorization: `Basic ${auth}`,
			'Content-Type': 'application/vnd.jgraph.mxfile+xml'
		},
		body: drawioContent
	}
);

if (!response.ok) {
	throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
}
```

### 7) Download a Specific Document Asset

The expanded `Documents` read returns asset metadata only. To fetch the actual file bytes, call the asset content endpoint.

```http
GET <BASE_URL>/quickstart/document-service/DocumentAssets(<ASSET_ID>)/content HTTP/1.1
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>
Accept: <EXPECTED_MEDIA_TYPE>
```

### 8) Delete a Document

Deletes a document by ID.

```http
DELETE <BASE_URL>/quickstart/document-service/Documents(<DOCUMENT_ID>) HTTP/1.1
Authorization: Basic <BASE64(<USERNAME>:<PASSWORD>)>
```

## Authentication and Authorization Rules

- Authentication currently uses Basic auth for test users (`alice`, `bob`).
- Authorization is enforced per document.
- Authors can perform write operations on their own documents, including update, delete, and managing contributors, tags, and assets.
- Contributors have view access only for documents where they are assigned as contributors.
- Users who are neither author nor contributor cannot read the document.
