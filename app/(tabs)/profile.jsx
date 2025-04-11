import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import userService from '../lib/services/users';
import authService from '../lib/services/auth';

const ProfileScreen = ({ navigation, checkAuth }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
        });
        setFontLoaded(true);

        const profileData = await userService.fetchProfile();
        setProfile(profileData);
        setName(profileData.name || '');
        setPhoneNo(profileData.phoneNo || '');
        setAddress(profileData.address || '');
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  const handleLogout = async () => {
    try {
      const success = await authService.logout();
      if (success) {
        const currentUser = await checkAuth();
        if (!currentUser) {
          navigation.navigate('Login');
        }
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditPress = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile({ name, phoneNo, address });
      const updatedProfile = await userService.fetchProfile();
      setProfile(updatedProfile);
      setEditModalVisible(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setName(profile?.name || '');
    setPhoneNo(profile?.phoneNo || '');
    setAddress(profile?.address || '');
  };

  // Improved loading state to aid debugging
  if (!fontLoaded || loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={
              profile?.avatarUrl
                ? { uri: profile.avatarUrl }
                : require('../assets/profile.png')
            }
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.userName}>{profile?.name || 'User'}</Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{profile?.phoneNo || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.sectionTitle}>Address</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.infoValue}>{profile?.address || 'Not set'}</Text>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.sectionTitle}>More Actions</Text>
        </View>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('PurchaseHistory')}
          >
            <View style={styles.iconBackground}>
              <Ionicons name="time-outline" size={30} color="#AD1457" />
            </View>
            <Text style={styles.iconButtonText}>Purchase History</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#AD1457" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <View style={styles.iconBackground}>
              <Ionicons name="heart-outline" size={30} color="#AD1457" />
            </View>
            <Text style={styles.iconButtonText}>Wishlist</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#AD1457" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.sectionTitle}>Security</Text>
        </View>
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.securityRow} onPress={handleLogout}>
            <Text style={styles.securityText}>Log Out</Text>
            <Ionicons name="log-out-outline" size={24} color="#AD1457" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />

            <Text style={styles.modalLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={phoneNo}
              onChangeText={setPhoneNo}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.modalLabel}>Address</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              multiline
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveProfile}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={handleCloseEditModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: '#f8d7d6',
    borderRadius: 75,
    padding: 5,
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#AD1457',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  editButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  titleWrapper: {
    alignSelf: 'flex-start',
    marginLeft: '5%',
    marginBottom: 5,
    width: '90%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    fontFamily: 'MyFont-Regular',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'MyFont-Regular',
  },
  infoValue: {
    fontSize: 16,
    color: '#2D2D2D',
    fontWeight: '500',
    fontFamily: 'MyFont-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  securityText: {
    fontSize: 16,
    color: '#2D2D2D',
    fontWeight: '500',
    fontFamily: 'MyFont-Regular',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  iconBackground: {
    backgroundColor: '#f8d7d6',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconButtonText: {
    fontSize: 18,
    color: '#2D2D2D',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'MyFont-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 15,
    fontFamily: 'MyFont-Regular',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'MyFont-Regular',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#AD1457',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#2D2D2D',
    fontFamily: 'MyFont-Regular',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#666',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  loadingText: { 
    fontSize: 18,
    color: '#2D2D2D',
    fontFamily: 'MyFont-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;