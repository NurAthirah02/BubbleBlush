import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import authService from '../lib/services/auth';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  const handleSignup = async () => {
    try {
      setError('');
      setWarning('');
      setModalVisible(false); // Reset modal
      const result = await authService.signup(email, password, name);
      if (result.success) {
        if (result.warning) {
          setWarning(result.warning);
          navigation.navigate('Login'); // Navigate to Login screen on warning
        } else {
          setModalVisible(true); // Show modal on success (if auto-login were kept)
        }
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Signup error:', err);
    }
  };

  const handleModalOk = () => {
    setModalVisible(false); // Close modal
    navigation.navigate('Login'); // Navigate to Login
  };

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // For Android back button
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>Successful sign up</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalOk}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, error || warning ? styles.headerWithError : null]}>
        <Image
          source={require('../assets/login.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.pinkContainer} />

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#AD1457" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#AD1457" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#AD1457" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
          Have we met before? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8d7d6',
  },
  header: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.5 }, { translateY: -height * 0.45 }],
    alignItems: 'center',
    width: width,
  },
  headerWithError: {
    transform: [{ translateX: -width * 0.5 }, { translateY: -height * 0.55 }],
  },
  logo: {
    width: width * 0.95,
    height: height * 0.5,
    marginBottom: 10,
  },
  pinkContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#AD1457',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.03,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#AD1457',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: 'MyFont-Regular',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  warningText: {
    color: '#FFA500',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#AD1457',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  loginText: {
    color: '#000000',
    fontSize: 14,
    marginTop: 15,
    fontFamily: 'MyFont-Regular',
  },
  loginLink: {
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#AD1457',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AD1457',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  modalMessage: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'MyFont-Regular',
  },
  modalButton: {
    width: '60%',
    height: 45,
    backgroundColor: '#AD1457',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F06292', // Lighter pink for border
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
});

export default SignupScreen;