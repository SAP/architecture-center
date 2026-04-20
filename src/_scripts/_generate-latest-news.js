/**
 * Script to generate a JSON file with all blog posts
 * This runs as part of the build process to make blog data available to the landing page
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Read all blog post files
const blogDir = path.join(__dirname, '../../news');
const outputPath = path.join(__dirname, '../data/latest-news.json');

// Ensure the data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Get all markdown files from blog directory
const files = fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const filePath = path.join(blogDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter } = matter(content);
        
        // Extract date and slug from filename (format: YYYY-MM-DD-slug.md)
        const dateMatch = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
        let date = '';
        let permalink = `/news/${file.replace('.md', '')}`;
        
        if (dateMatch) {
            const [, year, month, day, slug] = dateMatch;
            date = `${year}-${month}-${day}`;
            // Docusaurus blog URL format: /news/YYYY/MM/DD/slug
            permalink = `/news/${year}/${month}/${day}/${slug}`;
        }
        
        return {
            id: file.replace('.md', ''),
            title: frontMatter.title || 'Untitled',
            description: frontMatter.description || '',
            date: date || frontMatter.date || new Date().toISOString().split('T')[0],
            authors: frontMatter.authors || [],
            permalink: permalink,
            image: frontMatter.spotlight_image || frontMatter.image || null,
        };
    });

// Sort by date (newest first) - include all posts
const latestPosts = files
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(post => ({
        ...post,
        formattedDate: new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }));

// Write to JSON file
fs.writeFileSync(outputPath, JSON.stringify(latestPosts, null, 2));

console.log(`✅ Generated latest-news.json with ${latestPosts.length} posts`);
console.log('Posts:', latestPosts.map(p => `${p.date} - ${p.title}`).join('\n       '));