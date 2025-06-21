import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/constants/Colors';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// export default function PostScreen() {
//   const { colors } = useTheme();
//   const backgroundColor = colors.background;
//   const textColor = colors.text;
export default function CreateLook() {
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);


 useEffect(() => {
    const loadProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('https://dev.dressitnow.com/api/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.data);
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1
    });

    if (!result.canceled) {
      setMedia([...media, ...result.assets]);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.name || !profile?.gender || !profile?.interested_in || !profile?.dob) {
      Alert.alert('Incomplete Profile', 'Please complete your profile (name, gender, interested in, age) to publish your look.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();

    formData.append('description', description);
    formData.append('set_goal', goal);
    formData.append('location', location);

    media.forEach((file, index) => {
      formData.append('media[]', {
        uri: file.uri,
        name: `media_${index}.jpg`,
        type: 'image/jpeg'
      } as any);
    });

    try {
      const response = await axios.post('https://dev.dressitnow.com/api/looks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      Alert.alert('Success', 'Your look has been published!');
    } catch (error: any) {
      console.error('Create look error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to create look');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Description:</Text>
      <TextInput value={description} onChangeText={setDescription} style={{ borderBottomWidth: 1 }} />

      <Text>Goal (Money):</Text>
      <TextInput value={goal} onChangeText={setGoal} keyboardType="numeric" style={{ borderBottomWidth: 1 }} />

      <Text>Location:</Text>
      <TextInput value={location} onChangeText={setLocation} style={{ borderBottomWidth: 1 }} />

      <Button title="Pick Images" onPress={pickImage} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {media.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={{ width: 80, height: 80, margin: 5 }} />
        ))}
      </View>

      <Button title="Publish Look" onPress={handleSubmit} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  button: {
    backgroundColor: BRAND,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

