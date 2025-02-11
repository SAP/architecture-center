import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import jsonSchema from '@site/src/_scripts/_generatedIndexCategories.json';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';

const Explore = () => {
    const docsData = useDocsData();
    const [filters, setFilters] = useState([]);
    const [filteredDocs, setFilteredDocs] = useState([]);

    useEffect(() => {
        if (!docsData || !docsData.versions?.[0]?.docs) return;

        let docs = docsData.versions[0].docs;
        console.log("Docs Data (without frontMatter):", docs);

        const categoriesMap = Object.fromEntries(
            jsonSchema.generatedIndexes.map((category) => [
                category.link.slug, // Slug is the key
                category.customProps.id, // ID is the value
            ])
        );

        console.log("Categories Map (slug to ID):", categoriesMap);

        const enrichedDocs = docs.map((doc) => {
            const matchingCategory = Object.entries(categoriesMap).find(([slug]) => 
                doc.path.startsWith(slug) // Match based on slug instead of ID
            );

            return {
                ...doc,
                frontMatter: matchingCategory ? {
                    title: matchingCategory[1], // Use category ID as title
                    description: `Documents in category: ${matchingCategory[1]}`,
                    category_index: [matchingCategory[1]], // Store matched category index
                } : null,
            };
        });

        console.log("Enriched Docs (with frontMatter):", enrichedDocs);

        // Filter by `category_index`
        let categoryFilteredDocs = enrichedDocs.filter((doc) =>
            doc.frontMatter?.category_index?.some((category) =>
                Object.values(categoriesMap).includes(category)
            )
        );

        console.log("Docs After Filtering by `category_index`:", categoryFilteredDocs);

        // Apply user-selected filters
        if (filters.length > 0) {
            categoryFilteredDocs = categoryFilteredDocs.filter((doc) =>
                filters.some((filter) =>
                    doc.frontMatter?.category_index?.includes(filter)
                )
            );
        }

        console.log("Final Filtered Docs:", categoryFilteredDocs);
        setFilteredDocs(categoryFilteredDocs);
    }, [filters, docsData]);

    return (
        <Layout title="Explore">
            <div className="container">
                <h1>Explore Reference Architectures</h1>

                {/* Filtering UI */}
                <div className="filters">
                    <h3>Filter by Category:</h3>
                    {jsonSchema.generatedIndexes.map((category) => (
                        <label key={category.customProps.id}>
                            <input
                                type="checkbox"
                                checked={filters.includes(category.customProps.id)}
                                onChange={() => {
                                    setFilters((prev) => {
                                        if (prev.includes(category.customProps.id)) {
                                            return prev.filter((id) => id !== category.customProps.id);
                                        } else {
                                            return [...prev, category.customProps.id];
                                        }
                                    });
                                }}
                            />
                            {category.label} {/* Show category label */}
                        </label>
                    ))}
                </div>

                {/* Display Filtered Docs */}
                <div className="cards">
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map((doc) => (
                            <div key={doc.id} className="card">
                                <h2>{doc.frontMatter?.title || doc.id}</h2>
                                <p>{doc.frontMatter?.description || 'No description available'}</p>
                                <a href={doc.path}>Read More</a>
                            </div>
                        ))
                    ) : (
                        <p>No results found.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Explore;
