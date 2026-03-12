const fs = require('fs');
const path = require('path');

function removeComments(text, ext) {
    if (ext === '.js' || ext === '.jsx') {
        // Step 1: Remove JSX context comments {/* ... */}
        const jsxPattern = /\{\s*\/\*[\s\S]*?\*\/\s*\}/g;
        text = text.replace(jsxPattern, "");

        // Step 2: Regular JS strings/comments
        const jsPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*\'|`(?:[^`\\$]|\\.|(\$\{[^}]*\}))*`|\/\*[\s\S]*?\*\/|\/\/.*)/g;
        
        return text.replace(jsPattern, (match) => {
            if (match.startsWith('//') || match.startsWith('/*')) {
                return "";
            }
            return match;
        });
    } else if (ext === '.css') {
        // CSS only has /* */ comments
        const cssPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\/)/g;
        return text.replace(cssPattern, (match) => {
            if (match.startsWith('/*')) return "";
            return match;
        });
    }
    return text;
}

function processFile(filepath) {
    const ext = path.extname(filepath);
    if (!['.js', '.jsx', '.css'].includes(ext)) return;

    try {
        const content = fs.readFileSync(filepath, 'utf8');
        const newContent = removeComments(content, ext);
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Processed: ${filepath}`);
    } catch (e) {
        console.error(`Error processing ${filepath}: ${e.message}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath);
        } else {
            processFile(filepath);
        }
    });
}

const logFile = path.join(__dirname, 'log.txt');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

const target = process.argv[2];
if (!target) {
    log("Usage: node removeComments.js <directory_or_file>");
    process.exit(1);
}

// Self-test
const testCode = "const x = 1; // comment\n/* multiline */\nconst y = 'http://url';";
const cleaned = removeComments(testCode, '.js');
log("Self-test cleaned result:\n" + cleaned);

try {
    const stats = fs.statSync(target);
    if (stats.isFile()) {
        processFile(target);
    } else if (stats.isDirectory()) {
        walk(target);
    }
} catch (e) {
    log(`Error: ${e.message}`);
}
