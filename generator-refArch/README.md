# SAP Architecture Center CLI Generator

A CLI tool for generating SAP Architecture Center reference architectures using Yeoman.

## Features

- Create new reference architectures with proper folder structure
- Add sub-pages to existing reference architectures
- Automatic template generation for documentation and diagrams
- Concurrent file operations for improved performance
- Enhanced error handling and user feedback

## Requirements

- Node.js >= 18.0.0

## Installation

```bash
npm run setup
```

## Usage

Run the generator:

```bash
genrefarch
```

The CLI will guide you through the process with interactive prompts:

1. Choose to create a new reference architecture or add a sub-page
2. Provide title, description, keywords, and tags
3. Optionally create sub-pages for new architectures

## Optimizations Made

### Performance Improvements

1. **Async/Await Pattern**: Converted synchronous file operations to asynchronous ones using `fs/promises`
2. **Concurrent Operations**: Multiple subfolders are now created concurrently using `Promise.allSettled()`
3. **Efficient File System Operations**: Reduced redundant file system calls and improved error handling

### Code Quality

1. **Constants**: Extracted magic numbers and strings into named constants
2. **Function Decomposition**: Broke down large functions into smaller, focused utilities
3. **Error Handling**: Added comprehensive try-catch blocks and graceful error recovery
4. **Input Validation**: Centralized validation functions for better maintainability

### User Experience

1. **Better Feedback**: Enhanced success/error messages with colored output
2. **Progress Indicators**: Clear indication of subfolder creation progress
3. **Graceful Failures**: Non-critical operations (like terminal clearing) fail silently

### Memory Efficiency

1. **Reduced Memory Footprint**: Eliminated unnecessary string concatenations and object creations
2. **Stream Processing**: More efficient file reading and writing operations

## Project Structure

```
generator-refArch/
├── index.js              # Main entry point
├── package.json          # Dependencies and metadata
├── app/
│   ├── index.js          # Generator logic
│   └── templates/        # Template files
│       ├── refArchTemplate.md
│       └── template.drawio
└── README.md            # This file
```

## Development

To work on this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Link for local development: `npm link`
4. Test the generator: `genrefarch`

## Dependencies

- `@github-docs/frontmatter`: Parse frontmatter from markdown files
- `chalk`: Terminal string styling
- `ejs`: Template rendering
- `uuid`: Generate unique identifiers
- `yeoman-environment`: Yeoman environment management
- `yeoman-generator`: Base generator class

## License

This project follows the same license as the SAP Architecture Center.
