/* eslint-disable no-undef */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const BASE_URL = process.env.CAP_BASE_URL || 'http://localhost:4004';
const SERVICE_PATH = process.env.CAP_SERVICE_PATH || '/quickstart';
const SERVICE_URL = `${BASE_URL}${SERVICE_PATH}`;

// Seeded user IDs from db/data/ac.quickstart-Users.csv
const ALICE_ID = 'A0B1C2D3-1111-4A11-8111-111111111111';

// Seeded document IDs from db/data/ac.quickstart-Documents.csv (Root C and its child)
const ROOT_C_ID = '4EE42BB0-6C39-46F5-B529-67C7735DB043';
const C_PAGE_1_ID = 'BF0177B7-12EB-4EF8-87B8-EEBAB81CAD02';

function uuid() {
  return crypto.randomUUID().toUpperCase();
}

async function createCsrfSession() {
  const res = await fetch(`${SERVICE_URL}/`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-csrf-token': 'fetch',
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
  };
}

async function requestJson(session, path, { method = 'GET', body } = {}) {
  const headers = {
    accept: 'application/json',
  };

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

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

async function getUserByGhUsername(session, ghUsername) {
  const encoded = encodeURIComponent(`ghUsername eq '${ghUsername}'`);
  const { res, json } = await requestJson(session, `/Users?$filter=${encoded}`);
  assert.equal(res.status, 200);
  assert.ok(json && Array.isArray(json.value));
  return json.value[0] || null;
}

describe('QuickstartService API (integration)', function () {
  // Allow some time for local DB operations.
  this.timeout(20_000);

  let session;

  before(async () => {
    session = await createCsrfSession();
  });

  it('prevents document move that would create a cycle', async () => {
    const { res, json } = await requestJson(session, `/Documents(${ROOT_C_ID})`, {
      method: 'PATCH',
      body: {
        parent_ID: C_PAGE_1_ID,
      },
    });

    assert.equal(res.status, 400);
    const msg = json?.error?.message || json?.error?.message?.value || JSON.stringify(json);
    assert.match(String(msg), /cycle/i);
  });

  it('creates a document, then assigns 2 contributors by ghUsername (upserts Users)', async () => {
    const docId = uuid();
    const u1 = `test-user-${crypto.randomUUID().slice(0, 8)}`;
    const u2 = `test-user-${crypto.randomUUID().slice(0, 8)}`;

    // 1) Create document with existing author_ID
    {
      const { res, json } = await requestJson(session, `/Documents`, {
        method: 'POST',
        body: {
          ID: docId,
          title: 'Test Doc - Contributors',
          description: 'Created by integration test',
          author_ID: ALICE_ID,
          editorState: '{}',
        },
      });

      assert.ok([200, 201].includes(res.status), `Expected 200/201, got ${res.status}: ${JSON.stringify(json)}`);
    }

    // 2) Assign contributors via custom action
    {
      const { res, json } = await requestJson(session, `/assignDocumentContributors`, {
        method: 'POST',
        body: {
          documentId: docId,
          contributors: [u1, u2],
        },
      });

      assert.equal(res.status, 200);
      assert.ok(json);
    }

    // 3) Document exists
    const doc = await getDocumentById(session, docId);
    assert.ok(doc, 'Expected document to exist');

    // 4) Users exist (were created if missing)
    const user1 = await getUserByGhUsername(session, u1);
    const user2 = await getUserByGhUsername(session, u2);
    assert.ok(user1, 'Expected contributor user1 to exist');
    assert.ok(user2, 'Expected contributor user2 to exist');
  });

  it('deletes a document and all nested subpages', async () => {
    const parentId = uuid();
    const childId = uuid();
    const grandChildId = uuid();

    // Create a small 3-level tree.
    for (const [id, parent_ID, title] of [
      [parentId, null, 'Cascade Parent'],
      [childId, parentId, 'Cascade Child'],
      [grandChildId, childId, 'Cascade Grandchild'],
    ]) {
      const body = {
        ID: id,
        title,
        description: 'Created by integration test',
        author_ID: ALICE_ID,
        editorState: '{}',
      };
      if (parent_ID) body.parent_ID = parent_ID;

      const { res, json } = await requestJson(session, `/Documents`, { method: 'POST', body });
      assert.ok([200, 201].includes(res.status), `Create failed (${id}): ${res.status} ${JSON.stringify(json)}`);
    }

    // Delete parent; service should delete entire subtree.
    {
      const { res, json } = await requestJson(session, `/Documents(${parentId})`, { method: 'DELETE' });
      assert.ok([200, 202, 204].includes(res.status), `Delete failed: ${res.status} ${JSON.stringify(json)}`);
    }

    const parent = await getDocumentById(session, parentId);
    const child = await getDocumentById(session, childId);
    const grandChild = await getDocumentById(session, grandChildId);

    assert.equal(parent, null, 'Expected parent to be deleted');
    assert.equal(child, null, 'Expected child to be deleted');
    assert.equal(grandChild, null, 'Expected grandchild to be deleted');
  });
});
