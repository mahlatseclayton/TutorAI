
const fs = require('fs');
const path = require('path');

function extractFunction(source, funcName) {
    const regex = new RegExp(`(async\\s+function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`);
    const match = source.match(regex);
    if (!match) return null;

    const startIdx = source.indexOf(match[1]);
    let braceCount = 0;
    let endIdx = startIdx;
    let started = false;

    for (let i = startIdx; i < source.length; i++) {
        if (source[i] === '{') { braceCount++; started = true; }
        if (source[i] === '}') braceCount--;
        if (started && braceCount === 0) { endIdx = i + 1; break; }
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
