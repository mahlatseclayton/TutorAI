// Mock for Firebase Auth
export const getAuth = jest.fn(() => ({
  currentUser: { uid: 'test-uid', emailVerified: true },
  onAuthStateChanged: jest.fn((cb) => cb({ uid: 'test-uid' })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

export const GoogleAuthProvider = jest.fn();
export const signInWithPopup = jest.fn();
export const sendPasswordResetEmail = jest.fn();
export const updateProfile = jest.fn();
export const sendEmailVerification = jest.fn();
