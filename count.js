const fs = require("fs");
const path = require("path");

/* ==============================
   Read command-line arguments
================================ */
const args = process.argv.slice(2);

/* ==============================
   Help message
================================ */
function showHelp() {
  console.log("\nText File Analyzer");
  console.log("Usage: node count.js <file.txt> [options]\n");
  console.log("Options:");
  console.log("  -h, --help      Show help");
  console.log("  -d, --detail    Show detailed statistics\n");
  console.log("Example:");
  console.log("  node count.js sample.txt");
  console.log("  node count.js sample.txt --detail\n");
  process.exit(0);
}

/* ==============================
   Show help if needed
================================ */
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  showHelp();
}

/* ==============================
   Command-line options
================================ */
const filePath = args[0];
const showDetail = args.includes("--detail") || args.includes("-d");

/* ==============================
   Validate file
================================ */
if (!filePath.endsWith(".txt")) {
  console.log("❌ Error: Please provide a .txt file");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.log(`❌ Error: File ${filePath} does not exist`);
  process.exit(1);
}

/* ==============================
   Read file
================================ */
function readFile(filePath) {
  try {
    // Read as buffer for accurate counting
    return fs.readFileSync(filePath);
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

/* ==============================
   Count statistics
================================ */
function countStatistics(buffer) {
  const content = buffer.toString();

  // Characters (including whitespace)
  const charCount = buffer.length;

  // Lines
  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;

  // Words
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Non-whitespace characters
  const nonWhitespaceCharCount = content.replace(/\s/g, "").length;

  // Paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  const paragraphCount = paragraphs.length;

  // Average word length
  const totalWordLength = words.reduce((sum, w) => sum + w.length, 0);
  const averageWordLength = wordCount === 0 ? 0 : totalWordLength / wordCount;

  // Word frequency
  const frequency = {};
  words.forEach(word => {
    const w = word.toLowerCase();
    frequency[w] = (frequency[w] || 0) + 1;
  });

  // Most common words (top 5)
  const commonWords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    fileName: path.basename(filePath),
    byteSize: buffer.byteLength,
    charCount,
    wordCount,
    lineCount,
    nonWhitespaceCharCount,
    paragraphCount,
    averageWordLength,
    commonWords
  };
}

/* ==============================
   Format bytes
================================ */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

/* ==============================
   Display statistics
================================ */
function displayStatistics(stats) {
  console.log("\n=== Text File Statistics ===\n");
  console.log(`File       : ${stats.fileName}`);
  console.log(`Size       : ${formatBytes(stats.byteSize)}`);
  console.log(`Characters : ${stats.charCount}`);
  console.log(`Words      : ${stats.wordCount}`);
  console.log(`Lines      : ${stats.lineCount}`);

  if (showDetail) {
    console.log("\n=== Detailed Statistics ===\n");
    console.log(`Non-whitespace characters : ${stats.nonWhitespaceCharCount}`);
    console.log(`Paragraphs               : ${stats.paragraphCount}`);
    console.log(
      `Average word length      : ${stats.averageWordLength.toFixed(2)} characters`
    );

    console.log("\nMost common words:");
    stats.commonWords.forEach(([word, count]) => {
      console.log(`  "${word}": ${count} occurrences`);
    });
  }

  console.log("\n=== End of Statistics ===\n");
}

/* ==============================
   Main execution
================================ */
const buffer = readFile(filePath);
const statistics = countStatistics(buffer);
displayStatistics(statistics);