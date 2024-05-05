import ChatScreen from "./src/components/ChatScreen";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from "./src/screens/HomeScreen";
<<<<<<< HEAD
import googlesignin from './src/components/GoogleSigninScreen';
=======
import { routes } from "./src/constants/routes";
import { SearchList } from "./src/screens/SearchList";
import store from "./src/redux/store";
import {Provider} from 'react-redux';
>>>>>>> 6faf3c9949889b199886bd34607848f48140a73d

const Stack = createNativeStackNavigator();
function App() {
  return (
<<<<<<< HEAD
    <NavigationContainer>
      <Stack.Navigator
      >
      {/* <Stack.Screen name="signin" component={googlesignin}  options={{ headerShown: false }}/> */}
        <Stack.Screen
          options={{
            headerShown: false
          }}
          name="home" component={HomeScreen} />
        <Stack.Screen
          options={{
=======
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
>>>>>>> 6faf3c9949889b199886bd34607848f48140a73d
            headerShown: false, headerStyle: {
              backgroundColor: '#0000000'
            }
          }}
        >
          <Stack.Screen
            name={routes.HOMESCREEN} component={HomeScreen} />
          <Stack.Screen
            name={routes.CHATSCREEN} component={ChatScreen} />
          <Stack.Screen
            name={routes.SEARCHLIST} component={SearchList} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>

  )
}
export default App;