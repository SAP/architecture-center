// Pull Request Template for Architecture Center submissions

import * as fs from 'fs';
import * as path from 'path';

const loadPRTemplate = (): string => {
    const templatePath = path.join(__dirname, 'prTemplate.md');
    return fs.readFileSync(templatePath, 'utf-8');
};

export const generatePRBody = (raNumber: string, title: string): string => {
    const template = loadPRTemplate();
    return template.replace('{{RA_NUMBER}}', raNumber).replace('{{TITLE}}', title);
};

export const generateStandalonePRBody = (description?: string): string => {
    if (description) {
        return description;
    }

    const template = loadPRTemplate();
    return template
        .replace(
            '{{RA_NUMBER}} - {{TITLE}}',
            'Please specify the RA number and title (e.g., RA0026 - Cloud Architecture Pattern)'
        )
        .replace('automatically generated', 'created via the Architecture Center publishing system');
};
