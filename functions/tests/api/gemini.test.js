const { topicTutor } = require('../../api/gemini');
const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

// Mock dependencies
jest.mock('ai');
jest.mock('@ai-sdk/google');

describe('topicTutor onRequest', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            method: 'POST',
            headers: {
                origin: 'https://mzansied.co.za'
            },
            body: {
                message: 'How do you solve for x?'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    test('should return 400 if no message is provided', async () => {
        mockReq.body.message = null;
        await topicTutor(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: 'NO_PROMPT_PROVIDED'
        }));
    });

    test('should successfully generate text with Gemini', async () => {
        const mockGoogle = jest.fn();
        createGoogleGenerativeAI.mockReturnValue(mockGoogle);
        generateText.mockResolvedValue({
            text: 'Here is how you solve for x...'
        });

        await topicTutor(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            aiResponse: 'Here is how you solve for x...'
        }));
        expect(generateText).toHaveBeenCalled();
    });

    test('should handle options request for CORS', async () => {
        mockReq.method = 'OPTIONS';
        mockReq.headers.origin = 'https://mzansied.co.za';
        
        mockRes.send = jest.fn().mockReturnThis();

        await topicTutor(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://mzansied.co.za');
    });

    test('should retry multiple models on 503 error', async () => {
        const mockGoogle = jest.fn();
        createGoogleGenerativeAI.mockReturnValue(mockGoogle);
        
        // Fail twice with 503, then succeed
        generateText
            .mockRejectedValueOnce({ status: 503, message: 'High Demand' })
            .mockRejectedValueOnce({ status: 503, message: 'High Demand' })
            .mockResolvedValueOnce({ text: 'Fallback success' });

        // Speed up the timer for the test
        jest.useFakeTimers();
        const tutorPromise = topicTutor(mockReq, mockRes);
        
        // Wait for first retry
        await jest.advanceTimersByTimeAsync(1500);
        // Wait for second retry
        await jest.advanceTimersByTimeAsync(1500);
        
        await tutorPromise;
        jest.useRealTimers();

        expect(generateText).toHaveBeenCalledTimes(3);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            aiResponse: 'Fallback success'
        }));
    });

    test('should return 500 if all models fail', async () => {
        const mockGoogle = jest.fn();
        createGoogleGenerativeAI.mockReturnValue(mockGoogle);
        generateText.mockRejectedValue({ status: 500, message: 'Internal Server Error' });

        await topicTutor(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: 'Internal Server Error'
        }));
    });

    test('should return 500 if GEMINI_API_KEY is missing', async () => {
        const originalKey = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        
        await topicTutor(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'API_KEY_NOT_CONFIGURED'
        }));

        process.env.GEMINI_API_KEY = originalKey;
    });

    test('should process base64 image data correctly', async () => {
        generateText.mockResolvedValue({ text: 'I see a science diagram' });

        mockReq.body.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        
        await topicTutor(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            aiResponse: 'I see a science diagram'
        }));
    });

    test('should throw error on invalid base64 format', async () => {
        mockReq.body.image = 'invalidbase64data';
        
        await topicTutor(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Invalid base64 image data format'
        }));
    });
});
