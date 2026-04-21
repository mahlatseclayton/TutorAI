// Mock for Firebase Functions Frontend SDK
export const getFunctions = jest.fn();
export const httpsCallable = jest.fn(() => jest.fn(async () => ({ data: { success: true } })));
