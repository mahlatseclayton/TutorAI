// Mock for Firebase Firestore
export const getFirestore = jest.fn();
export const doc = jest.fn((db, collection, id) => ({ db, collection, id }));
export const setDoc = jest.fn();
export const getDoc = jest.fn(() => ({
  exists: () => true,
  data: () => ({ points: 100, name: 'Test User' })
}));
export const collection = jest.fn();
export const query = jest.fn();
export const getDocs = jest.fn();
