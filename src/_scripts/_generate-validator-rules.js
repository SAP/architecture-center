const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Helper function to get OAuth 2.0 access token
async function getOAuthToken() {
  const authUrl = process.env.VALIDATOR_OAUTH_AUTH_URL;
  const clientId = process.env.VALIDATOR_OAUTH_CLIENT_ID;
  const clientSecret = process.env.VALIDATOR_OAUTH_CLIENT_SECRET;

  // Validate OAuth configuration
  if (!authUrl) {
    console.error('VALIDATOR_OAUTH_AUTH_URL is not set in environment variables');
    throw new Error('Missing OAuth auth URL configuration');
  }

  if (!clientId) {
    console.error('VALIDATOR_OAUTH_CLIENT_ID is not set in environment variables');
    throw new Error('Missing OAuth client ID configuration');
  }

  if (!clientSecret) {
    console.error('VALIDATOR_OAUTH_CLIENT_SECRET is not set in environment variables');
    throw new Error('Missing OAuth client secret configuration');
  }

  console.log('Fetching OAuth 2.0 access token...');

  try {
    // Prepare OAuth 2.0 client credentials request
    const tokenRequestData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const response = await axios.post(authUrl, tokenRequestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid OAuth response: missing access_token');
    }

    const token = response.data.access_token;
    const tokenType = response.data.token_type || 'Bearer';
    const expiresIn = response.data.expires_in;

    console.log(`Successfully obtained ${tokenType} token`);
    if (expiresIn) {
      console.log(`Token expires in ${expiresIn} seconds`);
    }

    return token;

  } catch (error) {
    console.error('Error fetching OAuth token:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    throw new Error(`OAuth token fetch failed: ${error.message}`);
  }
}

/**
 * Script to fetch validation rules from the validator API and generate a markdown file
 * with a table format in the community/Guidelines/ArchitectureValidator folder
 */

async function fetchValidationRules() {
  const apiUrl = process.env.VALIDATOR_RULES_API_URL;

  if (!apiUrl) {
    console.error('VALIDATOR_RULES_API_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('Fetching validation rules from:', apiUrl);

  try {
    // Get OAuth 2.0 access token
    const token = await getOAuthToken();

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Successfully fetched validation rules');

    // Handle the actual API response format
    const data = response.data;
    if (data && data.rules && Array.isArray(data.rules)) {
      return data.rules;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error fetching validation rules:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

function generateMarkdownTable(rules) {
  const header = `---
sidebar_position: 1
slug: /validation-rules
title: Architecture Validation Rules
description: Complete list of validation rules used by the Architecture Validator
sidebar_label: Architecture Validation Rules
keywords:
 - sap
 - architecture
 - validator
image: img/ac-soc-med.png
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: navyakhurana
  date: ${new Date().toISOString().split('T')[0]}
---

This document contains all the validation rules used by the Architecture Validator. These rules ensure that your architecture diagrams follow SAP best practices and guidelines.

## Validation Rules

| S.No. | Rule Name | Rule Description |
|-------|-----------|------------------|`;

  const rows = rules.map((rule, index) => {
    // Escape pipe characters in the content to prevent table formatting issues
    // Handle both possible property name formats (RULENAME/DESCRIPTION or ruleName/description)
    const ruleName = (rule.RULENAME || rule.ruleName || 'N/A').replace(/\|/g, '\\|');
    const description = (rule.DESCRIPTION || rule.description || 'N/A').replace(/\|/g, '\\|');

    return `| ${index + 1} | ${ruleName} | ${description} |`;
  });

  return [header, ...rows].join('\n') + '\n\n## Total Rules\n\nThis validator currently checks against **' + rules.length + '** validation rules.\n';
}

async function saveMarkdownFile(content) {
  const outputDir = path.join(__dirname, '../../community/Guidelines/ArchitectureValidator');
  const outputPath = path.join(outputDir, 'validation-rules.md');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Created directory:', outputDir);
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log('Markdown file saved to:', outputPath);
}

async function main() {
  try {
    console.log('Starting validation rules generator...');

    const rules = await fetchValidationRules();

    if (!Array.isArray(rules)) {
      console.error('API response is not an array:', typeof rules);
      process.exit(1);
    }

    console.log(`Processing ${rules.length} validation rules...`);

    const markdownContent = generateMarkdownTable(rules);
    await saveMarkdownFile(markdownContent);

    console.log('Successfully generated validation rules markdown file!');
    console.log(`Total rules processed: ${rules.length}`);

  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchValidationRules, generateMarkdownTable, saveMarkdownFile, getOAuthToken };
