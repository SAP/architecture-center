/* eslint-disable no-undef */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

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

describe('QuickstartService API (integration)', function () {
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
});

describe('QuickstartService API (authorization)', function () {
  this.timeout(20_000);

  let alice;
  let bob;
  let fred;

  before(async () => {
    alice = await createCsrfSession('alice');
    bob = await createCsrfSession('bob');
    fred = await createCsrfSession('fred');
  });

  it('does not expose Users directly', async () => {
    const { res } = await requestJson(alice, '/Users');
    assert.equal(res.status, 404);
  });

  it('rejects direct POST to Documents', async () => {
    const { res } = await requestJson(alice, '/Documents', {
      method: 'POST',
      body: {
        title: 'Should be rejected',
        description: 'Must use createNewDocument action',
        author_ID: 'A0B1C2D3-1111-4A11-8111-111111111111',
        editorState: '{}',
      },
    });

    assert.ok([403, 405].includes(res.status), `Expected direct POST /Documents to be rejected, got ${res.status}`);
  });

  it('enforces Tags as read-only', async () => {
    const tagCode = `AUTH-TAG-${crypto.randomUUID().slice(0, 8)}`.toUpperCase();

    const { res } = await requestJson(alice, '/Tags', {
      method: 'POST',
      body: {
        code: tagCode,
        label: 'Authorization Test Tag',
        description: 'Should not be creatable via API',
      },
    });

    assert.ok(res.status >= 400, `Expected write to @readonly Tags to fail, got ${res.status}`);
  });

  it('allows contributor read but blocks non-author writes', async () => {
    const { res: createRes, json: created } = await requestJson(alice, '/createNewDocument', {
      method: 'POST',
      body: {
        title: `Auth Test Doc ${crypto.randomUUID().slice(0, 8)}`,
        description: 'authorization test',
        parentId: null,
        tags: ['agents'],
        contributorsUsernames: ['bob'],
        editorState: '{}',
      },
    });

    assert.equal(createRes.status, 200);
    const documentId = created?.ID;
    assert.ok(documentId, 'Expected created document ID');

    const { res: contributorReadRes } = await requestJson(bob, `/Documents(${documentId})`);
    assert.equal(contributorReadRes.status, 200, 'Contributor should be able to read document');

    const { res: unrelatedReadRes } = await requestJson(fred, `/Documents(${documentId})`);
    assert.ok(
      [403, 404].includes(unrelatedReadRes.status),
      `Unrelated user should not read document, got ${unrelatedReadRes.status}`
    );

    const { res: contributorPatchRes } = await requestJson(bob, `/Documents(${documentId})`, {
      method: 'PATCH',
      body: {
        description: 'bob attempted update',
      },
    });
    assert.ok(
      [403, 404].includes(contributorPatchRes.status),
      `Contributor should not update document, got ${contributorPatchRes.status}`
    );

    const assetId = uuid();
    const { res: contributorAssetWriteRes } = await requestJson(bob, '/DocumentAssets', {
      method: 'POST',
      body: {
        ID: assetId,
        mediaType: 'image/png',
        filename: 'auth-test.png',
        document_ID: documentId,
      },
    });
    assert.ok(
      [403, 404].includes(contributorAssetWriteRes.status),
      `Contributor should not create document assets, got ${contributorAssetWriteRes.status}`
    );

    const { res: contributorTagWriteRes } = await requestJson(bob, '/DocumentTags', {
      method: 'POST',
      body: {
        document_ID: documentId,
        tag_code: 'data',
      },
    });
    assert.ok(
      [400, 403, 404].includes(contributorTagWriteRes.status),
      `Contributor should not create document tags, got ${contributorTagWriteRes.status}`
    );

    const { res: contributorContribWriteRes } = await requestJson(bob, '/setDocumentContributors', {
      method: 'POST',
      body: {
        documentId,
        contributorsUsernames: ['bob', 'fred'],
      },
    });
    assert.equal(contributorContribWriteRes.status, 403, 'Contributor should not change contributor list');
  });

  it('returns only documents visible to the current user in collection reads', async () => {
    const visibleToBob = await createDocumentViaAction(alice, {
      title: `Visible-To-Bob ${crypto.randomUUID().slice(0, 8)}`,
      contributorsUsernames: ['bob'],
    });

    const hiddenFromBob = await createDocumentViaAction(alice, {
      title: `Hidden-From-Bob ${crypto.randomUUID().slice(0, 8)}`,
      contributorsUsernames: [],
    });

    const { res, json } = await requestJson(bob, '/Documents');
    assert.equal(res.status, 200);
    assert.ok(json && Array.isArray(json.value), 'Expected OData collection response');

    const returnedIds = new Set(json.value.map((d) => d.ID));
    assert.ok(returnedIds.has(visibleToBob.ID), 'Expected bob-visible document to be in collection result');
    assert.ok(!returnedIds.has(hiddenFromBob.ID), 'Expected bob-hidden document to be filtered out from collection result');
  });
});
