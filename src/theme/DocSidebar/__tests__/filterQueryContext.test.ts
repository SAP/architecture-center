import { appendSidebarFilterQuery } from '../filterQueryContext';

describe('appendSidebarFilterQuery', () => {
  it('adds active filters to an internal sidebar link', () => {
    expect(appendSidebarFilterQuery('/docs/ref-arch/example', 'recent=true&archive=true')).toBe(
      '/docs/ref-arch/example?recent=true&archive=true'
    );
  });

  it('preserves an existing query and hash', () => {
    expect(appendSidebarFilterQuery('/docs/ref-arch/example?tab=details#flow', 'recent=true')).toBe(
      '/docs/ref-arch/example?tab=details&recent=true#flow'
    );
  });

  it('does not modify external or hash-only links', () => {
    expect(appendSidebarFilterQuery('https://example.com/docs', 'recent=true')).toBe(
      'https://example.com/docs'
    );
    expect(appendSidebarFilterQuery('#section', 'recent=true')).toBe('#section');
  });
});
