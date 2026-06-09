import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { createTagSidebarMapping } from '@site/src/utils/tagSidebarMapping';
import CustomDocTagDocListPage from './CustomDocTagDocListPage';
import useGlobalData from '@docusaurus/useGlobalData';

type Props = WrapperProps<typeof DocTagDocListPageType>;

interface SidebarItem {
  id?: string;
  label: string;
  type: 'doc' | 'category';
  link?: { id: string; };
  items?: SidebarItem[];
}

interface SidebarContext {
  refarchSidebar?: SidebarItem[];
  communitySidebar?: SidebarItem[];
  goldenPathSidebar?: SidebarItem[];
  northStarSidebar?: SidebarItem[];
}

interface TagsPluginData {
  default?: {
    sidebarContext?: SidebarContext;
  };
}

interface TagItemWithLabels {
  id: string;
  title: string;
  description?: string;
  permalink: string;
  labels?: string[] | null;
}

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  try {
    // get sidebar context directly from global data (build-time)
    const globalData = useGlobalData();
    const tagsPluginData = globalData['docusaurus-tags-plugin'] as TagsPluginData | undefined;
    const sidebarContext = tagsPluginData?.default?.sidebarContext;

    let updatedProps = props;
    if (props.tag?.items && sidebarContext) {
      // Maps ID prefix to sidebar key
      const sidebarMapping: Record<string, keyof SidebarContext> = {
        'community/': 'communitySidebar',
        'ref-arch/': 'refarchSidebar',
        'golden-path/': 'goldenPathSidebar',
        'north-star-arch/': 'northStarSidebar',
      };

      // Process each item individually since a tag page may contain items from multiple sections
      const updatedTagItems: TagItemWithLabels[] = props.tag.items.map((item) => {
        // Find which sidebar to use for this specific item
        let targetSidebar: SidebarItem[] | undefined;
        for (const [prefix, sidebarKey] of Object.entries(sidebarMapping)) {
          if (item.id.startsWith(prefix)) {
            targetSidebar = sidebarContext[sidebarKey];
            break;
          }
        }

        // If no sidebar found, return item as-is
        if (!targetSidebar) {
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            permalink: item.permalink,
            labels: null
          };
        }

        // Map this single item with its appropriate sidebar
        const mappedItems = createTagSidebarMapping([item], targetSidebar);
        return mappedItems[0];
      });

      // Update props with items that have labels
      if (updatedTagItems.length > 0) {
        updatedProps = {
          ...props,
          tag: {
            ...props.tag,
            items: updatedTagItems as typeof props.tag.items
          }
        };
      }
    }

    // use custom component when labels are available, otherwise use original
    const hasLabels = updatedProps.tag?.items?.some((item) => {
      const typedItem = item as unknown as TagItemWithLabels;
      return typedItem.labels && typedItem.labels.length > 0;
    });

    return (
      <>
        {hasLabels ? (
          <CustomDocTagDocListPage {...(updatedProps as Parameters<typeof CustomDocTagDocListPage>[0])} />
        ) : (
          <DocTagDocListPage {...updatedProps} />
        )}
      </>
    );
  } catch (error) {
    // Fallback to original component if anything goes wrong
    console.warn('DocTagDocListPage wrapper encountered an error, falling back to original:', error);
    return <DocTagDocListPage {...props} />;
  }
}
