// Mock for Firebase Firestore
export const getFirestore = jest.fn();
export const doc = jest.fn((db, collection, id) => ({ db, collection, id }));
export const setDoc = jest.fn();
export const getDoc = jest.fn(() => ({
  exists: () => true,
  data: () => ({ points: 100, name: 'Test User' })
}));
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-doc-id' }));
export const collection = jest.fn();
export const query = jest.fn();
export const getDocs = jest.fn(() => Promise.resolve({ docs: [], forEach: jest.fn(), empty: true }));
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
