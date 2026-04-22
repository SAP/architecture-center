# Scripts Documentation

This directory contains utility scripts for the SAP Architecture Center project.

## _generate-latest-news.js

### Purpose
Automatically generates a JSON file (`src/data/latest-news.json`) containing the latest 3 blog posts from the `blog/` directory. This data is used by the NewsSection component on the landing page.

### How It Works
1. Reads all `.md` files from the `blog/` directory
2. Parses frontmatter metadata from each blog post
3. Extracts date from filename (format: `YYYY-MM-DD-title.md`)
4. Sorts posts by date (newest first)
5. Takes the latest 3 posts
6. Generates formatted output with:
   - Title
   - Description
   - Date
   - Authors
   - Permalink
   - Image (if available)
   - Formatted date string

### When It Runs
The script runs automatically:
- **Before `npm run start`** - Ensures dev server has latest news data
- **Before `npm run build`** - Ensures production build has latest news data

### Manual Execution
You can also run the script manually:
```bash
npm run generate-news
```

Or directly:
```bash
node src/_scripts/_generate-latest-news.js
```

### Output Location
The script generates: `src/data/latest-news.json`

### Used By
- `src/sections/NewsSection.tsx` - Imports and displays the latest news on the landing page

### Dependencies
- `fs` - File system operations
- `path` - Path manipulation
- `gray-matter` - Frontmatter parsing (from `front-matter` package)

### Adding New Blog Posts
Simply add a new markdown file to the `blog/` directory with:
1. Filename format: `YYYY-MM-DD-title.md`
2. Frontmatter with `title`, `description`, and `authors` fields
3. Run `npm run generate-news` or restart the dev server

The latest 3 posts will automatically appear on the landing page!