//app/lib/services/auth.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../pocketbase';

const authService = {
  _listeners: [],

  onAuthChange(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback);
    };
  },

  _notifyListeners(user) {
    this._listeners.forEach((listener) => listener(user));
  },

  async signup(email, password, name) {
    try {
      if (!email || !password || !name) {
        return { success: false, error: 'Please provide email, password, and name' };
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }
  
      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
      }
  
      const userData = {
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true,
        isFirstLogin: true,
      };
  
      const newUser = await pb.collection('users').create(userData);
  
      // Return success without attempting auto-login
      return {
        success: true,
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        warning: 'User created successfully, please log in manually'
      };
    } catch (error) {
      if (error.status === 400) return { success: false, error: 'Email already exists or invalid credentials' };
      if (error.status === 0) return { success: false, error: 'Network error. Please check your connection' };
      if (error.status === 403) return { success: false, error: 'Password authentication is not enabled for this collection' };
      console.error('Signup error:', error.message, error.data);
      return { success: false, error: `Signup failed: ${error.message}` };
    }
  },

  async login(email, password) {
    try {
      if (!email || !password) {
        return { success: false, error: 'Please enter both email and password' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      pb.authStore.clear();
      const authData = await pb.collection('users').authWithPassword(email, password);

      const authStorage = { token: pb.authStore.token, record: authData.record };
      await AsyncStorage.setItem('pb_auth', JSON.stringify(authStorage));
      this._notifyListeners(authData.record);

      return {
        success: true,
        user: { 
          id: authData.record.id, 
          name: authData.record.name, 
          email: authData.record.email,
          isFirstLogin: authData.record.isFirstLogin
        }
      };
    } catch (error) {
      if (error.status === 400) return { success: false, error: 'Invalid email or password' };
      if (error.status === 0) return { success: false, error: 'Network error. Please check your connection' };
      if (error.status === 403) return { success: false, error: 'Password authentication is not enabled for this collection' };
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async logout() {
    try {
      pb.authStore.clear();
      await AsyncStorage.removeItem('pb_auth');
      this._notifyListeners(null);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getCurrentUser() {
    try {
      const storedAuth = await AsyncStorage.getItem('pb_auth');
      if (!storedAuth) return null;

      const { token, record } = JSON.parse(storedAuth);
      pb.authStore.save(token, record);

      if (pb.authStore.isValid) {
        return {
          id: record.id,
          name: record.name,
          email: record.email,
          isFirstLogin: record.isFirstLogin
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async updateUser(userId, data) {
    try {
      const updatedRecord = await pb.collection('users').update(userId, data);
      const storedAuth = await AsyncStorage.getItem('pb_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        authData.record = updatedRecord;
        await AsyncStorage.setItem('pb_auth', JSON.stringify(authData));
      }
      this._notifyListeners(updatedRecord);
      return {
        success: true,
        user: {
          id: updatedRecord.id,
          name: updatedRecord.name,
          email: updatedRecord.email,
          isFirstLogin: updatedRecord.isFirstLogin
        }
      };
    } catch (error) {
      console.error('Error updating user:', error.message);
      return { success: false, error: 'Failed to update user data' };
    }
  }
};

export default authService;