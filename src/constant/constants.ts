export const navigationCardsData = [
    {
        title: 'AI-Native North Star Architecture',
        subtitle: 'The AI Native North Star Architecture defines the target state of SAP\'s technology landscape. It is not a specification, roadmap, or promise of delivery. It is a direction of travel; a statement of how AI, data, processes, and the platform must work together as intelligence becomes the norm rather than an add-on.',
        icon: 'sap-icon://group',
        link: '/docs/nsa/',
        isNew: true,
        image: '/img/ArchitectureTabs/nsa.webp'
    },
    {
        title: 'Quick Start',
        subtitle: 'A no-code architecture editor designed to help users quickly publish reference architectures without using command-line tools.',
        icon: 'sap-icon://write-new-document',
        link: '/quick-start',
        image: '/img/ArchitectureTabs/quickstart.webp'
    },
    {
        title: 'Architecture Validator',
        subtitle: 'Upload, preview, and validate your .drawio architecture diagrams based on SAP best-practice guidelines.',
        icon: 'sap-icon://order-status',
        link: '/architecture-validator',
        requiresAuth: true,
        image: '/img/ArchitectureTabs/validator.webp'
    },
];

// Keep items sorted alphabetically by `title`
export const techDomain = [
    { id: 'appdev', title: 'Application Dev. & Automation', icon: 'sap-icon://syntax' },
    { id: 'ai', title: 'AI & Machine Learning', icon: 'sap-icon://da' },
    { id: 'data', title: 'Data & Analytics', icon: 'sap-icon://database' },
    { id: 'integration', title: 'Integration', icon: 'sap-icon://exit-full-screen' },
    { id: 'opsec', title: 'Operation & Security', icon: 'sap-icon://shield' },
];

// Keep items sorted alphabetically by `title`
export const techPartners = [
    { id: 'aws', title: 'Amazon Web Services' },
    { id: 'databricks', title: 'Databricks' },
    { id: 'gcp', title: 'Google Cloud Platform' },
    { id: 'ibm', title: 'IBM' },
    { id: 'azure', title: 'Microsoft Azure' },
    { id: 'nvidia', title: 'Nvidia' },
    { id: 'snowflake', title: 'Snowflake' },
];

export const addResData = [
    {
        title: 'Discovery Center',
        subtitle: 'Explore SAP use cases, misions, and services to accelerate cloud adoption and innovation.',
        link: 'https://discovery-center.cloud.sap/',
        logoLight: 'img/landingPage/SAPLogo.svg',
    },
    {
        title: 'SAP Solution Diagram',
        subtitle: 'The repository offers updates and templates for high-quality architectural diagrams.',
        link: 'https://sap.github.io/btp-solution-diagrams/',
        logoLight: 'img/landingPage/SAPLogo.svg',
    },
    {
        title: 'Terraform on SAP BTP',
        subtitle: 'Templates and guidance for provisioning and managing SAP BTP resources with Terraform.',
        link: 'https://sap-docs.github.io/terraform-landingpage-for-btp/',
        logoLight: 'img/landingPage/SAPLogo.svg',
    },
    {
        title: 'Amazon Web Services',
        subtitle: 'Reference architectures, best practices, and Well-Architected guidance for AWS workloads.',
        link: 'https://aws.amazon.com/architecture/',
        logoLight: 'img/landingPage/AC_AWS_Light_Logo.webp',
        logoDark: 'img/landingPage/AC_AWS_Dark_Logo.webp',
    },
    {
        title: 'Microsoft Azure',
        subtitle: 'Solution ideas, reference architectures, and design patterns for Azure cloud applications.',
        link: 'https://learn.microsoft.com/en-us/azure/architecture/',
        logoLight: 'img/landingPage/AC_Azure_Logo.webp',
    },
    {
        title: 'Google Cloud Platform',
        subtitle: 'Best practices and blueprints for designing and managing Google Cloud workloads.',
        link: 'https://cloud.google.com/architecture',
        logoLight: 'img/landingPage/AC_GCP_Logo.webp',
    },
];
