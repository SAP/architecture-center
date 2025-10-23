import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { useDocSidebarContext } from '@site/src/store/sidebar-store';
import { createTagSidebarMapping } from '@site/src/utils/tagSidebarMapping';

type Props = WrapperProps<typeof DocTagDocListPageType>;

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  // fetch sidebar context from sidebar-store
  const sidebarContext = useDocSidebarContext((state) => state.sidebarContext);

  let updatedProps = props;
  if (props.tag?.items && sidebarContext?.items) {
    // create an updated tag items array including labels by mapping tag items against sidebar items
    const updatedTagItems = createTagSidebarMapping(props.tag.items, sidebarContext.items);

    updatedProps = {
      ...props,
      tag: {
        ...props.tag,
        items: updatedTagItems
      }
    };
  }
  console.log("page context:", updatedProps);

  return (
    <>
      <DocTagDocListPage {...updatedProps} />
    </>
  );
}
