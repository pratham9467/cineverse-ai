import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { account } from '@/lib/appwrite';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const url = Linking.parse(window.location.href);
      
      const userId = url.queryParams?.userId as string | undefined;
      const secret = url.queryParams?.secret as string | undefined;

      if (userId && secret) {
        try {
          await account.createSession(userId, secret);
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Session creation failed:', error);
          router.replace('/authscreen/login');
        }
      } else {
        router.replace('/authscreen/login');
      }
    };

    handleCallback();
  }, []);

  return null;
}
