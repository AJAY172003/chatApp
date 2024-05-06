import {useState} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Settings from '../assets/images/settings.svg';
import { routes } from '../constants/routes';

export const HomeScreen = ({navigation}) => {
  const [numOnlineUsers, setNumOnlineUsers] = useState(2000);
  return (
    <View
      style={{
        backgroundColor: 'black',
        height: '100%',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
          {`${numOnlineUsers}+\nPEOPLE ARE ONLINE`}
        </Text>
        <TouchableOpacity onPress={()=>navigation.navigate(routes.SETTINGS)}>
        <Settings />
        </TouchableOpacity>
      </View>
      <Image
        source={require('../assets/images/chat_with_strangers.png')}
        style={{
          width: '100%',
          height: '10%',
          alignSelf: 'center',
        }}
      />
    </View>
  );
};
