import { BackHandler, Image, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import { useDispatch, useSelector } from 'react-redux';
import { setChatData, setCurrentChatTab } from '../redux/DataSlice';
import { createClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react';
import ChatScreen from '../components/ChatScreen';
import { ConfirmationPopup } from '../components/ConfirmationPopup';
import axios from 'axios';

const MAX_CHAT_TAB_LIMIT = 5;

const supabase = createClient("https://ninflipyamhqwcrfymmu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU")

export const ChatManager = ({ navigation, route }) => {

    const [confirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
    const [confirmationPopupLoading, setConfirmationPopupLoading] = useState(false);

    const { userId = uuid.v4() } = route.params;
    const dispatch = useDispatch();
    const chatDataRef = useRef(null);
    const { ChatData, CurrentChatTab } = useSelector(state => state.data);

    useEffect(() => {
        chatDataRef.current = ChatData;
    }, [ChatData]);

    // Create a function to handle inserts
    const handleInserts = (payload) => {
        const latestChatData = chatDataRef.current;
        console.log('Change received!', payload);
        console.log("chatData: ", latestChatData);
        const senderId = payload.new.sender_id;
        const receiverId = payload.new.receiver_id
        console.log(receiverId, userId);
        if (receiverId == userId) {
            // check if senderId is in chatData
            if (Object.values(latestChatData).some(chatTab => chatTab.receiverId == senderId)) {

                // set new Message in chatData
                let tempChatData = { ...latestChatData };
                let chatTabKey = Object.keys(tempChatData).find(key => tempChatData[key].receiverId == senderId);
                console.log(chatTabKey)
                tempChatData[chatTabKey] = { ...tempChatData[chatTabKey], messages: [...tempChatData[chatTabKey].messages, { text: payload.new.message, belongs_to: false, messageId: payload.new.messageId }] };
                dispatch(setChatData(tempChatData));
                console.log(tempChatData)
                console.log("new msg is recieved from senderId: ", senderId);
            }
        }
    }

    // Create a function to handle deletes
    const handleDeletes = (payload) => {
        const latestChatData = chatDataRef.current;
        console.log('Change received for delete in chat!', payload);
        console.log("chatData: ", latestChatData);
        const user1 = payload.old.user1;
        const user2 = payload.old.user2;

        if (user1 == userId || user2 == userId) {
            // if user1 == userId, then find user2 as receiverId in chatData and if user2 == userId, then find user1 as receiverId in chatData
            let chatTabKey = Object.keys(latestChatData).find(key => latestChatData[key].receiverId == (user1 == userId ? user2 : user1));
            let tempChatData = { ...latestChatData };

            // set receivedId to null and messages to empty array
            tempChatData[chatTabKey] = { receiverId: null, messages: [] };
            dispatch(setChatData(tempChatData));
            console.log("chat is deleted with user1: ", user1, " and user2: ", user2);
        }
    }

    const handleBack = async () => {
        setConfirmationPopupLoading(true);
        const response = await axios.post('https://chatserver-arnv.onrender.com/removeUsers', {
            userId: userId,
            connectedUserIds: Object.keys(ChatData).map(key => ChatData[key].receiverId)
        });

        if(response.status !== 200) {
            ToastAndroid.show("Error disconnecting chats", ToastAndroid.SHORT);
        }

        setConfirmationPopupLoading(true)
        setConfirmationPopupVisible(false);
        navigation.goBack();
    }

    useEffect(() => {
        if (userId !== null) {

            // Listen to inserts
            supabase
                .channel('messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleInserts)
                .subscribe();

            // Listen to deletes
            supabase
                .channel('chat')
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat' }, handleDeletes)
                .subscribe();
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            setConfirmationPopupVisible(true);
            return true;
        });


        return () => {
            console.log("supabase removed")
            if (userId !== null) {
                supabase.removeAllChannels();
            }
            backHandler.remove();
        }
    }, []);

    const handleAddChatTab = () => {
        if (Object.keys(ChatData).length >= MAX_CHAT_TAB_LIMIT) {
            ToastAndroid.show(`You can only have ${MAX_CHAT_TAB_LIMIT} chat tabs at a time`, ToastAndroid.SHORT);
        }
        else {
            // find the maximum number in the keys and add 1 to it
            let newChatTab = Math.max(...Object.keys(ChatData).map(key => parseInt(key))) + 1;

            let tempChatData = { ...ChatData };
            tempChatData[newChatTab] = {
                messages: [],
                receiverId: null
            };
            dispatch(setChatData(tempChatData));
            dispatch(setCurrentChatTab(newChatTab));
        }
    }

    const handleDeleteChatTab = (chatTabToDelete) => {
        let tempChatData = { ...ChatData };
        delete tempChatData[chatTabToDelete];
        dispatch(setChatData(tempChatData));
        if (CurrentChatTab == chatTabToDelete) {
            dispatch(setCurrentChatTab(Object.keys(tempChatData)[0]));
        }
    }

    return (
        <View
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'black'
            }}
        >
            <ScrollView
                style={{
                    height: 60,
                    flex: 1
                }}
                contentContainerStyle={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                    height: 60,
                    gap: 10
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 10,
                        height: 42,
                        justifyContent: 'flex-start',
                        borderBottomColor: '#0066b2',
                        borderBottomWidth: 2,
                    }}
                >
                    {
                        Object.keys(ChatData).map((key, index) => {
                            return (
                                <View
                                    key={index}
                                    style={{
                                        backgroundColor: CurrentChatTab == key ? '#0066b2' : 'grey',
                                        paddingHorizontal: 5,
                                        paddingVertical: 5,
                                        width: 80,
                                        height: 40,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        rowGap: 10
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => dispatch(setCurrentChatTab(key))}
                                        style={{
                                            flex: 1
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {CurrentChatTab == key ? `@(${key})` : key}
                                        </Text>
                                    </TouchableOpacity>
                                    {Object.keys(ChatData).length > 1 &&
                                        <TouchableOpacity
                                            onPress={() => handleDeleteChatTab(key)}
                                        >
                                            <Image
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    alignSelf: 'center'
                                                }}
                                                source={require('../assets/images/cancel_icon.png')}
                                            />
                                        </TouchableOpacity>
                                    }
                                </View>
                            )
                        })
                    }
                </View>

                <TouchableOpacity
                    onPress={handleAddChatTab}
                    style={{
                    }}
                >
                    <Image
                        style={{
                            width: 36,
                            height: 36,
                            alignSelf: 'center'
                        }}
                        source={require('../assets/images/plus_icon.png')}
                    />
                </TouchableOpacity>
            </ScrollView>
            {Object.keys(ChatData).map((key, index) => {
                return (
                    <View
                        style={{
                            display: CurrentChatTab == key ? 'flex' : 'none',
                            height: '80%',
                            backgroundColor: 'black',
                            flexDirection: 'column'
                        }}
                        key={index}>
                        <ChatScreen chatTab={key} supabase={supabase} userId={userId} />
                    </View>
                )
            })
            }
            <ConfirmationPopup
                isVisible={confirmationPopupVisible}
                title={`Are you sure you want to exit the chat? \n\nAll of your current chats will get disconnected`}
                positiveLabel="YES"
                positiveCallback={handleBack}
                negativeLabel="NO"
                negativeCallback={() => {
                    setConfirmationPopupVisible(false);
                }}
                popupLoader={confirmationPopupLoading}
            />
        </View>
    )
};