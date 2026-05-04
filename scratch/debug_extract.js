
const fs = require('fs');
const path = require('path');

function extractFunction(source, funcName) {
    const regex = new RegExp(`((?:async\\s+)?function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`);
    const match = source.match(regex);
    if (!match) return null;

    const startIdx = source.indexOf(match[1]);
    let braceCount = 0;
    let endIdx = startIdx;
    let started = false;
    let inString = null;

    for (let i = startIdx; i < source.length; i++) {
        const char = source[i];
        if (!inString) {
            if (char === "'" || char === '"' || char === '`') {
                inString = char;
            } else if (char === '{') {
                braceCount++;
                started = true;
            } else if (char === '}') {
                braceCount--;
            }
        } else {
            if (char === inString && source[i - 1] !== '\\') {
                inString = null;
            }
        }

        if (started && braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }

    return source.substring(startIdx, endIdx);
}

const scriptPath = 'public/js/firebase.js';
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const getTopicSource = extractFunction(scriptContent, 'getTopic');

console.log("Length of getTopicSource:", getTopicSource.length);
console.log("Last 100 characters of getTopicSource:");
console.log(getTopicSource.substring(getTopicSource.length - 100));
console.log("Does it contain topicHistory?", getTopicSource.includes('topicHistory'));
