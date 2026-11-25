import { authenticatedFetch } from '../../services/authSession';
import {
    activatePageDataIdentity,
    deactivatePageDataIdentity,
    getPageDataStorageKey,
    usePageDataStore,
    type Document,
} from '../pageDataStore';

jest.mock('../../services/authSession', () => ({
    authenticatedFetch: jest.fn(),
}));
jest.mock('uuid', () => ({ v4: jest.fn(() => 'generated-document-id') }));

const mockedAuthenticatedFetch = authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>;

function documentFor(username: string): Document {
    return {
        id: `${username}-document`,
        title: `${username} document`,
        tags: [],
        authors: [username],
        contributors: [],
        editorState: null,
        parentId: null,
        _synced: true,
    };
}

function persistedState(document: Document): string {
    return JSON.stringify({
        state: {
            documents: [document],
            lastSaveTimestamp: null,
            openDocumentIds: [document.id],
        },
        version: 0,
    });
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((settle) => { resolve = settle; });
    return { promise, resolve };
}

function remoteDocumentFor(username: string) {
    return {
        ID: documentFor(username).id,
        title: documentFor(username).title,
        author: { username },
    };
}

describe('page data identity isolation', () => {
    beforeEach(() => {
        deactivatePageDataIdentity();
        localStorage.clear();
    });

    afterEach(() => {
        deactivatePageDataIdentity();
        mockedAuthenticatedFetch.mockReset();
        jest.useRealTimers();
    });

    it('normalizes GitHub usernames in per-identity storage keys', () => {
        expect(getPageDataStorageKey(' Octo-Cat ')).toBe('docusaurus-editor-content:octo-cat');
    });

    it('rehydrates only the active identity and discards a stale fetch response', async () => {
        const aliceDocument = documentFor('alice');
        const bobDocument = documentFor('bob');
        localStorage.setItem('docusaurus-editor-content', persistedState(aliceDocument));
        localStorage.setItem(getPageDataStorageKey('alice'), persistedState(aliceDocument));
        localStorage.setItem(getPageDataStorageKey('bob'), persistedState(bobDocument));

        await expect(activatePageDataIdentity('alice')).resolves.toBe(true);
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        expect(usePageDataStore.getState().documents).toEqual([aliceDocument]);

        let resolveFetch!: (response: Response) => void;
        mockedAuthenticatedFetch.mockReturnValue(
            new Promise<Response>((resolve) => {
                resolveFetch = resolve;
            })
        );
        const staleFetch = usePageDataStore.getState().fetchDocuments();

        await expect(activatePageDataIdentity('bob')).resolves.toBe(true);
        usePageDataStore.getState().setBackendConfig('/api/backend', 'bob');
        expect(localStorage.getItem('docusaurus-editor-content')).toBeNull();
        expect(usePageDataStore.getState().documents).toEqual([bobDocument]);

        resolveFetch({
            ok: true,
            json: async () => ({ value: [{ ID: aliceDocument.id, title: aliceDocument.title }] }),
        } as Response);

        await expect(staleFetch).resolves.toBe(false);
        expect(usePageDataStore.getState().documents).toEqual([bobDocument]);
    });

    it('discards an old response after switching away from and back to the same identity', async () => {
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const response = deferred<Response>();
        mockedAuthenticatedFetch.mockReturnValue(response.promise);
        const staleFetch = usePageDataStore.getState().fetchDocuments();

        await activatePageDataIdentity('bob');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'bob');
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const currentDocument = { ...documentFor('alice'), title: 'Newer Alice document' };
        usePageDataStore.setState({ documents: [currentDocument] });

        response.resolve({
            ok: true,
            json: async () => ({ value: [remoteDocumentFor('alice')] }),
        } as Response);

        await expect(staleFetch).resolves.toBe(false);
        expect(usePageDataStore.getState().documents).toEqual([currentDocument]);
    });

    it('discards an operation response when identity changes while its body is being read', async () => {
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const body = deferred<{ appliedCount: number; lastOpId: string }>();
        const json = jest.fn(() => body.promise);
        mockedAuthenticatedFetch.mockResolvedValue({ ok: true, json } as unknown as Response);
        const staleSync = usePageDataStore.getState().syncOperations('alice-document', [{
            id: 'alice-operation',
            type: 'INSERT_TEXT',
            nodeKey: 'alice-node',
            timestamp: 1,
            payload: { text: 'Alice text' },
        }]);
        await Promise.resolve();
        expect(json).toHaveBeenCalledTimes(1);

        await activatePageDataIdentity('bob');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'bob');
        usePageDataStore.setState({ lastSaveTimestamp: 'Bob save time', isSyncing: true });
        body.resolve({ appliedCount: 1, lastOpId: 'alice-operation' });

        await expect(staleSync).resolves.toBeNull();
        expect(usePageDataStore.getState().lastSaveTimestamp).toBe('Bob save time');
        expect(usePageDataStore.getState().isSyncing).toBe(true);
    });

    it('discards a debounced save completion after the same identity starts a new activation', async () => {
        jest.useFakeTimers();
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const document = { ...documentFor('alice'), _synced: false };
        usePageDataStore.setState({ documents: [document] });
        const patch = deferred<Response>();
        mockedAuthenticatedFetch.mockReturnValue(patch.promise);
        await usePageDataStore.getState().syncDocument(document.id);
        jest.advanceTimersByTime(2000);
        expect(mockedAuthenticatedFetch).toHaveBeenCalledTimes(1);

        await activatePageDataIdentity('bob');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'bob');
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const currentDocument = { ...document, title: 'New Alice draft' };
        usePageDataStore.setState({ documents: [currentDocument], lastSaveTimestamp: 'New save time' });
        patch.resolve({ ok: true } as Response);
        await Promise.resolve();

        expect(usePageDataStore.getState().documents).toEqual([currentDocument]);
        expect(usePageDataStore.getState().lastSaveTimestamp).toBe('New save time');
    });

    it('deactivates without losing the draft and cancels queued saves and old responses', async () => {
        jest.useFakeTimers();
        await activatePageDataIdentity('alice');
        usePageDataStore.getState().setBackendConfig('/api/backend', 'alice');
        const document = documentFor('alice');
        usePageDataStore.setState({ documents: [document] });
        const response = deferred<Response>();
        mockedAuthenticatedFetch.mockReturnValue(response.promise);
        const staleFetch = usePageDataStore.getState().fetchDocuments();
        await usePageDataStore.getState().syncDocument(document.id);

        deactivatePageDataIdentity();
        jest.advanceTimersByTime(3000);
        response.resolve({
            ok: true,
            json: async () => ({ value: [remoteDocumentFor('alice')] }),
        } as Response);

        await expect(staleFetch).resolves.toBe(false);
        expect(mockedAuthenticatedFetch).toHaveBeenCalledTimes(1);
        expect(usePageDataStore.getState().documents).toEqual([]);
        expect(usePageDataStore.getState().backendUrl).toBeNull();
        expect(usePageDataStore.getState().currentUsername).toBeNull();
        expect(JSON.parse(localStorage.getItem(getPageDataStorageKey('alice'))!).state.documents).toEqual([document]);
    });
});
