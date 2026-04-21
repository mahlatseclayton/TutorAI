/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../../../public/js/theme.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

describe('theme.js', () => {
    beforeEach(() => {
        // Setup base HTML structure
        document.body.innerHTML = `
            <button id="themeToggle"><i></i></button>
            <div class="navBar">
                <a href="mainPage.html">Home</a>
            </div>
        `;
        
        // Mock localStorage
        const localStorageMock = (function() {
            let store = {};
            return {
                getItem: jest.fn(key => store[key] || null),
                setItem: jest.fn((key, value) => {
                    store[key] = value.toString();
                }),
                clear: jest.fn(() => {
                    store = {};
                })
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Evaluates the script
        eval(scriptContent);
    });

    test('should apply light theme by default', () => {
        expect(document.body.classList.contains('dark-mode')).toBe(false);
    });

    test('should apply dark theme if stored in localStorage', () => {
        window.localStorage.setItem('theme', 'dark');
        // Re-eval script to check init
        eval(scriptContent);
        expect(document.body.classList.contains('dark-mode')).toBe(true);
    });

    test('should toggle theme when button is clicked', () => {
        const toggleBtn = document.getElementById('themeToggle');
        window.initTheme(); // Ensure it's initialized

        toggleBtn.click();
        expect(document.body.classList.contains('dark-mode')).toBe(true);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

        toggleBtn.click();
        expect(document.body.classList.contains('dark-mode')).toBe(false);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    test('should add active lesson link if aiResponse exists', () => {
        window.localStorage.setItem('aiResponse', JSON.stringify({}));
        
        // Use pushState to change the URL safely in JSDOM
        window.history.pushState({}, 'Main Page', '/mainPage.html');
        
        window.initDynamicNav();
        
        const activeLink = document.querySelector('a[href="solutionPage.html"]');
        expect(activeLink).not.toBeNull();
        expect(activeLink.innerHTML).toContain('Active Lesson');
    });
});
