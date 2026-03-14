import { Client, Account, Databases } from 'react-native-appwrite';
import Constants from 'expo-constants';

const getEnvVar = (key: string): string => {
  const extra = Constants.expoConfig?.extra;
  if (extra?.[key]) return extra[key];
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
  return '';
};

export const CONFIG = {
  projectId: getEnvVar('EXPO_PUBLIC_APPWRITE_PROJECT_ID'),
  endpoint: getEnvVar('EXPO_PUBLIC_APPWRITE_ENDPOINT'),
  databaseId: getEnvVar('EXPO_PUBLIC_APPWRITE_DATABASE_ID'),
  usersCollectionId: getEnvVar('EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID'),
  watchlistCollectionId: getEnvVar('EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID'),
  googleRedirectUri: getEnvVar('EXPO_PUBLIC_APPWRITE_GOOGLE_REDIRECT_URI'),
};

export const client = new Client()
  .setProject(CONFIG.projectId)
  .setEndpoint(CONFIG.endpoint);

export const account = new Account(client);
export const databases = new Databases(client);