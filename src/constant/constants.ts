export const navigationCardsData = [

    {
        title: 'AI-Native North Star Architecture',
        tabLabel: 'AI-Native North Star Architecture',
        subtitle: 'The AI Native North Star Architecture defines the target state of SAP\'s technology landscape. It is not a specification, roadmap, or promise of delivery. It is a direction of travel; a statement of how AI, data, processes, and the platform must work together as intelligence becomes the norm rather than an add-on.',
        icon: 'sap-icon://initiative',
        link: '/docs/ai-native-north-star-architecture',
        isNew: true,
        image: '/img/ArchitectureTabs/nsa.webp'
    },
    {
        title: 'AI Golden Path',
        tabLabel: 'AI Golden Path',
        subtitle: 'The SAP\'s AI Golden Path is the starting point for developing AI applications across the SAP ecosystem. It contains recommendations, best practices, and tutorials to help you understand the AI technology stack, identify suitable tools and services, and design, deliver, and extend enterprise-grade AI solutions on SAP technology.',
        icon: 'sap-icon://initiative',
        link: '/docs/ai-golden-path',
        isNew: true,
        image: '/img/ArchitectureTabs/aigoldenpath.webp'
    },
    /*{
        title: 'Quick Start',
        subtitle: 'Quick Start is a no-code architecture editor for publishing reference architectures without command-line tools. Users can sign in with GitHub, create content in a rich-text editor or import Word files as Markdown, and add text, images, and Draw.io diagrams.',
        icon: 'sap-icon://write-new-document',
        link: '/quick-start',
        image: '/img/ArchitectureTabs/quickstart.webp'
    },*/
    // {
    //     title: 'Architecture Validator',
    //     subtitle: 'The Architecture Validator is an intelligent review assistant designed to help architects and developers ensure solution diagrams meet baseline architectural expectations whether preparing for submission to the SAP Architecture Center or refining them in general practice. It performs automated content checks to support contributors and reviewers in identifying common issues early in the authoring process. Validator provides quick feedback, helping reduce review cycles and improve overall adherence to SAP\'s prescribed architecting policies.',
    //     icon: 'sap-icon://order-status',
    //     link: '/architecture-validator',
    //     requiresAuth: true,
    //     image: '/img/ArchitectureTabs/validator.webp'
    // },
];

// Keep items sorted alphabetically by `title`
export const techDomain = [
    { id: 'ai', title: 'AI & Machine Learning', icon: 'sap-icon://da' },
    { id: 'appdev', title: 'Application Dev. & Automation', icon: 'sap-icon://syntax' },
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
