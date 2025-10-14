// Pull Request Template for Architecture Center submissions

const PR_TEMPLATE = `## What reference architecture does this PR apply to?

{{RA_NUMBER}} - {{TITLE}}

## Who should review your contribution? (Use @mention)

@cernus76 @navyakhurana @jmsrpp

## Checklist before submitting

-   [x] My commits are only for the reference architecture mentioned above.
-   [x] I have followed the folder structure in the [main README](../README.md)

---

_This pull request was automatically generated from the SAP Architecture Center Quick Start._`;

export const generatePRBody = (raNumber: string, title: string): string => {
    return PR_TEMPLATE.replace('{{RA_NUMBER}}', raNumber).replace('{{TITLE}}', title);
};

export const generateStandalonePRBody = (description?: string): string => {
    if (description) {
        return description;
    }

    return PR_TEMPLATE.replace(
        '{{RA_NUMBER}} - {{TITLE}}',
        'Please specify the RA number and title (e.g., RA0026 - Cloud Architecture Pattern)'
    ).replace('automatically generated', 'created via the Architecture Center publishing system');
};
