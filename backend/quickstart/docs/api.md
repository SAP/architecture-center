# Document Service API

This API is used by Quickstart to store and manage documents, contributors, tags, and attached assets. It is implemented with SAP CAP (Cloud Application Programming Model) as an OData service. Persistent data is stored in SAP HANA Cloud.

Authentication is token-based. Clients authenticate through the backend GitHub OAuth flow and then call the API with a Bearer JWT.

## Endpoint Overview

- `GET /quickstart/document-service/Documents?$expand=author,contributors($expand=user),assets,tags($expand=tag)`
- `POST /quickstart/document-service/createNewDocument`
- `POST /quickstart/document-service/setDocumentContributors`
- `POST /quickstart/document-service/setDocumentTags`
- `POST /quickstart/document-service/DocumentAssets`
- `PUT /quickstart/document-service/DocumentAssets(<ASSET_ID>)/content`
- `GET /quickstart/document-service/DocumentAssets(<ASSET_ID>)/content`
- `DELETE /quickstart/document-service/Documents(<DOCUMENT_ID>)`

## Authentication Flow

Obtain a JWT through GitHub OAuth:

- `GET /user/login?origin_uri=<FRONTEND_RETURN_URL>`
- `GET /user/github/callback` (called by GitHub after consent)

After successful login, the backend redirects to `origin_uri` with a `token` query parameter. Use this token in all protected API calls:

```http
Authorization: Bearer <JWT_FROM_GITHUB_CALLBACK>
```

## Authorization Model

- The CAP service requires an authenticated user.
- Authors can update/delete their own documents and manage contributors, tags, and assets.
- Contributors have read access only.
- Users who are neither author nor contributor cannot access the document.

## Endpoint Details (REST Client Format)

### 1) Read Documents for Current User

This is the main read endpoint. It returns only documents visible to the current user and expands related metadata.

```http
GET <BASE_URL>/quickstart/document-service/Documents?$expand=author,contributors($expand=user),assets,tags($expand=tag) HTTP/1.1
Authorization: Bearer <JWT>
```

### 2) Create a New Document

Creates a document and optionally sets contributors, tags, and editor state in one request.

```http
POST <BASE_URL>/quickstart/document-service/createNewDocument HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

{
	"title": "<DOCUMENT_TITLE>",
	"description": "<DOCUMENT_DESCRIPTION>",
	"parentId": null,
	"tags": ["<TAG_CODE_1>", "<TAG_CODE_2>"],
	"contributorsUsernames": ["<CONTRIBUTOR_USERNAME_1>", "<CONTRIBUTOR_USERNAME_2>"],
	"editorState": "<EDITOR_STATE_JSON_AS_STRING>"
}
```

### 3) Overwrite Contributors of an Existing Document

Replaces the complete contributor set of a document.

```http
POST <BASE_URL>/quickstart/document-service/setDocumentContributors HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

{
	"documentId": "<DOCUMENT_ID>",
	"contributorsUsernames": ["<CONTRIBUTOR_USERNAME_1>", "<CONTRIBUTOR_USERNAME_2>"]
}
```

### 4) Overwrite Tags of an Existing Document

Replaces the complete tag set of a document.

```http
POST <BASE_URL>/quickstart/document-service/setDocumentTags HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

{
	"documentId": "<DOCUMENT_ID>",
	"tags": ["<TAG_CODE_1>", "<TAG_CODE_2>"]
}
```

### 5) Upload a Document Asset (Two Steps)

Document assets are modeled as metadata plus binary content:

- Metadata is stored on `DocumentAssets` (for example media type, filename, and document association)
- File bytes are uploaded separately to the media stream endpoint (`/content`)

Step 1: create the metadata row.

```http
POST <BASE_URL>/quickstart/document-service/DocumentAssets HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

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
Authorization: Bearer <JWT>

< ./assets/<DRAWIO_FILENAME>.drawio
```

JavaScript example for uploading a `.drawio` file:

```javascript
import { readFile } from 'node:fs/promises';

const baseUrl = '<BASE_URL>';
const assetId = '<ASSET_ID>';
const filePath = './assets/<DRAWIO_FILENAME>.drawio';
const jwt = '<JWT_FROM_GITHUB_CALLBACK>';

const drawioContent = await readFile(filePath);

const response = await fetch(
	`${baseUrl}/quickstart/document-service/DocumentAssets(${assetId})/content`,
	{
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/vnd.jgraph.mxfile+xml'
		},
		body: drawioContent
	}
);

if (!response.ok) {
	throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
}
```

### 6) Download a Specific Document Asset

The expanded `Documents` read returns asset metadata only. To fetch the actual file bytes, call the asset content endpoint.

```http
GET <BASE_URL>/quickstart/document-service/DocumentAssets(<ASSET_ID>)/content HTTP/1.1
Authorization: Bearer <JWT>
Accept: <EXPECTED_MEDIA_TYPE>
```

### 7) Delete a Document

Deletes a document by ID.

```http
DELETE <BASE_URL>/quickstart/document-service/Documents(<DOCUMENT_ID>) HTTP/1.1
Authorization: Bearer <JWT>
```
