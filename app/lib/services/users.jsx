// app/lib/services/users.js
import pb from '../pocketbase';
import authService from './auth';

const userService = {
  async fetchProfile() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user found');

      const user = await pb.collection('users').getOne(currentUser.id);

      let avatarUrl = null;
      if (user.avatar) {
        avatarUrl = pb.files.getURL(user, user.avatar, { thumb: '150x150' });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: avatarUrl || null,
        phoneNo: user.phoneNo || '', // Changed from phoneNumber to phoneNo
        address: user.address || ''
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile({ name, phoneNo, address }) { // Changed parameter name to phoneNo
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user found');

      const updatedData = {
        name,
        phoneNo, // Changed from phoneNumber to phoneNo
        address
      };

      await pb.collection('users').update(currentUser.id, updatedData);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

export default userService;