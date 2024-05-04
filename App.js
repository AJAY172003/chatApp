import ChatScreen from "./src/components/ChatScreen";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from "./src/screens/HomeScreen";
import GoogleSigninScreen from './GoogleSigninScreen'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Start from "./Start";

const Stack = createNativeStackNavigator();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      >
      <Stack.Screen name="signin" component={GoogleSigninScreen}  options={{ headerShown: false }}/>
        <Stack.Screen
          options={{
            headerShown: false
          }}
          name="home" component={HomeScreen} />
        <Stack.Screen
          options={{
            headerShown: false, headerStyle: {
              backgroundColor: '#0000000'
            }
          }}
          name="chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>

  )
}
export default App;