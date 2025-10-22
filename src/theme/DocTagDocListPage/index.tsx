import React, {type ReactNode} from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import type DocTagDocListPageType from '@theme/DocTagDocListPage';
import type {WrapperProps} from '@docusaurus/types';
import { useDocSidebarContext } from '@site/src/store/sidebar-store';

type Props = WrapperProps<typeof DocTagDocListPageType>;

export default function DocTagDocListPageWrapper(props: Props): ReactNode {
  const sidebarContext = useDocSidebarContext((state) => state.sidebarContext);
  console.log("sidebar context:", sidebarContext);

  return (
    <>
      <DocTagDocListPage {...props} />
    </>
  );
}
