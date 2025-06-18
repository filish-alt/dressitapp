import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@dressit:access_token',
  REFRESH_TOKEN: '@dressit:refresh_token',
  USER_DATA: '@dressit:user_data'
};

/**
 * Saves the authentication token to AsyncStorage
 * @param token The access token to save
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.warn('Error saving auth token:', error);
    throw new Error('Failed to save authentication token');
  }
};

/**
 * Retrieves the authentication token from AsyncStorage
 * @returns The stored token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Removes the authentication token from AsyncStorage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('Error removing auth token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

/**
 * Saves user data to AsyncStorage
 * @param userData The user data object to save
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
  } catch (error) {
    console.warn('Error saving user data:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Retrieves user data from AsyncStorage
 * @returns The stored user data or null if not found
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.warn('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Saves a refresh token to AsyncStorage
 * @param refreshToken The refresh token to save
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } catch (error) {
    console.warn('Error saving refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
};

/**
 * Retrieves the refresh token from AsyncStorage
 * @returns The stored refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.warn('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Refreshes the authentication token using the refresh token
 * This is a placeholder implementation and needs to be updated with the actual API call
 * @returns A new access token if successful
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }
    
    // TODO: Implement the actual API call to refresh the token
    // This would typically be an API call to a '/refresh' endpoint
    // For now, this is just a placeholder
    
    // Example implementation (to be replaced with actual API call):
    // const response = await axios.post('http://dressit.rasoisoftware.com/api/refresh', { refreshToken });
    // const newAccessToken = response.data.accessToken;
    // await saveToken(newAccessToken);
    // return newAccessToken;
    
    return null;
  } catch (error) {
    console.warn('Error refreshing token:', error);
    return null;
  }
};

/**
 * Clears all authentication data from AsyncStorage
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA
    ]);
  } catch (error) {
    console.warn('Error during logout:', error);
    throw new Error('Failed to clear authentication data');
  }
};

/**
 * Checks if the user is authenticated by verifying if a token exists
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return token !== null;
  } catch (error) {
    console.warn('Error checking authentication status:', error);
    return false;
  }
};

