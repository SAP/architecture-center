# API usage (DocumentService)

Base URL (local): `http://localhost:4004`

Service root: `/quickstart/document-service`

The service exposes:

- `Documents`
- `Users`
- `DocumentContributors`
- action `assignDocumentContributors(documentId, contributors)`

Below are common frontend scenarios and the recommended call sequences.

## 1) Fetch “my documents” for the logged-in user

Goal: list documents where the current GitHub username is either the **author** or a **contributor**, including expanded user details.

Readable format (as you’d write it conceptually):

```text
/quickstart/document-service/Documents?$filter=author/ghUsername eq 'alice' or contributors/any(c:c/user/ghUsername eq 'alice')&$expand=author,contributors($expand=user)
```

Important: that string must be **URL-encoded** when used as an actual HTTP URL (at minimum: spaces as `%20`, quotes as `%27` if your client doesn’t handle them).

Example request (encoded so it works as a URL):

```http
GET /quickstart/document-service/Documents?$filter=author/ghUsername%20eq%20'alice'%20or%20contributors/any(c:c/user/ghUsername%20eq%20'alice')&$expand=author,contributors($expand=user)
```

Notes:

- `contributors/any(...)` is the OData way to express “at least one contributor matches”.
- If your HTTP client doesn’t auto-encode spaces, encode them as `%20` (as shown).
- The response contains `author_ID` (the user’s technical key) which the frontend can reuse when creating new documents.

## 2) Create a new document, then assign contributors (by GitHub username)

This is intentionally a **two-step** flow:

1) create the document with `POST /Documents`
2) overwrite its contributors with the custom action `assignDocumentContributors`

### Step 1: create the document

Use `author_ID` from the “my documents” fetch (scenario 1). This keeps the payload small and avoids the frontend having to resolve users by username.

```http
POST /quickstart/document-service/Documents
Content-Type: application/json

{
	"title": "My New Page",
	"description": "...",
	"author_ID": "A0B1C2D3-1111-4A11-8111-111111111111",
	"editorState": "{}"
}
```

The response includes the new document’s `ID`.

### Step 2: assign contributors (overwrites existing)

Call the action with a list of GitHub usernames. The backend will:

- create missing `Users` rows for usernames that don’t exist yet (treating `ghUsername` as a natural key at the API boundary)
- delete existing `DocumentContributors` rows for this document
- insert the new contributor set

```http
POST /quickstart/document-service/assignDocumentContributors
Content-Type: application/json

{
	"documentId": "<DOCUMENT_ID_FROM_STEP_1>",
	"contributors": ["bob", "fred"]
}
```

Tip: if you want “no contributors”, pass an empty array: `"contributors": []`.

## 3) Move a document as a subpage of another document

Update the document’s `parent_ID` via `PATCH`. The backend validates that the move does not create cycles.

```http
PATCH /quickstart/document-service/Documents(<CHILD_DOCUMENT_ID>)
Content-Type: application/json

{
	"parent_ID": "<NEW_PARENT_DOCUMENT_ID>"
}
```

To un-parent a document (make it a root page), set `parent_ID` to `null`:

```http
PATCH /quickstart/document-service/Documents(<CHILD_DOCUMENT_ID>)
Content-Type: application/json

{
	"parent_ID": null
}
```

## 4) Delete a document (including cascade delete of subpages)

Delete the document via `DELETE`. The service implementation performs a subtree delete:

- deletes nested subpages (all descendants, not only direct children)
- deletes the related `DocumentContributors` join rows

```http
DELETE /quickstart/document-service/Documents(<DOCUMENT_ID>)
```
