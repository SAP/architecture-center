/* eslint-disable no-undef */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const BASE_URL = process.env.CAP_BASE_URL || 'http://localhost:4004';
const SERVICE_PATH = process.env.CAP_SERVICE_PATH || '/quickstart/document-service';
const SERVICE_URL = `${BASE_URL}${SERVICE_PATH}`;

function uuid() {
  return crypto.randomUUID().toUpperCase();
}

function basicAuthHeader(username) {
  return `Basic ${Buffer.from(`${username}:`).toString('base64')}`;
}

async function createCsrfSession(username = 'alice') {
  const authorization = basicAuthHeader(username);
  const res = await fetch(`${SERVICE_URL}/`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-csrf-token': 'fetch',
      authorization,
    },
  });

  // CAP typically responds with a token + session cookies if CSRF is enabled.
  const token = res.headers.get('x-csrf-token') || undefined;

  // Node's fetch (undici) supports getSetCookie(); fall back to single set-cookie.
  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);

  const cookie = setCookies
    .filter(Boolean)
    .map((c) => c.split(';')[0])
    .join('; ');

  return {
    token,
    cookie: cookie || undefined,
    authorization,
  };
}

async function requestJson(session, path, { method = 'GET', body } = {}) {
  const headers = {
    accept: 'application/json',
  };

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  if (session?.authorization) headers.authorization = session.authorization;
  if (session?.token) headers['x-csrf-token'] = session.token;
  if (session?.cookie) headers.cookie = session.cookie;

  const res = await fetch(`${SERVICE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const json = text ? safeJsonParse(text) : undefined;
  return { res, json, text };
}

async function requestRaw(session, requestPath, {
  method = 'GET',
  body,
  contentType,
  accept,
} = {}) {
  const headers = {};
  if (contentType) headers['content-type'] = contentType;
  if (accept) headers.accept = accept;

  if (session?.authorization) headers.authorization = session.authorization;
  if (session?.token) headers['x-csrf-token'] = session.token;
  if (session?.cookie) headers.cookie = session.cookie;

  const res = await fetch(`${SERVICE_URL}${requestPath}`, {
    method,
    headers,
    body,
  });

  const bytes = Buffer.from(await res.arrayBuffer());
  return { res, bytes };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

async function getDocumentById(session, id) {
  // OData usually returns 200 with { value: [] } if not found.
  const { res, json } = await requestJson(session, `/Documents?$filter=ID eq ${id}`);
  assert.equal(res.status, 200);
  assert.ok(json && Array.isArray(json.value));
  return json.value[0] || null;
}

async function createDocumentViaAction(
  session,
  {
    title,
    description = 'Created by integration test',
    parentId = null,
    tags = [],
    contributorsUsernames = [],
    editorState = '{}',
  } = {}
) {
  const { res, json } = await requestJson(session, '/createNewDocument', {
    method: 'POST',
    body: {
      title: title || `Doc ${crypto.randomUUID().slice(0, 8)}`,
      description,
      parentId,
      tags,
      contributorsUsernames,
      editorState,
    },
  });

  assert.equal(res.status, 200, `Expected action createNewDocument to succeed, got ${res.status}: ${JSON.stringify(json)}`);
  assert.ok(json?.ID, 'Expected createNewDocument to return document ID');
  return json;
}

describe('Document Service (integration)', function () {
  // Allow some time for local DB operations.
  this.timeout(20_000);

  let session;

  before(async () => {
    session = await createCsrfSession();
  });

  it('updates parent reference for authorized document writes', async () => {
    const createdRoot = await createDocumentViaAction(session, { title: 'Cycle Root' });
    const createdParent = await createDocumentViaAction(session, { title: 'New Parent' });
    const rootId = createdRoot.ID;
    const newParentId = createdParent.ID;

    const { res, json } = await requestJson(session, `/Documents(${rootId})`, {
      method: 'PATCH',
      body: {
        parent_ID: newParentId,
      },
    });

    assert.ok([200, 204].includes(res.status), `Expected 200 or 204, got ${res.status}: ${JSON.stringify(json)}`);

    const moved = await getDocumentById(session, rootId);
    assert.equal(moved?.parent_ID, newParentId, 'Expected parent to be updated');
  });

  it('creates a document with action, then assigns 2 contributors by username (upserts Users)', async () => {
    const u1 = `test-user-${crypto.randomUUID().slice(0, 8)}`;
    const u2 = `test-user-${crypto.randomUUID().slice(0, 8)}`;

    const created = await createDocumentViaAction(session, { title: 'Test Doc - Contributors' });
    const docId = created.ID;

    // 2) Assign contributors via custom action
    {
      const { res, json } = await requestJson(session, `/setDocumentContributors`, {
        method: 'POST',
        body: {
          documentId: docId,
          contributorsUsernames: [u1, u2],
        },
      });

      assert.equal(res.status, 200);
      assert.ok(json);
      const usernames = (json.contributors || [])
        .map((entry) => entry?.user?.username)
        .filter(Boolean);
      assert.ok(usernames.includes(u1), 'Expected contributor user1 to be in response');
      assert.ok(usernames.includes(u2), 'Expected contributor user2 to be in response');
    }

    // 3) Document exists
    const doc = await getDocumentById(session, docId);
    assert.ok(doc, 'Expected document to exist');

    // 4) Contributor assignment can be read back through the action response (which expands users)
  });

  it('deletes the targeted document', async () => {
    const parent = await createDocumentViaAction(session, { title: 'Cascade Parent' });
    const child = await createDocumentViaAction(session, { title: 'Cascade Child', parentId: parent.ID });
    const grandChild = await createDocumentViaAction(session, { title: 'Cascade Grandchild', parentId: child.ID });

    const parentId = parent.ID;
    const childId = child.ID;
    const grandChildId = grandChild.ID;

    // Delete only parent and verify it is gone.
    {
      const { res, json } = await requestJson(session, `/Documents(${parentId})`, { method: 'DELETE' });
      assert.ok([200, 202, 204].includes(res.status), `Delete failed: ${res.status} ${JSON.stringify(json)}`);
    }

    const deletedParent = await getDocumentById(session, parentId);
    assert.equal(deletedParent, null, 'Expected parent to be deleted');

    // Cleanup children created for this test.
    await requestJson(session, `/Documents(${childId})`, { method: 'DELETE' });
    await requestJson(session, `/Documents(${grandChildId})`, { method: 'DELETE' });
  });

  it('uploads and downloads a draw.io asset', async () => {
    const created = await createDocumentViaAction(session, {
      title: `Asset Drawio ${crypto.randomUUID().slice(0, 8)}`,
    });
    const documentId = created.ID;
    const assetId = uuid();
    const mediaType = 'application/vnd.jgraph.mxfile+xml';
    const filename = 'reference-architecture-generative-ai-basic.drawio';

    const { res: metaRes, json: metaJson } = await requestJson(session, '/DocumentAssets', {
      method: 'POST',
      body: {
        ID: assetId,
        mediaType,
        filename,
        document_ID: documentId,
      },
    });
    assert.ok([200, 201].includes(metaRes.status), `Asset metadata create failed: ${metaRes.status} ${JSON.stringify(metaJson)}`);

    const sourcePath = path.join(__dirname, 'assets', filename);
    const sourceBytes = await fs.readFile(sourcePath);

    const { res: uploadRes } = await requestRaw(session, `/DocumentAssets(${assetId})/content`, {
      method: 'PUT',
      body: sourceBytes,
      contentType: mediaType,
    });
    assert.ok([200, 204].includes(uploadRes.status), `Asset upload failed, got ${uploadRes.status}`);

    const { res: downloadRes, bytes: downloadedBytes } = await requestRaw(session, `/DocumentAssets(${assetId})/content`, {
      method: 'GET',
      accept: mediaType,
    });
    assert.equal(downloadRes.status, 200);
    assert.match(downloadRes.headers.get('content-type') || '', /application\/vnd\.jgraph\.mxfile\+xml/i);
    assert.equal(downloadedBytes.compare(sourceBytes), 0, 'Downloaded draw.io bytes must match uploaded content');
  });

  it('uploads and downloads a png asset', async () => {
    const created = await createDocumentViaAction(session, {
      title: `Asset Png ${crypto.randomUUID().slice(0, 8)}`,
    });
    const documentId = created.ID;
    const assetId = uuid();
    const mediaType = 'image/png';
    const filename = 'eda-sap.png';

    const { res: metaRes, json: metaJson } = await requestJson(session, '/DocumentAssets', {
      method: 'POST',
      body: {
        ID: assetId,
        mediaType,
        filename,
        document_ID: documentId,
      },
    });
    assert.ok([200, 201].includes(metaRes.status), `Asset metadata create failed: ${metaRes.status} ${JSON.stringify(metaJson)}`);

    const sourcePath = path.join(__dirname, 'assets', filename);
    const sourceBytes = await fs.readFile(sourcePath);

    const { res: uploadRes } = await requestRaw(session, `/DocumentAssets(${assetId})/content`, {
      method: 'PUT',
      body: sourceBytes,
      contentType: mediaType,
    });
    assert.ok([200, 204].includes(uploadRes.status), `Asset upload failed, got ${uploadRes.status}`);

    const { res: downloadRes, bytes: downloadedBytes } = await requestRaw(session, `/DocumentAssets(${assetId})/content`, {
      method: 'GET',
      accept: mediaType,
    });
    assert.equal(downloadRes.status, 200);
    assert.match(downloadRes.headers.get('content-type') || '', /image\/png/i);
    assert.equal(downloadedBytes.compare(sourceBytes), 0, 'Downloaded PNG bytes must match uploaded content');
  });
});
