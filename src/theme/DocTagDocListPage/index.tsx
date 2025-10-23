import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { useDocSidebarContext } from '@site/src/store/sidebar-store';
import { createTagSidebarMapping } from '@site/src/utils/tagSidebarMapping';

type Props = WrapperProps<typeof DocTagDocListPageType>;

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  console.log("page context:", props);

  const sidebarContext = useDocSidebarContext((state) => state.sidebarContext);
  console.log("sidebar context:", sidebarContext);

  if (props.tag?.items && sidebarContext?.items) {
    // create an updated tag items array include labels by mapping tag items and sidebar context
    const updatedTagItems = createTagSidebarMapping(props.tag.items, sidebarContext.items);
    console.log("tag items with labels:", updatedTagItems);
  }

  return (
    <>
      <DocTagDocListPage {...props} />
    </>
  );
}
