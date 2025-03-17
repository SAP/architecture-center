/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import {usePluralForm} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import {Card, CardHeader, Text, Icon, FlexBox, Tag, Label} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/dimension";
import "@ui5/webcomponents-icons/dist/action";

function useCategoryItemsPlural() {
  const {selectMessage} = usePluralForm();
  return (count) =>
    selectMessage(
      count,
      translate(
        {
          message: '1 item|{count} items',
          id: 'theme.docs.DocCard.categoryDescription.plurals',
          description:
            'The default description for a category card in the generated index about how many items this category includes',
        },
        {count},
      ),
    );
}
function CardLayout({ href, title, description, tags, lastUpdate }) {
  return (
      <Card
        style={{
          height: '360px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderRadius: '10px',
          overflow: 'visible',
          transition: 'all 0.3s ease-in-out',
          backgroundColor: 'var(--ifm-card-background)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => { window.location.href = href }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--ifm-hover-overlay)';
          e.currentTarget.style.boxShadow = '0px 6px 16px rgba(0, 112, 242, 0.4)';
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--ifm-card-background)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'none';
        }}
      >
      <CardHeader
        slot="header"
        interactive
        titleText={title}
        avatar={<Icon name="dimension" style={{ color: '#0070F2' }} />}
        wrappingType="Normal"
        style={{
          lineHeight: '1rem',
          pointerEvents: 'none'
        }}
      />
      <Text
          style={{
            padding: '0 16px',
            textAlign: 'left',
            flexGrow: 1,
            cursor: 'pointer',
            marginBottom: '20px'
          }}
      >
        {description}
      </Text>
      {/* Tags container */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '0 16px 16px 16px',
        }}
      >
        {tags?.map((tag, index) => (
          <Tag
            key={index}
            design="Information"
            hideStateIcon
            title={tag.description || tag.label}
          >
            {tag.label}
          </Tag>

        ))}
      </div>
      {/* Date */}
      <FlexBox
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Label style={{ marginRight: '7px' }}>
          {"Last Update: "}
        </Label>
        <Text>
          {lastUpdate
            ? new Date(lastUpdate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''}
        </Text>
      </FlexBox>
      <FlexBox
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.open(href, '_blank');
        }}
      >
      <Icon name="action" title="Open in a new window" style={{ color: '#0070F2' }} />
      </FlexBox>
    </Card>
  );
}

function CardCategory({item}) {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();
  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }
  return (
    <CardLayout
      href={href}
      title={item.label}
      description={item.description ?? categoryItemsPlural(item.items.length)}
    />
  );
}

function CardLink({item}) {
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      title={item.customProps.title}
      description={item.description ?? `${doc?.description.substring(0, 300)}...`}
      tags={item.customProps.tags}
      lastUpdate={item.customProps.last_update}
    />
  );
}

export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}