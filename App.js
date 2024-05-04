import ChatScreen from "./src/components/ChatScreen";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from "./src/screens/HomeScreen";
import { routes } from "./src/constants/routes";
import { SearchList } from "./src/screens/SearchList";
import store from "./src/redux/store";
import {Provider} from 'react-redux';

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