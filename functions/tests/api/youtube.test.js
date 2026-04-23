const { getYoutubeVideos } = require('../../api/youtube');

// Mock global fetch
global.fetch = jest.fn();

describe('getYoutubeVideos onRequest', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        process.env.YOUTUBE_API_KEY = 'test_api_key';
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

    test('should search YouTube Data API and return videos', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                items: [
                    { id: { videoId: 'video1' }, snippet: { title: 'Lesson 1' } },
                    { id: { videoId: 'video2' }, snippet: { title: 'Lesson 2' } }
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
            expect.stringContaining('https://www.googleapis.com/youtube/v3/search'),
            expect.any(Object)
        );
    });

    test('should return fallback videos if YouTube API yields no results', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                items: []
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

    test('should handle YouTube API return without items and fallback', async () => {
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
