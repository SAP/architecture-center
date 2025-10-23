interface TagItem {
  id: string;
  title: string;
  description: string;
  permalink: string;
}

interface SidebarItem {
  href?: string;
  label: string;
  items?: SidebarItem[];
}

interface MappingResult {
  id: string;
  labels: string[];
}


function findMatchInSidebar(
  sidebarItems: SidebarItem[],
  tagItem: TagItem,
  currentLabels: string[] = []
): { found: boolean; labels: string[] } | null {
  for (const sidebarItem of sidebarItems) {
    const newLabels = [...currentLabels, sidebarItem.label];
    
    // match check on href/permalink instead of docId/id because sidebarItem's docId may not be present!
    if (sidebarItem.href && sidebarItem.href === tagItem.permalink) {
      return { found: true, labels: newLabels };
    }
    
    // search recursively in the nested items
    if (sidebarItem.items && sidebarItem.items.length > 0) {
      const result = findMatchInSidebar(sidebarItem.items, tagItem, newLabels);
      if (result && result.found) {
        return result;
      }
    }
  }
  
  return null;
}

export function createTagSidebarMapping(
  tagItems: TagItem[],
  sidebarItems: SidebarItem[]
): MappingResult[] {
  
  return tagItems.map((tagItem) => {
    const result = findMatchInSidebar(sidebarItems, tagItem);
    
    return {
      id: tagItem.id,
      title: tagItem.title,
      description: tagItem.description,
      permalink: tagItem.permalink,
      labels: result?.found ? result.labels : null
    };
  });
}
