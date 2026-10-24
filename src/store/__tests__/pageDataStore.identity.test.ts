import { authenticatedFetch } from '../../services/authSession';
import {
    activatePageDataIdentity,
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

describe('page data identity isolation', () => {
    afterEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
        mockedAuthenticatedFetch.mockReset();
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
});
