import ChatScreen from "./src/components/ChatScreen";
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from "./src/screens/HomeScreen";
import Settings from "./src/screens/Settings";
import FirstScreen from "./src/screens/FirstScreen";
import { routes } from "./src/constants/routes";
import { SearchList } from "./src/screens/SearchList";
import store from "./src/redux/store";
import { Provider, useDispatch } from 'react-redux';
import { ChatManager } from "./src/screens/ChatManager";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";


const Stack = createNativeStackNavigator();
function App() {

  return (

    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, headerStyle: {
              backgroundColor: '#0000000'
            }
          }}
        >

          <Stack.Screen
            name={routes.WELCOMESCREEN} component={WelcomeScreen} />
          <Stack.Screen
            name={routes.FIRSTSCREEN} component={FirstScreen} />
          <Stack.Screen
            name={routes.SETTINGS} component={Settings} />
          <Stack.Screen
            name={routes.HOMESCREEN} component={HomeScreen} />
          <Stack.Screen
            name={routes.CHATMANAGER} component={ChatManager} />
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