export const navigationCardsData = [
    { title: 'Browse Architectures', icon: 'document-text', link: '/docs/ref-arch/demo' },
    {
        title: 'Architecture Validator',
        icon: 'sap-icon://order-status',
        link: '/ArchitectureValidator',
        requiresAuth: true,
    },
    { title: 'Quick Start', icon: 'sap-icon://write-new-document', link: '/quickStart' },
    { title: 'Solution Diagram Guidelines', icon: 'sap-icon://learning-assistant', link: '' },
    { title: 'Community of Practice', icon: 'sap-icon://group', link: '/community/intro' },
    { title: "What's new", icon: 'sap-icon://marketing-campaign', link: '/blog' },
];

export const techDomain = [
    { id: 'ai', title: 'AI & Machine Learning', icon: 'sap-icon://da' },
    { id: 'data', title: 'Data & Analytics', icon: 'sap-icon://database' },
    { id: 'opsec', title: 'Operation & Security', icon: 'sap-icon://shield' },
    { id: 'appdev', title: 'Application Dev. & Automation', icon: 'sap-icon://syntax' },
    { id: 'integration', title: 'Integration', icon: 'sap-icon://exit-full-screen' },
];

export const addResData = [
    {
        title: 'Terraform on SAP BTP',
        subtitle: 'Templates and guidance for provisioning and managing SAP BTP resources with Terraform.',
        link: 'https://sap-docs.github.io/terraform-landingpage-for-btp/',
        logoLight: 'img/landingPage/SAPLogo.svg',
    },
    {
        title: 'Discovery Center',
        subtitle: 'Explore SAP use cases, misions, and services to accelerate cloud adoption and innovation.',
        link: 'https://discovery-center.cloud.sap/',
        logoLight: 'img/landingPage/SAPLogo.svg',
    },
    {
        title: 'SAP Business Accelerator Hub',
        subtitle: 'APIs, integration content, and events to extend and connect SAP solutions.',
        link: 'https://hub.sap.com/',
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
        subtitle: 'Best practices, topologies, and blueprints for designing and managing Google Cloud workloads.',
        link: 'https://cloud.google.com/architecture',
        logoLight: 'img/landingPage/AC_GCP_Logo.webp',
    },
];
