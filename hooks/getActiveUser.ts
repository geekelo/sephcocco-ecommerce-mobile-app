import AsyncStorage from "@react-native-async-storage/async-storage";

export const getActiveUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Fallback to individual AsyncStorage items
    const [id, name, email, role] = await Promise.all([
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('userName'), 
      AsyncStorage.getItem('userEmail'),
      AsyncStorage.getItem('userRole')
    ]);
    
    return {
      id: id || await AsyncStorage.getItem('user_id'),
      name: name || await AsyncStorage.getItem('user_name'),
      email: email || await AsyncStorage.getItem('user_email'),
      role: role || 'user'
    };
  } catch (e) {
    console.error('Error getting user data:', e);
    return null;
  }
};