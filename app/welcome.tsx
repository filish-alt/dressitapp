import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientButton from '../components/ui/GradientButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      icon: 'trending-up',
      text: 'Browse trending styles',
    },
    {
      icon: 'hanger',
      text: 'Create your fashion collections',
    },
    {
      icon: 'magic-staff', // Note: Using magic-staff as magic-wand isn't available in MaterialCommunityIcons
      text: 'Get personalized recommendations',
    },
  ];

  const handleContinue = () => {
    navigation.navigate('Tabs'); // Navigate to the main tabs
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>Welcome to Dress It!</Text>
        <Text style={styles.subtitle}>
          Thank you for logging in. We're excited to help you discover and create amazing fashion.
        </Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={feature.icon} 
                  size={28} 
                  color="#364DEF" 
                />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
        
        <GradientButton onPress={handleContinue} title="Continue to App" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#E8ECFF',
    borderRadius: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});

export default WelcomeScreen;

