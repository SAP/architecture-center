import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { createTagSidebarMapping } from '@site/src/utils/tagSidebarMapping';
import CustomDocTagDocListPage from './CustomDocTagDocListPage';
import useGlobalData from '@docusaurus/useGlobalData';

type Props = WrapperProps<typeof DocTagDocListPageType>;

interface SidebarContext {
  refarchSidebar?: unknown;
}

interface CommunitySidebarContext {
  communitySidebar?: unknown;
}

interface TagsPluginData {
  default?: {
    sidebarContext?: SidebarContext;
    communitySidebarContext?: CommunitySidebarContext;
  };
}

interface TagItem {
  labels?: string[];
}

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  try {
    // get sidebar context directly from global data (build-time)
    const globalData = useGlobalData();
    const tagsPluginData = globalData['docusaurus-tags-plugin'] as TagsPluginData | undefined;
    const sidebarContext = tagsPluginData?.default?.sidebarContext;
    const communitySidebarContext = tagsPluginData?.default?.communitySidebarContext;
    // Detect navigation source by checking the allTagsPath
    const isNavigatingFromCommunity = props.tag?.allTagsPath?.includes('/community/') || false;

    let updatedProps = props;
    if (props.tag?.items) {
      let updatedTagItems: typeof props.tag.items = [];
      // Navigated from Docs section
      if (!isNavigatingFromCommunity && sidebarContext?.refarchSidebar) {
        updatedTagItems = createTagSidebarMapping(props.tag.items, sidebarContext.refarchSidebar);
      }
      // Navigated from Community section
      else if (isNavigatingFromCommunity && communitySidebarContext?.communitySidebar) {
        updatedTagItems = createTagSidebarMapping(props.tag.items, communitySidebarContext.communitySidebar);
      }

      if (updatedTagItems.length > 0) {
        updatedProps = {
          ...props,
          tag: {
            ...props.tag,
            items: updatedTagItems
          }
        };
      }
    }

    // use custom component when labels are available, otherwise use original
    const hasLabels = updatedProps.tag?.items?.some((item: TagItem) => item.labels && item.labels.length > 0);

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
