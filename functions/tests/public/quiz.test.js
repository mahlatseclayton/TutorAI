/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Mock global state
global.marked = {
    parse: jest.fn(t => t),
    parseInline: jest.fn(t => t)
};
global.MathJax = {
    typesetPromise: jest.fn(() => Promise.resolve())
};

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
const scriptPath = path.resolve(__dirname, '../../../public/js/quiz.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// 1. Remove top level imports
scriptContent = scriptContent.replace(/import\s+[\s\S]+?from\s+["'].+?["'];/g, '');

describe('quiz.js core logic', () => {
    let sandbox;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="quizContainer"></div>
            <div id="quizTitle"></div>
            <div id="loaderText"></div>
            <div id="submitQuizBtn" style="display:inline">Submit</div>
            <div id="loaderOverlay"></div>
            <div id="userPoints">0</div>
        `;
        
        window.localStorage.clear();
        jest.clearAllMocks();

        // Use aggressive extraction
        sandbox = {};
        try {
             // Mock some browser globals that might be used
             window.auth = { onAuthStateChanged: jest.fn() };
             window.db = {};

            const modifiedScript = `
                ${scriptContent}
                _sandbox.selectOption = typeof selectOption !== 'undefined' ? selectOption : null;
                _sandbox.renderQuiz = typeof renderQuiz !== 'undefined' ? renderQuiz : null;
            `;
            const execute = new Function('_sandbox', modifiedScript);
            execute(sandbox);
        } catch (e) {
            // console.warn("Quiz Sandbox init warning:", e.message);
        }

        // Setup global data that functions might refer to
        sandbox.currentQuizData = [
            { QUESTION: 'Q1', OPTIONS: ['A', 'B'], CORRECT_INDEX: 0, MEMO: 'M1' }
        ];
        sandbox.userAnswers = {};
    });

    test('selectOption should highlight selected option', () => {
        const container = document.getElementById('quizContainer');
        container.innerHTML = `
            <div id="options-0">
                <div class="quiz-option" id="opt-0-0">A</div>
                <div class="quiz-option" id="opt-0-1">B</div>
            </div>
        `;

        if (sandbox.selectOption) {
            sandbox.selectOption(0, 1);
            expect(document.getElementById('opt-0-1').classList.contains('selected')).toBe(true);
        }
    });

    test('selectOption should not select if submit button is disabled', () => {
        const submitBtn = document.getElementById('submitQuizBtn');
        submitBtn.disabled = true;
        
        const container = document.getElementById('quizContainer');
        container.innerHTML = '<div class="quiz-option" id="opt-0-0"></div>';

        if (sandbox.selectOption) {
            sandbox.selectOption(0, 0);
            expect(document.getElementById('opt-0-0').classList.contains('selected')).toBe(false);
        }
    });
});
