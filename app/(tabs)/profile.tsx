import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProfileTab() {
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Login token:', token);

        // const response = await axios.get('https://dev.dressitnow.com/api/profile', {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        const userId = 1;
        router.replace(`/profile/${userId}`);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserAndRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
