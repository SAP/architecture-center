const { createDocumentId } = require('./index');

describe('createDocumentId', () => {
    it('creates an ID for a document directly inside a reference architecture', () => {
        expect(createDocumentId('RA0042/readme.md', 'root-page')).toBe('ref-arch/RA0042/root-page');
    });

    it('preserves one nested directory and strips its numeric prefix', () => {
        expect(createDocumentId('RA0042/10-overview/readme.md', 'overview-page')).toBe(
            'ref-arch/RA0042/overview/overview-page'
        );
    });

    it('preserves every nested directory and strips each numeric prefix', () => {
        expect(createDocumentId('RA0042/10-third-party/2-copilot-studio/readme.md', 'copilot-page')).toBe(
            'ref-arch/RA0042/third-party/copilot-studio/copilot-page'
        );
    });

    it('normalizes Windows path separators', () => {
        expect(createDocumentId('RA0042\\10-third-party\\2-copilot-studio\\readme.md', 'copilot-page')).toBe(
            'ref-arch/RA0042/third-party/copilot-studio/copilot-page'
        );
    });
});
