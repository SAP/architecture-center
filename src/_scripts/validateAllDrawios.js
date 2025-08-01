const fs = require('fs');
const path = require('path');
const validateDrawio = require('./validateDrawio'); // Validator URL

const allReports = [];
const inputFiles = process.argv.slice(2); // Read all passed drawio files

(async () => {
  let totalWarning = 0, totalError = 0;

  for (const file of inputFiles) {
    const reportContent = await validateDrawio(file, true); // true = suppress individual logs
    if (reportContent) {
      allReports.push(reportContent.report);
      totalWarning += reportContent.counts.warning;
      totalError += reportContent.counts.error;
    }
  }

  // Header Summary
  const headerSummary =
    `#### Summary Across ${inputFiles.length} Architecture Diagram(s)\n\n` +
    `| Metric                       | Count |\n` +
    `|-----------------------------|-------|\n` +
    `| Total Architecture Diagrams | ${inputFiles.length} |\n` +
    `| ⚠️ Warning                  | ${totalWarning} |\n` +
    `| ❌ Error                    | ${totalError} |\n\n`;

  // Full report includes header and all diagram reports
  const fullReport = allReports.join('\n---\n\n');

  // Ensure reports directory exists
  fs.mkdirSync('reports', { recursive: true });

  // Write files
  fs.writeFileSync('reports/header-summary.md', headerSummary);
  fs.writeFileSync('reports/combined-report.md', fullReport);

  // Optional: log full report
  console.log(fullReport);
})();
