// Filename: src/scripts/generate-sidebar.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// --- Helper constants and functions ---
const indexFiles = ['readme.md', 'index.md'];

function cleanFolderName(name) {
  return name.replace(/^\d+-/, '');
}

/**
 * NEW: A robust, recursive function to sort and clean a list of sidebar items.
 * It removes the internal '_position' and '_name' properties from every level.
 * @param {Array} items - An array of "dirty" sidebar items.
 * @returns {Array} A "clean" array of items that will pass Docusaurus validation.
 */
function sortAndCleanItems(items) {
  // 1. Sort the current list of items based on _position, then _name.
  items.sort((a, b) => {
    const posA = a._position;
    const posB = b._position;
    const nameA = a._name;
    const nameB = b._name;
    
    if (posA !== undefined && posB !== undefined) {
      if (posA !== posB) return posA - posB;
    }
    if (posA !== undefined) return -1;
    if (posB !== undefined) return 1;
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });

  // 2. Map over the sorted list to produce the final, clean list.
  return items.map(item => {
    // Use object destructuring to pull out and discard the internal properties.
    const { _position, _name, ...restOfItem } = item;

    // If the item is a category, recursively clean its children
    // BEFORE returning the final category object.
    if (restOfItem.type === 'category' && Array.isArray(restOfItem.items)) {
      restOfItem.items = sortAndCleanItems(restOfItem.items);
    }

    // Return the cleaned item.
    return restOfItem;
  });
}


/**
 * Builds a "dirty" tree of sidebar items, including internal sorting properties.
 * This function NO LONGER does any sorting or cleaning itself.
 */
function buildSidebarItems(directoryPath, relativePathBase, isTopLevel = false) {
  const items = [];
  const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const dirent of dirents) {
    if (isTopLevel && indexFiles.includes(dirent.name.toLowerCase())) {
      continue;
    }

    const fullPath = path.join(directoryPath, dirent.name);

    if (dirent.isDirectory()) {
      const dirContents = fs.readdirSync(fullPath);
      const indexFileName = dirContents.find(f => indexFiles.includes(f.toLowerCase()));
      const otherContent = dirContents.filter(f => !indexFiles.includes(f.toLowerCase()));
      const cleanedDirName = cleanFolderName(dirent.name);
      const nextRelativePath = path.join(relativePathBase, cleanedDirName).replace(/\\/g, '/');

      if (otherContent.length === 0 && indexFileName) {
        const { data: frontMatter } = matter(fs.readFileSync(path.join(fullPath, indexFileName), 'utf8'));
        if (frontMatter.id) {
          items.push({
            type: 'doc',
            id: path.join(nextRelativePath, frontMatter.id).replace(/\\/g, '/'),
            label: frontMatter.sidebar_label || frontMatter.title,
            _position: frontMatter.sidebar_position,
            _name: dirent.name,
          });
        }
      } else if (dirContents.length > 0) {
        const subItems = buildSidebarItems(fullPath, nextRelativePath);
        let label = dirent.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let link = null;
        let position = undefined;

        if (indexFileName) {
          const { data: frontMatter } = matter(fs.readFileSync(path.join(fullPath, indexFileName), 'utf8'));
          label = frontMatter.sidebar_label || frontMatter.title || label;
          position = frontMatter.sidebar_position;
          
          if (frontMatter.id) {
            const fullDocId = path.join(nextRelativePath, frontMatter.id).replace(/\\/g, '/');
            link = { type: 'doc', id: fullDocId };
            // Add the "Overview" doc to the sub-items list so it can be sorted.
            subItems.push({
              type: 'doc',
              id: fullDocId,
              label: 'Overview',
              customProps: { frontMatter: { tags: frontMatter.tags || [] } },
              _position: -1,
              _name: indexFileName,
            });
          }
        }
        
        if (subItems.length > 0) {
          items.push({ type: 'category', label, link, items: subItems, _position: position, _name: dirent.name });
        }
      }
    } else if (dirent.isFile() && dirent.name.endsWith('.md')) {
      const { data: frontMatter } = matter(fs.readFileSync(fullPath, 'utf8'));
      if (frontMatter.id) {
        items.push({
          type: 'doc',
          id: path.join(relativePathBase, frontMatter.id).replace(/\\/g, '/'),
          label: frontMatter.sidebar_label || frontMatter.title,
          customProps: { frontMatter: { tags: frontMatter.tags || [] } },
          _position: frontMatter.sidebar_position,
          _name: dirent.name,
        });
      }
    }
  }
  return items;
}

// --- Main Script Execution ---
try {
  console.log('🚀 Starting sidebar generation...');
  
  const docsRoot = 'docs';
  const refArchDir = path.join(docsRoot, 'ref-arch');
  const outputFilePath = path.resolve('sidebars-refarch-generated.js');
  
  const subdirectories = fs.readdirSync(refArchDir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
    
  let raCategories = []; // This will be the top-level "dirty" array
  for (const dirName of subdirectories) {
    const readmePath = path.join(refArchDir, dirName, 'readme.md');
    if (fs.existsSync(readmePath)) {
      const { data: frontMatter } = matter(fs.readFileSync(readmePath, 'utf8'));
      if (frontMatter.id) {
        const initialRelativePath = path.join('ref-arch', dirName).replace(/\\/g, '/');
        const mainDocFullId = path.join(initialRelativePath, frontMatter.id).replace(/\\/g, '/');
        const subItems = buildSidebarItems(path.join(refArchDir, dirName), initialRelativePath, true);
        
        raCategories.push({
          type: 'category',
          label: frontMatter.sidebar_label || frontMatter.title,
          link: { type: 'doc', id: mainDocFullId },
          items: subItems,
          _position: frontMatter.sidebar_position,
          _name: dirName,
        });
        console.log(`✅ Processed main category: ${dirName}`);
      }
    }
  }

  // THE FINAL STEP: Take the entire dirty tree and clean it in one pass.
  const finalCleanedItems = sortAndCleanItems(raCategories);
  
  const sidebarConfig = {
    refarchSidebar: [{
      type: 'category',
      label: 'Reference Architecture',
      collapsible: false,
      items: finalCleanedItems,
    }],
  };
  
  const fileContent = `// @ts-check
// THIS FILE IS AUTOGENERATED. DO NOT EDIT.
// To update, run the script that generated this file.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = ${JSON.stringify(sidebarConfig, null, 2)};

module.exports = sidebars;
`;

  fs.writeFileSync(outputFilePath, fileContent, 'utf8');
  console.log(`\n✅ Sidebar generated successfully at ${outputFilePath}`);

} catch (error) {
  console.error('❌ Error during sidebar generation:', error);
  process.exit(1);
}
