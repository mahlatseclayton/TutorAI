const { getYoutubeVideos } = require('../../api/youtube');

// Mock global fetch
global.fetch = jest.fn();

describe('getYoutubeVideos onRequest', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            method: 'GET',
            headers: {
                origin: 'https://mzansied.co.za'
            },
            query: {
                heading: 'Quadratic Equations',
                subject: 'Mathematics',
                grade: 'Grade 10'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    test('should search Searlo and return youtube videos', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                organic: [
                    { link: 'https://www.youtube.com/watch?v=video1', title: 'Lesson 1' },
                    { link: 'https://youtu.be/video2', title: 'Lesson 2' }
                ]
            })
        });

        await getYoutubeVideos(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: false,
            videos: expect.arrayContaining([
                expect.objectContaining({ id: 'video1' }),
                expect.objectContaining({ id: 'video2' })
            ])
        }));
        
        // Check if query is correct
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(encodeURIComponent('"Quadratic Equations" Mathematics Grade 10 concept explained tutorial youtube')),
            expect.any(Object)
        );
    });

    test('should return fallback videos if Searlo yields no results', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                organic: []
            })
        });

        await getYoutubeVideos(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: false,
            videos: expect.arrayContaining([
                expect.objectContaining({ id: 'M7lc1UVf-VE' }) // Check at least one fallback
            ])
        }));
    });

    test('should return fallbacks if fetch fails', async () => {
        fetch.mockRejectedValue(new Error('Connection failed'));

        await getYoutubeVideos(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: false,
            message: 'INTERNAL_ERROR',
            videos: expect.any(Array)
        }));
    });

    test('should handle options CORS request', async () => {
        mockReq.method = 'OPTIONS';
        mockRes.send = jest.fn().mockReturnThis();

        await getYoutubeVideos(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://mzansied.co.za');
    });

    test('should handle Searlo API return without organic results and fallback', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                success: false
            })
        });

        await getYoutubeVideos(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: false,
            message: 'NO_SEARCH_RESULTS',
            videos: expect.any(Array)
        }));
    });
});
