import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { createTagSidebarMapping } from '@site/src/utils/tagSidebarMapping';
import CustomDocTagDocListPage from './CustomDocTagDocListPage';
import useGlobalData from '@docusaurus/useGlobalData';

type Props = WrapperProps<typeof DocTagDocListPageType>;

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  try {
    // get sidebar context directly from global data (build-time)
    const globalData = useGlobalData();
    const tagsPluginData = globalData['docusaurus-tags-plugin'] as { default?: { sidebarContext?: any; communitySidebarContext?: any } } | undefined;
    const sidebarContext = tagsPluginData?.default?.sidebarContext;
    const communitySidebarContext = tagsPluginData?.default?.communitySidebarContext;
    // Detect navigation source by checking the allTagsPath
    const isNavigatingFromCommunity = props.tag?.allTagsPath?.includes('/community/') || false;

    let updatedProps = props;
    if (props.tag?.items) {
      try {
        // Navigated from Docs section
        if (!isNavigatingFromCommunity && sidebarContext?.refarchSidebar) {
          const updatedTagItems = createTagSidebarMapping(props.tag.items, sidebarContext.refarchSidebar);

          updatedProps = {
            ...props,
            tag: {
              ...props.tag,
              items: updatedTagItems
            }
          };
        } else {
          // Navigated from Community section
          console.log('Community Sidebar Context:', communitySidebarContext);
        }
      } catch (mappingError) {
        // Log error but continue with original props if mapping fails
        console.warn('Failed to create tag sidebar mapping:', mappingError);
        updatedProps = props;
      }
    }

    // use custom component when labels are available, otherwise use original
    const hasLabels = updatedProps.tag?.items?.some((item: any) => item.labels && item.labels.length > 0);
    
    return (
      <>
        {hasLabels ? (
          <CustomDocTagDocListPage {...(updatedProps as any)} />
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
