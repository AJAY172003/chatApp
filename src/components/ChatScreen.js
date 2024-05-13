import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import 'react-native-url-polyfill/auto';
import Send from '../assets/images/send.svg';
import {useDispatch, useSelector} from 'react-redux';
import uuid from 'react-native-uuid';
import {Text, View} from 'react-native';
import {setChatData, setLastFIOffset} from '../redux/DataSlice';
import {AdView} from '../screens/AdView';
import {insertMessage} from '../utils/SupaClient';
import {sendChatRequest, skipChat} from '../utils/api';

const FEMALE = 'Female';

function ChatScreen({ chatTab, userId, isLocked}) {
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [initialOpening, setInitialOpening] = useState(true);
  const [noMatchFound, setNoMatchFound] = useState(false);

  const {ChatData, User, LastFIOffset, RequiredFilters, IP} =
    useSelector(state => state.data);
  const chatDataRef = useRef(null);

  const dispatch = useDispatch();

  const handleChatRequest = async () => {
    console.log("Requesting chat for tab: ", chatTab)
    setIsDisconnected(false);
    setNoMatchFound(false);
    try {
      const response = await sendChatRequest({
        userId: userId,
        language: User.Language,
        country: User.Country,
        gender: User.Gender,
        email: User.Email,
        ip: IP,
        isFIRequired: LastFIOffset >= 3,
        requiredFilters: RequiredFilters,
        requestId: chatDataRef.current[chatTab]?.requestId,
      });

      if (response.data.user.gender === FEMALE) {
        dispatch(setLastFIOffset(0));
      } else {
        dispatch(setLastFIOffset(LastFIOffset + 1));
      }

      setReceiverData({
        country: response.data.user.country,
        gender: response.data.user.gender,
        requiredFilters: response.data.user.requiredFilters,
      });

      const latestChatData = chatDataRef.current;
      const matchedReceiverId = response.data.user.userId;
      const requestId = response.data.user.requestId;
      const chatData = {...latestChatData};
      chatData[chatTab] = {
        receiverId: matchedReceiverId,
        messages: [],
        unseenMessages: 0,
        requestId: requestId,
      };
      dispatch(setChatData(chatData));
      setReceiverId(matchedReceiverId);

      // check if user is premium user and is there any automessage configured
      if (User.isPremium && User.premiumSettings?.autoMessage?.length != 0) {
        sendMessage(User.premiumSettings?.autoMessage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // ToastAndroid.show(
      //   'No Match found! Try after some time',
      //   ToastAndroid.SHORT,
      // );
      setNoMatchFound(true);
    }
    setIsRequesting(false);
  };

  useEffect(() => {
    chatDataRef.current = ChatData;
    if (chatTab) {
      setMessages(ChatData[chatTab]?.messages);
      setReceiverId(ChatData[chatTab]?.receiverId);
      if (ChatData[chatTab]?.receiverId == null && isRequesting === false) {
        if (
          (User.isPremium && User.premiumSettings.autoReconnect) ||
          initialOpening
        ) {
          setInitialOpening(false);
          handleChatRequest();
          setIsRequesting(true);
        } else {
          setIsDisconnected(true);
        }
      }
    }
  }, [ChatData]);

  const sendMessage = async message => {
    while (isLocked);
    const randomId = uuid.v4();
    if (!message.trim()) return;
    try {
      const latestChatData = chatDataRef.current;

      await insertMessage({
        sender_id: userId,
        receiver_id: receiverId,
        message: message,
        messageId: randomId,
        created_at: new Date(),
      });

      setMessages(prevMessages => [
        ...prevMessages,
        {text: message, belongs_to: true, messageId: randomId},
      ]);
      dispatch(
        setChatData({
          ...latestChatData,
          [chatTab]: {
            ...latestChatData[chatTab],
            messages: [
              ...latestChatData[chatTab].messages,
              {text: message, belongs_to: true, messageId: randomId},
            ],
            unseenMessages: 0,
          },
        }),
      );
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const flatListRef = useRef(null);
  useEffect(() => {
    // Automatically scroll to the end when messages change
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  // method to parse the text passed and idintifying the links in it and then returning the text component with the links
  const parseTextWithLinks = text => {
    // Regular expression to split text by URLs
    const parts = text.split(
      /\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/,
    );
    return parts.map((part, index) => {
      if (
        part.match(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/)
      ) {
        const url =
          part.startsWith('http') || part.startsWith('www')
            ? part
            : 'http://' + part; // Append http:// to URLs missing a protocol or www.
        return (
          <Text
            key={index}
            style={{color: '#FF4949'}}
            onPress={() => Linking.openURL(url)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const handleSkip = async () => {
    await skipChat( {
      userId: userId,
      receiverId: receiverId,
    });
    setInitialOpening(true);
    setReceiverData(null);
    setIsDisconnected(true);
  };

  const formatHeaderInfo = () => {
    if (receiverData) {
      if (
        !RequiredFilters.country &&
        !RequiredFilters.chatRoom &&
        !RequiredFilters.likes.length
      ) {
        return 'You are now connected with a stranger';
      } else if (RequiredFilters.country) {
        if (RequiredFilters.country == receiverData.country) {
          return 'Stranger is from ' + RequiredFilters.country;
        } else {
          return `No Stranger available from ${RequiredFilters.country},\nconnected with random stranger`;
        }
      } else if (RequiredFilters.chatRoom) {
        if (RequiredFilters.chatRoom == receiverData.requiredFilters.chatRoom) {
          return 'You both are talking about ' + RequiredFilters.chatRoom;
        } else {
          return `No Stranger available in ${RequiredFilters.chatRoom} Chatroom,\nconnected with random stranger`;
        }
      } else if (RequiredFilters.likes.length) {
        if (
          RequiredFilters.likes.some(r =>
            receiverData.requiredFilters.likes.includes(r),
          )
        ) {
          return (
            'Common likes - ' +
            RequiredFilters.likes
              .filter(r => receiverData.requiredFilters.likes.includes(r))
              .join(', ')
          );
        } else {
          return 'Common likes - Not found,\nconnected with random stranger';
        }
      }
    }
    return '';
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: '#211F1F',
        flexDirection: 'column',
        paddingBottom: 10,
        paddingHorizontal: 20,
      }}>
      {isRequesting ? (
        <View>
          <ActivityIndicator size={30} />
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
            }}>
            Finding match...
          </Text>
        </View>
      ) : (
        <>
          {!isDisconnected && !noMatchFound ? (
            <View
              style={{
                height: '90%',
              }}>
              <View
                style={{
                  backgroundColor: '#051EFF',
                  minHeight: 45,
                  paddingVertical: 14,
                  paddingHorizontal: 15,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 12,
                    lineHeight: 20,
                  }}>
                  {formatHeaderInfo()}
                </Text>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ref={flatListRef}
                initialNumToRender={messages.length || 1}
                style={{backgroundColor: '#211F1F', marginBottom: 10}}
                data={messages}
                renderItem={({item, index}) => (
                  <>
                    {item.belongs_to ? (
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
                            marginTop: 5,
                            marginBottom: 10,
                          }}>
                          {' '}
                          {parseTextWithLinks(item.text)}
                        </Text>
                      </View>
                    ) : (
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
                            marginBottom: 10,
                          }}>
                          {' '}
                          {parseTextWithLinks(item.text)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingBottom: 40,
              }}>
              {<AdView media={true} />}
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setIsRequesting(true);
                    handleChatRequest();
                  }}
                  style={{
                    marginTop: 30,
                  }}>
                  <Image
                    source={require('../assets/images/reconnect_icon.png')}
                    style={{
                      height: 60,
                      width: 60,
                      alignSelf: 'center',
                    }}
                  />

                  <Text
                    style={{
                      color: 'white',
                      marginTop: 20,
                      textAlign: 'center',
                    }}>
                    Click to reconnect
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!isDisconnected && !noMatchFound ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
              }}>
              <TouchableOpacity
                onPress={handleSkip}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 12,
                  height: 50,
                  width: 70,
                }}>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    fontSize: 18,
                  }}>
                  SKIP
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 50,
                  flex: 1,
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 50,
                    width: '100%',
                    justifyContent: 'center',
                    minHeight: 50,
                  }}>
                  <View
                    style={{
                      height: '100%',
                      width: '80%',
                    }}>
                    <TextInput
                      placeholderTextColor="grey"
                      placeholder="Type your message here..."
                      style={{flex: 1, color: 'black', width: '100%'}}
                      value={messageText}
                      onChangeText={setMessageText}
                      multiline={true}
                    />
                  </View>
                  <TouchableOpacity onPress={() => sendMessage(messageText)}>
                    <Send />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: 'white',
                  padding: 10,
                }}>
                {isDisconnected
                  ? 'Stranger is Disconnected.'
                  : 'No Match Found. Try again after sometime'}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

export default ChatScreen;
