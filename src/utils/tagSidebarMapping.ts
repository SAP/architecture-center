interface TagItem {
  id: string;
  title: string;
  description: string;
  permalink: string;
}

interface SidebarItem {
  id?: string;
  href?: string;
  label: string;
  type: 'doc' | 'category';
  link?: { id: string; };
  items?: SidebarItem[];
}

interface MappingResult {
  id: string;
  title: string;
  description: string;
  permalink: string;
  labels: string[] | null;
}


function findMatchInSidebar(
  sidebarItems: SidebarItem[],
  tagItem: TagItem,
  currentLabels: string[] = []
): { found: boolean; labels: string[] } | null {
  for (const sidebarItem of sidebarItems) {
    const newLabels = [...currentLabels, sidebarItem.label];
    
    // match on ids based on sidebarItem.type: doc or category
    let isMatch = false;
    if (sidebarItem.type === 'doc' && sidebarItem.id) {
      isMatch = sidebarItem.id === tagItem.id;
    } else if (sidebarItem.type === 'category' && sidebarItem.link?.id) {
      isMatch = sidebarItem.link.id === tagItem.id;
    }
    
    if (isMatch) {
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
