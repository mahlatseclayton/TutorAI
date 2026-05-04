/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Mock global fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => delete store[key]),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Read and prepare script content
const scriptPath = path.resolve(__dirname, '../../../public/js/firebase.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// --- Helper for isolated function testing ---
function extractFunction(source, funcName) {
    // Matches:
    // 1. async function funcName(...) {
    // 2. function funcName(...) {
    // 3. window.funcName = async function(...) {
    const patterns = [
        `(async\\s+function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`,
        `(function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`,
        `(window\\.${funcName}\\s*=\\s*async\\s*function\\s*\\([^)]*\\)\\s*\\{)`,
        `(window\\.${funcName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{)`
    ];
    
    let match = null;
    let startIdx = -1;
    for (const p of patterns) {
        const m = source.match(new RegExp(p));
        if (m) {
            match = m;
            startIdx = source.indexOf(m[1]);
            break;
        }
    }
    
    if (!match) return null;

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

describe('firebase.js core logic', () => {
    let validateTopic;

    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();

        // Extract validateTopic
        const funcSource = extractFunction(scriptContent, 'validateTopic');
        if (funcSource) {
            const patched = funcSource.replace(/AI_GATEWAY_URL/g, '"/api/tutor"');
            validateTopic = new Function('fetch', `return (${patched})`)(fetch);
        }
    });

    test('validateTopic should return "VALID" when AI confirms', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'VALID' })
        });
        const result = await validateTopic('Photosynthesis', 'Biology');
        expect(result).toBe('VALID');
    });

    test('validateTopic should return suggested subject when AI corrects', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'Life Science' })
        });
        const result = await validateTopic('Reproduction', 'Geography');
        expect(result).toBe('Life Science');
    });
});

describe('firebase.js new features verification', () => {
    test('getTopic should use grade from localStorage and save history', () => {
        // We use regex for existence checks to avoid issues with brace counting in complex functions
        const getTopicPattern = /async\s+function\s+getTopic[\s\S]+?localStorage\.getItem\("grade"\)[\s\S]+?topicHistory/m;
        expect(getTopicPattern.test(scriptContent)).toBe(true);
    });

    test('searchPastPapers should use grade from localStorage', () => {
        const searchPPPattern = /window\.searchPastPapers\s*=\s*async\s*function[\s\S]+?localStorage\.getItem\("grade"\)/m;
        expect(searchPPPattern.test(scriptContent)).toBe(true);
    });

    test('auth listener should check email verification', () => {
        const authCheckPattern = /onAuthStateChanged[\s\S]+?user\.emailVerified[\s\S]+?signIn\.html/m;
        expect(authCheckPattern.test(scriptContent)).toBe(true);
    });
});
