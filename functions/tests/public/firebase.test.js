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

// 1. Remove top level imports and other problematic lines
scriptContent = scriptContent.replace(/import\s+[\s\S]+?from\s+["'].+?["'];/g, '');

describe('firebase.js core logic', () => {
    let sandbox;

    beforeEach(() => {
        document.body.innerHTML = '<div id="topicTitle"></div><div id="videosContent"></div>';
        jest.clearAllMocks();
        fetch.mockClear();
        
        // Mock global constants
        window.AI_GATEWAY_URL = 'https://test-gateway.app';

        // Use a more aggressive approach to expose functions
        sandbox = {};
        try {
            // Append explicit assignments to the script content
            const modifiedScript = `
                ${scriptContent}
                // Expose to sandbox
                _sandbox.validateTopic = typeof validateTopic !== 'undefined' ? validateTopic : null;
                _sandbox.getTopic = typeof getTopic !== 'undefined' ? getTopic : null;
                _sandbox.loadVideos = typeof loadVideos !== 'undefined' ? loadVideos : null;
            `;
            
            // Execute in current context with sandbox reference
            const execute = new Function('_sandbox', modifiedScript);
            execute(sandbox);
        } catch (e) {
            // console.warn("Sandbox init warning:", e.message);
        }
    });

    test('validateTopic should return "VALID" when AI confirms', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'VALID' })
        });

        if (!sandbox.validateTopic) throw new Error("validateTopic not found");
        
        const result = await sandbox.validateTopic('Photosynthesis', 'Biology');
        expect(result).toBe('VALID');
    });

    test('validateTopic should return suggested subject when AI corrects', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ aiResponse: 'Life Science' })
        });

        const result = await sandbox.validateTopic('Reproduction', 'Geography');
        expect(result).toBe('Life Science');
    });

    test('validateTopic should fail safe to "VALID" on fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await sandbox.validateTopic('Anything', 'Subject');
        expect(result).toBe('VALID');
    });
});
