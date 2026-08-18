import {
  createUserWithEmailAndPassword,
  getAuth,
  indexedDBLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const userSignOut = async () => {
  const auth = await getAuth();
  if (auth) {
    await signOut(auth);
  }
};

export const currentAuthUser = () => {
  const auth = getAuth();
  const user = auth?.currentUser;
  return user;
};

export const currentAuthUserWhenReady = async () => {
  const auth = getAuth();
  await auth.authStateReady();
  return auth.currentUser;
};

export const setAuthPersistence = async () => {
  const auth = getAuth();

  await setPersistence(auth, indexedDBLocalPersistence);
};

export const userCreateEmailPassword = async (email: string, password: string) => {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const userSignInEmailPassword = async (email: string, password: string) => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
