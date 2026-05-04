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

// --- Extract individual functions from the source for isolated testing ---
// This approach is more reliable than trying to eval the entire file,
// since firebase.js has many side effects (DOM lookups, event listeners, auth state).

function extractFunction(source, funcName) {
    // Match async function funcName(...) { ... } with balanced braces
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

describe('firebase.js core logic', () => {
    let validateTopic;

    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();

        // Extract and compile validateTopic in isolation
        const funcSource = extractFunction(scriptContent, 'validateTopic');
        if (funcSource) {
            // Replace the AI_GATEWAY_URL reference with a literal
            const patched = funcSource.replace(/AI_GATEWAY_URL/g, '"/api/tutor"');
            validateTopic = new Function('fetch', `return (${patched})`)(fetch);
        }
    });

    test('validateTopic should return "VALID" when AI confirms', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'VALID' })
        });

        expect(validateTopic).toBeDefined();
        const result = await validateTopic('Photosynthesis', 'Biology');
        expect(result).toBe('VALID');
    });

    test('validateTopic should return suggested subject when AI corrects', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'Life Science' })
        });

        expect(validateTopic).toBeDefined();
        const result = await validateTopic('Reproduction', 'Geography');
        expect(result).toBe('Life Science');
    });

    test('validateTopic should fail safe to "VALID" on fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        expect(validateTopic).toBeDefined();
        const result = await validateTopic('Anything', 'Subject');
        expect(result).toBe('VALID');
    });

    test('validateTopic should fail safe to "VALID" on non-ok response', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ error: 'Server error' })
        });

        expect(validateTopic).toBeDefined();
        const result = await validateTopic('Algebra', 'Mathematics');
        expect(result).toBe('VALID');
    });
});

describe('firebase.js localStorage grade usage', () => {
    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    test('getTopic should read grade from localStorage', () => {
        // Verify the source code reads grade from localStorage (not DOM)
        expect(scriptContent).toContain('localStorage.getItem("grade")');
        // Verify the old gradeId DOM element is no longer referenced in getTopic
        const getTopicSource = extractFunction(scriptContent, 'getTopic');
        expect(getTopicSource).not.toContain('getElementById("gradeId")');
    });

    test('searchPastPapers should read grade from localStorage', () => {
        // Verify searchPastPapers reads grade from localStorage
        expect(scriptContent).toContain('localStorage.getItem("grade") || "12"');
    });

    test('topic visit should be saved to user history', () => {
        // Verify getTopic saves to topicHistory subcollection
        const getTopicSource = extractFunction(scriptContent, 'getTopic');
        expect(getTopicSource).toContain('topicHistory');
        expect(getTopicSource).toContain('setDoc');
    });
});

describe('firebase.js email verification', () => {
    test('onAuthStateChanged should check emailVerified', () => {
        // Verify the global auth listener checks emailVerified
        expect(scriptContent).toContain('user.emailVerified');
        expect(scriptContent).toContain('window.location.href = "signIn.html"');
    });
});
