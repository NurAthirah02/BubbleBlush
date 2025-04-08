//app/screens/login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import authService from '../lib/services/auth';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  const handleLogin = async () => {
    setError('');
    const result = await authService.login(email, password);
    if (result.success) {
      navigation.navigate('Tabs');
    } else {
      setError(result.error);
    }
  };

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Logo and Title */}
      <View style={[styles.header, error ? styles.headerWithError : null]}>
        <Image 
          source={require('../assets/login.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      {/* Pink container fixed at the bottom */}
      <View style={styles.pinkContainer} />

      {/* White form container */}
      <View style={styles.formContainer}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Are you new here, pretty? <Text style={styles.signupLink}>Sign up</Text>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
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
  signupText: {
    color: '#000000',
    fontSize: 14,
    marginTop: 15,
    fontFamily: 'MyFont-Regular',
  },
  signupLink: {
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
  },
});

export default LoginScreen;