import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, TextInput, ToastAndroid, TouchableOpacity, } from 'react-native';
import 'react-native-url-polyfill/auto';
import Send from '../assets/images/send.svg';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import uuid from 'react-native-uuid';
import {
  Text,
  View,
} from 'react-native';
import { setChatData, setLastFIOffset } from '../redux/DataSlice';
import Admob from './Admob';

const FEMALE = "Female";

function ChatScreen({ route, navigation, chatTab, supabase, userId, isLocked }) {
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [initialOpening, setInitialOpening] = useState(true);
  const [noMatchFound, setNoMatchFound] = useState(false);

  const { ChatData, CurrentChatTab, User, LastFIOffset } = useSelector(state => state.data);
  const chatDataRef = useRef(null);
  const dispatch = useDispatch();

  const handleChatRequest = async () => {
    setIsDisconnected(false);
    setNoMatchFound(false);
    try {
      const response = await axios.post('https://chatserver-arnv.onrender.com/user', {
        userId: userId,
        language: User.language,
        country: User.country,
        gender: User.gender,
        email: User.email,
        isFIRequired: LastFIOffset >= 3,
        requiredFilters: {}
      });

      if (response.data.user.gender === FEMALE) {
        dispatch(setLastFIOffset(0));
      }
      else {
        dispatch(setLastFIOffset(LastFIOffset + 1));
      }

      const latestChatData = chatDataRef.current;
      const matchedReceiverId = response.data.user.userId;
      const chatData = { ...latestChatData };
      chatData[chatTab] = { receiverId: matchedReceiverId, messages: [] };
      dispatch(setChatData(chatData));
      setReceiverId(matchedReceiverId);
    } catch (error) {
      console.error('Error fetching data:', error);
      ToastAndroid.show('No Match found! Try after some time', ToastAndroid.SHORT);
      setNoMatchFound(true);
    }
    setIsRequesting(false);
  }

  useEffect(() => {

    chatDataRef.current = ChatData;
    if (chatTab) {
      setMessages(ChatData[chatTab]?.messages);
      setReceiverId(ChatData[chatTab]?.receiverId);

      if (ChatData[chatTab]?.receiverId == null && isRequesting === false) {
        if ((User.isPremium && User.premiumSettings.autoReconnect) || initialOpening) {
          setInitialOpening(false);
          handleChatRequest();
          setIsRequesting(true);
        } else {
          setIsDisconnected(true);
        }
      }
    }
  }, [ChatData]);

  const sendMessage = async () => {
    while (isLocked);
    const randomId = uuid.v4();
    if (!messageText.trim()) return;
    try {
      const latestChatData = chatDataRef.current;
      const { error } = await supabase
        .from('messages')
        .insert([{ sender_id: userId, receiver_id: receiverId, message: messageText, messageId: randomId, created_at: new Date() }]);
      if (error) throw error;
      console.log("chatdata before sending message: ", latestChatData);
      setMessages(prevMessages => [...prevMessages, { text: messageText, belongs_to: true, messageId: randomId }]);
      dispatch(setChatData({ ...latestChatData, [chatTab]: { ...latestChatData[chatTab], messages: [...latestChatData[chatTab].messages, { text: messageText, belongs_to: true, messageId: randomId }] } }));
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const flatListRef = useRef(null);
  useEffect(() => {
    // Automatically scroll to the end when messages change
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // method to parse the text passed and idintifying the links in it and then returning the text component with the links
  const parseTextWithLinks = (text) => {
    // Regular expression to split text by URLs
    const parts = text.split(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/);
    return parts.map((part, index) => {
      if (part.match(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/)) {
        const url = part.startsWith("http") || part.startsWith("www") ? part : "http://" + part; // Append http:// to URLs missing a protocol or www.
        return (
          <Text key={index} style={{ color: '#FF4949' }} onPress={() => Linking.openURL(url)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const deleteMessagesForUser = async (userId) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    if (error) throw error;
  }

  const handleSkip = async () => {
    // delete entries from chat table where either user1 = userId and user2 = receiverId or user1 = receiverId and user2 = userId in a single query
    const { error } = await supabase
      .from('chat')
      .delete()
      .or(`and(user1.eq.${userId},user2.eq.${receiverId}),and(user2.eq.${userId},user1.eq.${receiverId})`)
    if (error) throw error;

    // delete entries from messages table where either sender_id = userId or receiver_id = userId in a single query
    deleteMessagesForUser(userId);
    setIsDisconnected(true);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: 'black',
        flexDirection: 'column',
        paddingBottom: 10
      }}>
      {isRequesting ?
        <View >
          <ActivityIndicator size={30} />
          <Text
            style={{
              color: 'white',
              textAlign: 'center'
            }}>Finding match...</Text>
        </View>
        :
        <>
          {!isDisconnected && !noMatchFound ?
            <View
              style={{
                height: '90%',
              }}>

              <Text
                style={{
                  color: 'white',
                  fontSize: 14,
                  textAlign: 'center',
                  padding: 10,
                  fontStyle: 'italic'
                }}
              >
                {`You are talking with: `}
                <Text
                  style={{
                    color: '#0066b2',
                    fontWeight: 500
                  }}
                >{receiverId}</Text>
              </Text>

              <FlatList
                ref={flatListRef}
                initialNumToRender={messages.length || 1}
                style={{ backgroundColor: 'black', marginBottom: 10 }}
                data={messages}
                renderItem={({ item, index }) => (
                  <>
                    {
                      item.belongs_to ?
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'flex-end',
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 14,
                              flexWrap: 'wrap', // Allow text to wrap if it exceeds the available width
                              backgroundColor: '#62259F',
                              paddingVertical: 10,
                              paddingHorizontal: 15,
                              borderRadius: 30,
                              marginLeft: '20%',
                              marginRight: 10,
                              marginTop: 5,
                              marginBottom: 10
                            }}> {parseTextWithLinks(item.text)}</Text>
                        </View>
                        :
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'flex-start',
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 14,
                              flexWrap: 'wrap', // Allow text to wrap if it exceeds the available width
                              backgroundColor: '#0066b2',
                              paddingVertical: 10,
                              paddingHorizontal: 15,
                              borderRadius: 30,
                              marginRight: '20%',
                              marginLeft: 10,
                              marginTop: 5,
                              marginBottom: 10
                            }}> {parseTextWithLinks(item.text)}</Text>
                        </View>
                    }
                  </>
                )}
              />
            </View>
            :
            <View style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingBottom: 40
            }}>
              <Admob />
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setIsRequesting(true);
                    handleChatRequest();
                  }}
                  style={{
                    marginTop: 30
                  }}
                >
                  <Image
                    source={require('../assets/images/reconnect_icon.png')}
                    style={{
                      height: 60,
                      width: 60,
                      alignSelf: 'center',
                    }}
                  />

                  <Text style={{
                    color: 'white',
                    marginTop: 20,
                    textAlign: 'center'
                  }}>Click to reconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          {!isDisconnected && !noMatchFound ?
            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={handleSkip}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 12,
                  height: 50,
                  width: 70,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    fontSize: 18
                  }}
                >SKIP</Text>
              </TouchableOpacity>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 50,
                  flex: 1
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 50,
                    width: '90%',
                    justifyContent: 'center',
                    minHeight: 50
                  }}>
                  <View
                    style={{
                      height: '100%',
                      width: '80%'
                    }}>
                    <TextInput
                      placeholderTextColor="grey"
                      placeholder='Type your message here...'
                      style={{ flex: 1, color: 'black', width: '100%' }}
                      value={messageText}
                      onChangeText={setMessageText}
                      multiline={true}
                    />
                  </View>
                  <TouchableOpacity onPress={sendMessage}>
                    <Send />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            : <View
              style={{
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: 'white',
                  padding: 10,
                }}
              >{isDisconnected ? "Stranger is Disconnected.": "No Match Found. Try again after sometime"}</Text>
            </View>}
        </>
      }
    </View>
  )
}

export default ChatScreen;
