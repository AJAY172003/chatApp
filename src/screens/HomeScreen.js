import { useState } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Settings from '../assets/images/settings.svg';
import { routes } from '../constants/routes';
import { setChatData, setCurrentChatTab } from '../redux/DataSlice';
import { useDispatch } from 'react-redux';
import uuid from 'react-native-uuid';

export const HomeScreen = ({ navigation }) => {
    const [numOnlineUsers, setNumOnlineUsers] = useState(2000);
    const dispatch = useDispatch();
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
                <TouchableOpacity onPress={() => navigation.navigate(routes.SETTINGS)}>
                    <Settings />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={() => {
                    dispatch(setCurrentChatTab(1));
                    dispatch(setChatData({
                        1: {
                            receiverId: null,
                            messages: []
                        }
                    }));
                    navigation.navigate(routes.CHATMANAGER, {
                        userId: uuid.v4(),
                    });
                }}
            >
                <Image
                    source={require('../assets/images/chat_with_strangers.png')}
                    style={{
                        resizeMode: 'cover',
                        alignSelf: 'center',
                    }}
                />

            </TouchableOpacity>
        </View>
    );
};
