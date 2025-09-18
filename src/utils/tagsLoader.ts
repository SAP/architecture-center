export interface TagData {
    label: string;
    description: string;
}

export interface TagsData {
    [key: string]: TagData;
}

// Cache for loaded tags to avoid repeated file reads
let cachedTags: string[] | null = null;

/**
 * Simple YAML parser for our specific tags.yml format
 * This handles the basic structure we need without external dependencies
 */
function parseTagsYaml(yamlContent: string): TagsData {
    const result: TagsData = {};
    const lines = yamlContent.split('\n');
    let currentKey = '';
    let currentTag: Partial<TagData> = {};
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }
        
        // Check if this is a new tag key (no indentation, ends with colon)
        if (!line.startsWith(' ') && trimmedLine.endsWith(':')) {
            // Save previous tag if it exists
            if (currentKey && currentTag.label) {
                result[currentKey] = currentTag as TagData;
            }
            
            // Start new tag
            currentKey = trimmedLine.slice(0, -1); // Remove the colon
            currentTag = {};
        }
        // Check if this is a property (indented, contains colon)
        else if (line.startsWith(' ') && trimmedLine.includes(':')) {
            const colonIndex = trimmedLine.indexOf(':');
            const property = trimmedLine.substring(0, colonIndex).trim();
            let value = trimmedLine.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            if (property === 'label') {
                currentTag.label = value;
            } else if (property === 'description') {
                currentTag.description = value;
            }
        }
    }
    
    // Don't forget the last tag
    if (currentKey && currentTag.label) {
        result[currentKey] = currentTag as TagData;
    }
    
    return result;
}

/**
 * Loads and parses tags from the docs/tags.yml file
 * Returns an array of tag labels for use in the UI
 */
export async function loadAvailableTags(): Promise<string[]> {
    // Return cached tags if available
    if (cachedTags) {
        return cachedTags;
    }

    try {
        // Import the tags.yml file as raw text
        const response = await fetch('/docs/tags.yml');
        if (!response.ok) {
            throw new Error(`Failed to fetch tags.yml: ${response.statusText}`);
        }
        
        const yamlContent = await response.text();
        
        // Parse the YAML content using our custom parser
        const tagsData = parseTagsYaml(yamlContent);
        
        // Extract labels from the parsed data
        const tagLabels = Object.values(tagsData).map(tag => tag.label);
        
        // Cache the results
        cachedTags = tagLabels;
        
        return tagLabels;
    } catch (error) {
        console.error('Error loading tags from tags.yml:', error);
        
        // Fallback to hardcoded tags if loading fails
        return [
            'Generative AI',
            'Amazon Web Services',
            'Microsoft Azure',
            'Google Cloud Platform',
            'Application Development & Automation',
            'Data & Analytics',
        ];
    }
}

/**
 * Clears the tags cache - useful for testing or if tags need to be reloaded
 */
export function clearTagsCache(): void {
    cachedTags = null;
}
