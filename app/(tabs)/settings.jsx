import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font'; // Import expo-font

const SettingsScreen = ({ showTutorial }) => {
  const navigation = useNavigation();
  const [fontLoaded, setFontLoaded] = useState(false); // State to track font loading

  // Load the custom font
  useEffect(() => {
    async function loadFont() {
      try {
        await Font.loadAsync({
          'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'), // Import font
        });
        setFontLoaded(true);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    }
    loadFont();
  }, []);

  // Settings menu data
  const settingsMenu = [
    { id: '1', title: 'FAQ', screen: 'FAQ' },
    { id: '2', title: 'User Manual', action: () => showTutorial() },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={item.screen ? () => navigation.navigate(item.screen) : item.action}
    >
      <Text style={styles.itemText}>{item.title}</Text>
      <Ionicons name="ellipsis-vertical" size={20} color="#AD1457" />
    </TouchableOpacity>
  );

  // Return null until font is loaded
  if (!fontLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={settingsMenu}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'MyFont-Regular', 
  },
});

export default SettingsScreen;