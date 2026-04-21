const { verifyCaptcha } = require('../../api/captcha');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('verifyCaptcha', () => {
    let mockRequest;

    beforeEach(() => {
        mockRequest = {
            data: {
                token: 'valid-token'
            }
        };
        jest.clearAllMocks();
    });

    test('should verify captcha successfully', async () => {
        axios.post.mockResolvedValue({
            data: { success: true }
        });

        const result = await verifyCaptcha.run(mockRequest);

        expect(result).toEqual({ success: true });
        expect(axios.post).toHaveBeenCalledWith(
            'https://www.google.com/recaptcha/api/siteverify',
            expect.stringContaining('secret=test-secret&response=valid-token'),
            expect.objectContaining({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        );
    });

    test('should return NO_TOKEN error if token is missing', async () => {
        mockRequest.data.token = null;
        const result = await verifyCaptcha.run(mockRequest);

        expect(result).toEqual({
            success: false,
            error: 'NO_TOKEN'
        });
    });

    test('should return VERIFICATION_FAILED if Google returns success: false', async () => {
        axios.post.mockResolvedValue({
            data: { 
                success: false, 
                'error-codes': ['invalid-input-response'] 
            }
        });

        const result = await verifyCaptcha.run(mockRequest);

        expect(result).toEqual({
            success: false,
            error: 'VERIFICATION_FAILED',
            details: ['invalid-input-response']
        });
    });

    test('should return INTERNAL_ERROR if axios throws', async () => {
        axios.post.mockRejectedValue(new Error('Network Error'));

        const result = await verifyCaptcha.run(mockRequest);

        expect(result).toEqual({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Network Error'
        });
    });

    test('should return SECRET_NOT_CONFIGURED if secret is missing', async () => {
        const originalSecret = process.env.RECAPTCHA_API;
        delete process.env.RECAPTCHA_API;
        
        const result = await verifyCaptcha.run(mockRequest);

        expect(result).toEqual({
            success: false,
            error: 'SECRET_NOT_CONFIGURED'
        });

        process.env.RECAPTCHA_API = originalSecret;
    });
});
