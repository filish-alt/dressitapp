import { type ComponentProps } from 'react';
import { Platform, Linking, TouchableOpacity, Text } from 'react-native';

type Props = ComponentProps<typeof TouchableOpacity> & { 
  href: string;
  children: React.ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = async () => {
    try {
      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(href);
      
      if (supported) {
        // Open the URL with the default browser
        await Linking.openURL(href);
      } else {
        console.warn('Cannot open URL:', href);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <TouchableOpacity
      {...rest}
      onPress={handlePress}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}
