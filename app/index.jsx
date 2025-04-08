// app/index.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLayout from './_layout';

const App = () => {
  return (
    <NavigationContainer>
      <AppLayout />
    </NavigationContainer>
  );
};

export default App;