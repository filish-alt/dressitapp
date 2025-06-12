import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // or '/register' if you want registration first
  }, []);

  return null;
}