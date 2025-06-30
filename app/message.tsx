import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ChatScreen() {
  const route = useRoute();
  const { userId, name } = (route.params as { userId?: string; name?: string }) || {};

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat with {name} (User ID: {userId})</Text>
    </View>
  );
}
