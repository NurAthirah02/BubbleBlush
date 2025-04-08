//app/_layout.jsx
import React, { useEffect, useState, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import authService from './lib/services/auth';
import LoginScreen from './screens/login';
import SignupScreen from './screens/signup';
import FAQScreen from './screens/faq';
import { firstLoginManual } from './lib/manualData';
import HomeStack from './stacks/homeStack';
import ProfileStack from './stacks/profileStack';
import SettingsScreen from './(tabs)/settings';

const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ checkAuth, triggerTutorial }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerFocused,
              ]}
            >
              {focused ? (
                <View style={styles.activeCircle}>
                  <Ionicons name={iconName} size={size + 8} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.contentWrapper}>
                  <Ionicons name={iconName} size={size} color="#AD1457" />
                  <Text style={[styles.tabLabel, { color: '#AD1457' }]}>
                    {route.name}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#AD1457',
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        children={() => <SettingsScreen showTutorial={triggerTutorial} />}
        options={{ headerShown: true }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileStack checkAuth={checkAuth} />}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const AppLayout = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  };

  const triggerTutorial = () => {
    setShowTutorial(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    async function initialize() {
      try {
        await Font.loadAsync({
          'MyFont-Regular': require('./assets/font/PTSerif-Regular.ttf'),
        });
        console.log('Font loaded');
        setFontLoaded(true);

        const currentUser = await checkAuth();
        console.log('Current user:', currentUser);
        if (currentUser?.isFirstLogin) {
          console.log('Showing tutorial due to isFirstLogin:', currentUser.isFirstLogin);
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    }
    initialize();

    const unsubscribe = authService.onAuthChange((user) => {
      setUser(user);
      if (user?.isFirstLogin) {
        setShowTutorial(true);
      } else {
        setShowTutorial(false);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    console.log('Show tutorial state:', showTutorial, 'Current step:', currentStep);
    if (showTutorial) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showTutorial, currentStep]);

  const nextStep = () => {
    const manual = firstLoginManual();
    if (currentStep < manual.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    if (user?.isFirstLogin) {
      try {
        const updateResult = await authService.updateUser(user.id, { isFirstLogin: false });
        console.log('Update result:', updateResult);
        if (updateResult.success) {
          setUser(updateResult.user);
        } else {
          console.error('Failed to update isFirstLogin:', updateResult.error);
        }
      } catch (error) {
        console.error('Error updating isFirstLogin:', error);
      }
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  if (!fontLoaded || loading) {
    return null;
  }

  const manual = firstLoginManual();

  return (
    <View style={styles.rootContainer}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Tabs"
              children={(props) => <TabNavigator {...props} checkAuth={checkAuth} triggerTutorial={triggerTutorial} />}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FAQ"
              component={FAQScreen}
              options={{ headerShown: true, title: 'FAQ' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>

      {showTutorial && (
        <View style={styles.overlay}>
          <View style={styles.darkOverlay} />
          <Animated.View style={[styles.tutorialContainer, { opacity: fadeAnim }]}>
            {currentStep === 0 ? (
              <>
                <Text style={styles.tutorialTitle}>{manual.title}</Text>
                <Text style={styles.tutorialText}>{manual.intro}</Text>
                <View style={styles.progressBar}>
                  {Array(manual.steps.length + 1)
                    .fill(0)
                    .map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.progressDot,
                          {
                            backgroundColor:
                              i <= currentStep ? '#AD1457' : '#ccc',
                          },
                        ]}
                      />
                    ))}
                </View>
              </>
            ) : (
              <>
                <Image
                  source={manual.steps[currentStep - 1].image}
                  style={styles.tutorialImage}
                />
                <View style={styles.progressBar}>
                  {Array(manual.steps.length + 1)
                    .fill(0)
                    .map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.progressDot,
                          {
                            backgroundColor:
                              i <= currentStep ? '#AD1457' : '#ccc',
                          },
                        ]}
                      />
                    ))}
                </View>
                <Text style={styles.tutorialTitle}>
                  {manual.steps[currentStep - 1].title}
                </Text>
                <Text style={styles.tutorialText}>
                  {manual.steps[currentStep - 1].description}
                </Text>
              </>
            )}
            <View style={styles.tutorialButtonRow}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.tutorialButton}
                  onPress={prevStep}
                >
                  <Text style={styles.tutorialButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.tutorialButton}
                onPress={
                  currentStep === manual.steps.length
                    ? completeTutorial
                    : nextStep
                }
              >
                <Text style={styles.tutorialButtonText}>
                  {currentStep === manual.steps.length ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.skipButton} onPress={skipTutorial}>
              <Text style={styles.skipButtonText}>Skip Tutorial</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: 'absolute',
    bottom: 20,
    borderTopWidth: 0,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F06292',
  },
  iconContainer: {
    width: 80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerFocused: {
    width: 80,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: -10,
  },
  contentWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    paddingTop: 12,
  },
  activeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#AD1457',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -10 }],
    borderWidth: 1,
    borderColor: '#F06292',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tutorialContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 12,
    maxHeight: height - TAB_BAR_HEIGHT - 40,
  },
  tutorialImage: {
    width: 250,
    height: 250,
    marginBottom: 15,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AD1457',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  tutorialText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'MyFont-Regular',
  },
  tutorialButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tutorialButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  tutorialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  skipButton: {
    marginTop: 10,
  },
  skipButtonText: {
    color: '#AD1457',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'MyFont-Regular',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default AppLayout;