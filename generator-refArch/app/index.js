import Generator from 'yeoman-generator';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import frontmatter from '@github-docs/frontmatter';
import ejs from 'ejs';
import chalk from 'chalk';


function createGuidFolder(basePath, folderName) {
    const folderPath = path.join(basePath, folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    return folderPath;
}

function generateShortUUID() {
    return uuidv4().replace(/-/g, '').substring(0, 10);
}

function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function logWithColor(message, color = 'dim') {
    const { default: chalk } = await import('chalk');
    console.log(chalk[color](message));
}

const getSidebarPosition = (refArchDir) => {
    const files = fs.readdirSync(refArchDir);
    const folderCount = files.filter((file) => {
        const fullPath = path.join(refArchDir, file);
        return fs.statSync(fullPath).isDirectory() && file.startsWith("RA");
    }).length;

    return folderCount;
};

const getLeadingZeros = (folderCount, maxLength = 4) => {
    return String(folderCount).padStart(maxLength, '0');
};

const getExistingReadmeData = (dir) => {
    const readmePath = path.join(dir, 'readme.md');
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        const parsedFrontmatter = frontmatter(content);

        const { id, slug } = parsedFrontmatter.data;

        if (id && slug) {
            return {
                id,
                slug
            };
        }
    }
    return null;
};


const findSubfoldersWithPattern = (parentFolderPath) => {
    const excludedFolders = ['drawio', 'images'];

    const parentFolderName = path.basename(parentFolderPath);
    const items = fs.readdirSync(parentFolderPath);

    const subdirectories = items.filter((item) => {
        const itemPath = path.join(parentFolderPath, item);

        return (
            fs.statSync(itemPath).isDirectory() && !excludedFolders.includes(item)
        );
    });

    return subdirectories;
};


async function createSubfoldersForRefArch(subfolderCount = 1, parentPath) {
    // return await Promise.allSettled(
    // new Array(subfolderCount).fill(0).map(async (_, i) => {
    if (!parentPath) {
        throw new Error('The parentPath is undefined. Ensure the correct directory path is passed to the function.');
    }

    await logWithColor(`\nParent path: ${parentPath}\n`);
    const subfolderDetails = [];

    // Ask for subfolder metadata
    for (let i = 0; i < subfolderCount; i++) {
        this.log(`\nCreating subfolder ${i + 1} of ${subfolderCount}...\n`);

        const answers = await this.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Title for the sub-page:',
                default: 'Keep it clear, concise, and within 50 characters.',
                validate: (input) => {
                    const isValid = /^[a-zA-Z0-9 ]+$/.test(input); // Allow alphanumeric characters and spaces
                    return isValid ? true : 'Title must only contain alphanumeric characters and spaces.';
                },
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description for the sub-page:',
                default:
                    'Provide an overview of the reference architecture, ensuring the description fits within the 300-character limit for display on the cards.',
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

    const existingData = getExistingReadmeData(parentPath);

    if (!existingData) {
        throw new Error(`No valid readme.md file found in the directory: ${parentPath}`);
    }

    // Continue creating subfolders
    const results = await Promise.allSettled(
        subfolderDetails.map(async (answers, i) => {
            const currentFoldersLength = findSubfoldersWithPattern(parentPath).length;
            const promptTitle = answers.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const subfolderName = `${currentFoldersLength + 1}-` + promptTitle;
            const subfolderPath = createGuidFolder(parentPath, subfolderName);

            // Create drawio and images folders for the subfolder
            const drawioFolderPath = path.join(subfolderPath, 'drawio');
            const imagesFolderPath = path.join(subfolderPath, 'images');
            fs.mkdirSync(drawioFolderPath, { recursive: true });
            fs.mkdirSync(imagesFolderPath, { recursive: true });
            fs.writeFileSync(path.join(drawioFolderPath, 'dummy.drawio'), '');
            fs.writeFileSync(path.join(imagesFolderPath, 'dummy.svg'), '');

            // Create readme.md for the subfolder
            const readmePath = path.join(subfolderPath, 'readme.md');
            const templateData = {
                ...answers,
                id: `${existingData.id}-${currentFoldersLength + 1} `,
                slug: `${existingData.slug}/${currentFoldersLength + 1}`,
                sidebar_position: currentFoldersLength + 1,
                username: `user-${generateShortUUID()}`,
                today: getFormattedDate(),
            };

            this.fs.copyTpl(this.templatePath('refArchTemplate.md'), readmePath, templateData);
        })
    );

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            this.log(`✅ Subfolder ${index + 1} created successfully.`);
        } else {
            this.log(`❌ Subfolder ${index + 1} failed: ${result.reason}`);
        }
    });


}

export default class extends Generator {
    async prompting() {
        this.log('----------------------------------------');
        this.log('-       SAP Architecture Center        -');
        this.log('----------------------------------------\n');
        this.log('Starting the reference architecture generator... Please follow the prompts.');
        await logWithColor('Note: You can revise your responses later, if necessary.\n');

        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: ['Create a new reference architecture', 'Add a sub-page to an existing reference architecture'],
                default: 'Create a new reference architecture'
            }
        ]);

        if (this.answers.option === 'Add a sub-page to an existing reference architecture') {
            await logWithColor('Note: Ensure that you are in the correct directory of the existing reference architecture before proceeding.');
            await logWithColor('Current directory: ' + process.cwd() + '\n');
        }

        this.answers = {
            ...this.answers,
            ...(await this.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Title:',
                    default: 'Keep it clear, concise, and within 50 characters.',
                    validate: (input) => {
                        const isValid = /^[a-zA-Z0-9 ]+$/.test(input); // Allow alphanumeric characters and spaces
                        return isValid
                            ? true
                            : chalk.red('Error: Title must only contain alphanumeric characters and spaces.');
                    },
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
            ]))
        };
    }


    async generateRefArch() {
        let id, slug, guidFolderName, sidebarPosition, currentPath, username;
        const uuid = generateShortUUID();

        if (this.answers.option === 'Create a new reference architecture') {
            // Option 1: Create a new reference architecture
            currentPath = path.join(this.destinationPath(), 'docs', 'ref-arch');
            sidebarPosition = getSidebarPosition(currentPath);
            const idName = getLeadingZeros(sidebarPosition);
            id = `id-ra${idName}`;
            slug = `/ref-arch/${uuid}`;
            username = `user-${uuid}`;
            guidFolderName = `RA${idName}`;
        } else {
            // Option 2: Add a subfolder to an existing reference architecture
            currentPath = process.cwd();
            const existingData = getExistingReadmeData(currentPath);

            if (!existingData) {
                this.log('Error: Could not find a valid readme.md in the current directory.');
                return;
            }

            // Extract ID and slug from the existing reference architecture
            const currentFoldersLength = findSubfoldersWithPattern(currentPath).length;
            const newFolderCount = currentFoldersLength + 1;

            // Extract ID and slug from the existing reference architecture
            id = `${existingData.id}-${newFolderCount}`;
            slug = `${existingData.slug}/${newFolderCount}`;
            sidebarPosition = newFolderCount;
            username = `user-${uuid}`;
            const promptTitle = this.answers.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            guidFolderName = `${newFolderCount}-${promptTitle}`;
        }

        const guidFolderPath = createGuidFolder(currentPath, guidFolderName);

        // Create drawio and images folders with dummy files
        const drawioFolderPath = path.join(guidFolderPath, 'drawio');
        const imagesFolderPath = path.join(guidFolderPath, 'images');
        fs.mkdirSync(drawioFolderPath, { recursive: true });
        fs.mkdirSync(imagesFolderPath, { recursive: true });
        fs.writeFileSync(path.join(drawioFolderPath, 'dummy.drawio'), '');
        fs.writeFileSync(path.join(imagesFolderPath, 'dummy.svg'), '');

        // create Readme


        //        const templatePath = this.templatePath('refArchTemplate.md');
        const destinationPath = path.join(guidFolderPath, 'readme.md');
        const templateReadmeContent = this.fs.read(this.templatePath('refArchTemplate.md'));
        fs.writeFileSync(destinationPath, templateReadmeContent);
        const templateData = {
            ...this.answers,
            id,
            slug,
            sidebar_position: sidebarPosition,
            username,
            today: getFormattedDate() // Use the formatted date
        };
        const readmeContent = fs.readFileSync(destinationPath, 'utf8');
        //const templateReadmeContent = this.fs.read(this.templatePath('refArchTemplate.md')); // Read the template content
        const renderedContent = ejs.render(readmeContent, templateData);
        fs.writeFileSync(destinationPath, renderedContent); // Write it to the destination immediately
        // await wait(5000);


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
                // Step 4: Ask how many subfolders to create
                const { subfolderCount } = await this.prompt([
                    {
                        type: 'number',
                        name: 'subfolderCount',
                        message: 'How many sub-pages do you want to create?',
                        default: 1,
                        validate: (input) => (input > 0 ? true : 'Please enter a positive number.'),
                    }
                ]);

                // Step 5: Create subfolders
                await createSubfoldersForRefArch.call(this, subfolderCount, guidFolderPath);
            }
        }
    }
};
