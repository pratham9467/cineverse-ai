import * as Linking from 'expo-linking';
import { account, databases, CONFIG } from './appwrite';
import { ID, Query, OAuthProvider } from 'react-native-appwrite';

export interface User {
  $id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export async function initAppwrite(): Promise<boolean> {
  try {
    // Add timeout for the account.get() call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Appwrite connection timeout')), 4000)
    })

    await Promise.race([
      account.get(),
      timeoutPromise
    ])

    console.log('Appwrite connected successfully (user session active)')
    return true
  } catch (error: any) {
    // A 401 means the backend IS reachable, just no active session — that's fine
    const code = error?.code ?? error?.status ?? 0
    if (code === 401 || error?.type === 'general_unauthorized_scope') {
      console.log('Appwrite connected (no active session)')
      return true
    }
    // Only real network errors / timeouts mean the backend is unavailable
    console.error('Appwrite connection failed:', error)
    return false
  }
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const user = await account.create(ID.unique(), email, password, name);
  
  if (CONFIG.databaseId && CONFIG.usersCollectionId) {
    try {
      await databases.createDocument(
        CONFIG.databaseId,
        CONFIG.usersCollectionId,
        user.$id,
        {
          email,
          name,
        }
      );
    } catch (dbError) {
      console.warn('Failed to create user document in database:', dbError);
    }
  }
  
  return {
    $id: user.$id,
    email: user.email,
    name: user.name,
  };
}

export async function login(email: string, password: string): Promise<User> {
  await account.createEmailPasswordSession(email, password);
  const user = await getCurrentUser();
  if (!user) throw new Error('Failed to get user');
  return user;
}

export async function logout(): Promise<void> {
  await account.deleteSession('current');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await account.get();
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      avatarUrl: (user as any).prefs?.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function googleLogin(): Promise<void> {
  const redirectUrl = CONFIG.googleRedirectUri || Linking.createURL('auth/google/callback');
  
  const tokenUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    redirectUrl,
    redirectUrl
  );
  
  if (!tokenUrl) {
    throw new Error('Failed to create OAuth2 token');
  }
  
  await Linking.openURL(tokenUrl.toString());
}

export async function checkUserExists(userId: string): Promise<boolean> {
  if (!CONFIG.databaseId || !CONFIG.usersCollectionId) {
    return true;
  }
  
  try {
    const result = await databases.listDocuments(
      CONFIG.databaseId,
      CONFIG.usersCollectionId,
      [Query.equal('$id', userId)]
    );
    return result.total > 0;
  } catch {
    return false;
  }
}

export async function updateUserPrefs(prefs: Record<string, unknown>): Promise<void> {
  await account.updatePrefs(prefs);
}