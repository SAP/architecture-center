import Generator from 'yeoman-generator';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import frontmatter from '@github-docs/frontmatter';
import ejs from 'ejs';
import chalk from 'chalk';

// Constants
const EXCLUDED_FOLDERS = ['drawio', 'images'];
const MAX_FOLDER_NAME_LENGTH = 4;
const MIN_SUBFOLDER_COUNT = 1;
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9 ]+$/;

// Utility functions
const createGuidFolder = async (basePath, folderName) => {
    const folderPath = path.join(basePath, folderName);
    
    try {
        await fs.access(folderPath);
    } catch {
        await fs.mkdir(folderPath, { recursive: true });
    }
    
    return folderPath;
};

const generateShortUUID = () => uuidv4().replace(/-/g, '').substring(0, 10);

const getFormattedDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const logWithColor = (message, color = 'dim') => {
    console.log(chalk[color](message));
};

const getSidebarPosition = async (refArchDir) => {
    try {
        const files = await fs.readdir(refArchDir);
        const folderStats = await Promise.all(
            files.map(async (file) => {
                const fullPath = path.join(refArchDir, file);
                try {
                    const stat = await fs.stat(fullPath);
                    return { file, isDirectory: stat.isDirectory() };
                } catch {
                    return { file, isDirectory: false };
                }
            })
        );
        
        return folderStats.filter(({ file, isDirectory }) => 
            isDirectory && file.startsWith("RA")
        ).length;
    } catch {
        return 0;
    }
};

const getLeadingZeros = (folderCount, maxLength = MAX_FOLDER_NAME_LENGTH) => 
    String(folderCount).padStart(maxLength, '0');

const getExistingReadmeData = async (dir) => {
    const readmePath = path.join(dir, 'readme.md');
    
    try {
        const content = await fs.readFile(readmePath, 'utf-8');
        const parsedFrontmatter = frontmatter(content);
        const { id, slug } = parsedFrontmatter.data;
        
        return (id && slug) ? { id, slug } : null;
    } catch {
        return null;
    }
};

const findSubfoldersWithPattern = async (parentFolderPath) => {
    try {
        const items = await fs.readdir(parentFolderPath);
        const subdirectories = await Promise.all(
            items.map(async (item) => {
                if (EXCLUDED_FOLDERS.includes(item)) return null;
                
                const itemPath = path.join(parentFolderPath, item);
                try {
                    const stat = await fs.stat(itemPath);
                    return stat.isDirectory() ? item : null;
                } catch {
                    return null;
                }
            })
        );
        
        return subdirectories.filter(Boolean);
    } catch {
        return [];
    }
};

const validateTitle = (input) => {
    const isValid = ALPHANUMERIC_REGEX.test(input);
    return isValid || chalk.red('Error: Title must only contain alphanumeric characters and spaces.');
};

const validateSubfolderCount = (input) => 
    input > 0 || 'Please enter a positive number.';

const createDrawioFolder = async (subfolderPath, templatePath) => {
    const drawioFolderPath = path.join(subfolderPath, 'drawio');
    await fs.mkdir(drawioFolderPath, { recursive: true });
    
    const destinationDrawioPath = path.join(drawioFolderPath, 'template.drawio');
    await fs.copyFile(templatePath, destinationDrawioPath);
};

const createReadmeFile = async (readmePath, templatePath, templateData) => {
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const renderedContent = ejs.render(templateContent, templateData);
    await fs.writeFile(readmePath, renderedContent);
};

const createSubfoldersForRefArch = async function(subfolderCount = MIN_SUBFOLDER_COUNT, parentPath) {
    if (!parentPath) {
        throw new Error('The parentPath is undefined. Ensure the correct directory path is passed to the function.');
    }

    logWithColor(`\nParent path: ${parentPath}\n`);
    
    const existingData = await getExistingReadmeData(parentPath);
    if (!existingData) {
        throw new Error(`No valid readme.md file found in the directory: ${parentPath}`);
    }

    // Collect all subfolder metadata first
    const subfolderDetails = [];
    for (let i = 0; i < subfolderCount; i++) {
        this.log(`\nCreating subfolder ${i + 1} of ${subfolderCount}...\n`);

        const answers = await this.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Title for the sub-page:',
                default: 'Keep it clear, concise, and within 50 characters.',
                validate: validateTitle,
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description for the sub-page:',
                default: 'Provide an overview of the reference architecture, ensuring the description fits within the 300-character limit for display on the cards.',
            },
            {
                type: 'input',
                name: 'keywords',
                message: 'Keywords for the sub-page (comma-separated):',
                default: 'sap, keyword1, keyword2',
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags for the sub-page (comma-separated):',
                default: 'genai, azure, aws, gcp',
            },
        ]);

        subfolderDetails.push(answers);
    }

    // Create all subfolders concurrently
    const currentFoldersLength = (await findSubfoldersWithPattern(parentPath)).length;
    const drawioTemplatePath = this.templatePath('template.drawio');
    const readmeTemplatePath = this.templatePath('refArchTemplate.md');

    const results = await Promise.allSettled(
        subfolderDetails.map(async (answers, i) => {
            const promptTitle = answers.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const subfolderName = `${currentFoldersLength + i + 1}-${promptTitle}`;
            const subfolderPath = await createGuidFolder(parentPath, subfolderName);

            // Create drawio folder and copy template
            await createDrawioFolder(subfolderPath, drawioTemplatePath);

            // Create readme.md for the subfolder
            const readmePath = path.join(subfolderPath, 'readme.md');
            const templateData = {
                ...answers,
                id: `${existingData.id}-${currentFoldersLength + i + 1}`,
                slug: `${existingData.slug}/${currentFoldersLength + i + 1}`,
                sidebar_position: currentFoldersLength + i + 1,
                username: `user-${generateShortUUID()}`,
                today: getFormattedDate(),
            };

            await createReadmeFile(readmePath, readmeTemplatePath, templateData);
        })
    );

    // Log results
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            this.log(`✅ Subfolder ${index + 1} created successfully.`);
        } else {
            this.log(chalk.red(`❌ Subfolder ${index + 1} failed: ${result.reason}`));
        }
    });
};

export default class extends Generator {
    async prompting() {
        this.log('----------------------------------------');
        this.log('-       SAP Architecture Center        -');
        this.log('----------------------------------------\n');
        this.log('Starting the reference architecture generator... Please follow the prompts.');
        logWithColor('Note: You can revise your responses later, if necessary.\n');

        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: [
                    'Create a new reference architecture', 
                    'Add a sub-page to an existing reference architecture'
                ],
                default: 'Create a new reference architecture'
            }
        ]);

        if (this.answers.option === 'Add a sub-page to an existing reference architecture') {
            logWithColor('Note: Ensure that you are in the correct directory of the existing reference architecture before proceeding.');
            logWithColor(`Current directory: ${process.cwd()}\n`);
        }

        const additionalAnswers = await this.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Title:',
                default: 'Keep it clear, concise, and within 50 characters.',
                validate: validateTitle,
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description:',
                default: 'Provide an overview of the reference architecture, ensuring the description fits within the 300-character limit for display on the cards.',
            },
            {
                type: 'input',
                name: 'keywords',
                message: 'Keywords (comma-separated):',
                default: 'sap, keyword1, keyword2',
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):',
                default: 'genai, azure, aws, gcp',
            }
        ]);

        this.answers = { ...this.answers, ...additionalAnswers };
    }

    async generateRefArch() {
        const uuid = generateShortUUID();
        let id, slug, guidFolderName, sidebarPosition, currentPath, username;

        if (this.answers.option === 'Create a new reference architecture') {
            // Option 1: Create a new reference architecture
            currentPath = path.join(this.destinationPath(), 'docs', 'ref-arch');
            sidebarPosition = await getSidebarPosition(currentPath);
            const idName = getLeadingZeros(sidebarPosition);
            id = `id-ra${idName}`;
            slug = `/ref-arch/${uuid}`;
            username = `user-${uuid}`;
            guidFolderName = `RA${idName}`;
        } else {
            // Option 2: Add a subfolder to an existing reference architecture
            currentPath = process.cwd();
            const existingData = await getExistingReadmeData(currentPath);

            if (!existingData) {
                this.log('Error: Could not find a valid readme.md in the current directory.');
                return;
            }

            const currentFoldersLength = (await findSubfoldersWithPattern(currentPath)).length;
            const newFolderCount = currentFoldersLength + 1;

            id = `${existingData.id}-${newFolderCount}`;
            slug = `${existingData.slug}/${newFolderCount}`;
            sidebarPosition = newFolderCount;
            username = `user-${uuid}`;
            const promptTitle = this.answers.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            guidFolderName = `${newFolderCount}-${promptTitle}`;
        }

        try {
            const guidFolderPath = await createGuidFolder(currentPath, guidFolderName);

            // Create drawio folder and copy template
            const drawioTemplatePath = this.templatePath('template.drawio');
            await createDrawioFolder(guidFolderPath, drawioTemplatePath);

            // Generate readme.md
            const destinationPath = path.join(guidFolderPath, 'readme.md');
            const templateData = {
                ...this.answers,
                id,
                slug,
                sidebar_position: sidebarPosition,
                username,
                today: getFormattedDate()
            };

            const readmeTemplatePath = this.templatePath('refArchTemplate.md');
            await createReadmeFile(destinationPath, readmeTemplatePath, templateData);

            // Ask about creating subfolders only for Option 1
            if (this.answers.option === 'Create a new reference architecture') {
                const { createSubfolders } = await this.prompt([
                    {
                        type: 'confirm',
                        name: 'createSubfolders',
                        message: `Do you want to create sub-pages in "${guidFolderPath}"?`,
                        default: false,
                    }
                ]);

                if (createSubfolders) {
                    const { subfolderCount } = await this.prompt([
                        {
                            type: 'number',
                            name: 'subfolderCount',
                            message: 'How many sub-pages do you want to create?',
                            default: MIN_SUBFOLDER_COUNT,
                            validate: validateSubfolderCount,
                        }
                    ]);

                    await createSubfoldersForRefArch.call(this, subfolderCount, guidFolderPath);
                }
            }

            this.log(chalk.green(`\n✅ Reference architecture created successfully at: ${guidFolderPath}`));
        } catch (error) {
            this.log(chalk.red(`❌ Error creating reference architecture: ${error.message}`));
        }
    }
}
