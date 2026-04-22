import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  usePluralForm,
} from '@docusaurus/theme-common';
import Translate, {translate} from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import SearchMetadata from '@theme/SearchMetadata';

interface DocItemProps {
  doc: {
    id: string;
    title: string;
    description?: string;
    permalink: string;
    labels?: string[] | null;
  };
}

interface Props {
  tag: {
    label: string;
    description?: string;
    count: number;
    allTagsPath: string;
    unlisted?: boolean;
    items: Array<{
      id: string;
      title: string;
      description?: string;
      permalink: string;
      labels?: string[] | null;
    }>;
  };
}

function DocItem({doc}: DocItemProps): ReactNode {
  return (
    <article className="margin-vert--lg">
      <Link to={doc.permalink}>
        <Heading as="h2">{doc.title}</Heading>
      </Link>
      {doc.labels && doc.labels.length > 0 && (
        <div className="margin-bottom--sm" style={{
          fontSize: '0.8rem',
          color: 'var(--ifm-color-content-secondary)'
        }}>
          {doc.labels.join(' > ')}
        </div>
      )}
      {doc.description && <p>{doc.description}</p>}
    </article>
  );
}

function useNDocsTaggedPlural() {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.docs.tagDocListPageTitle.nDocsTagged',
          message: 'One doc tagged|{count} docs tagged',
          description: 'Pluralized label for "{count} docs tagged".',
        },
        {count},
      ),
    );
}

function usePageTitle(props: Props): string {
  const nDocsTaggedPlural = useNDocsTaggedPlural();
  return translate(
    {
      id: 'theme.docs.tagDocListPageTitle',
      message: '{nDocsTagged} with "{tagName}"',
      description: 'The title of the page for a docs tag',
    },
    {nDocsTagged: nDocsTaggedPlural(props.tag.count), tagName: props.tag.label},
  );
}

function DocTagDocListPageMetadata({
  title,
  tag,
}: Props & {title: string}): ReactNode {
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="doc_tag_doc_list" />
    </>
  );
}

function DocTagDocListPageContent({
  tag,
  title,
}: Props & {title: string}): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.page.docsTagDocListPage)}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--8 col--offset-2">
            {tag.unlisted && <div style={{color: 'var(--ifm-color-warning)', marginBottom: '1rem'}}>This page is unlisted</div>}
            <header className="margin-bottom--xl">
              <Heading as="h1">{title}</Heading>
              {tag.description && <p>{tag.description}</p>}
              <Link href={tag.allTagsPath}>
                <Translate
                  id="theme.tags.tagsPageLink"
                  description="The label of the link targeting the tag list page">
                  View all tags
                </Translate>
              </Link>
            </header>
            <section className="margin-vert--lg">
              {tag.items.map((doc) => (
                <DocItem key={doc.id} doc={doc} />
              ))}
            </section>
          </main>
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

export default function CustomDocTagDocListPage(props: Props): ReactNode {
  const title = usePageTitle(props);
  return (
    <>
      <DocTagDocListPageMetadata {...props} title={title} />
      <DocTagDocListPageContent {...props} title={title} />
    </>
  );
}
