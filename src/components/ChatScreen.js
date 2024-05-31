import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  TextInput,
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
import {DraggableMessageView} from './DraggableMessageView';
import {supaClient} from '../utils/SupaClient';

const FEMALE = 'Female';
//function for debounce

const useDebouncedValue = (inputValue, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
};
function ChatScreen({chatTab, userId, isLocked}) {
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [messageText, setMessageText] = useState('');
  const debouncedSearchTerm = useDebouncedValue(messageText, 300);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [initialOpening, setInitialOpening] = useState(true);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [replyToIndex, setReplyToIndex] = useState(null);


  const [highlightMessageIndex, setHighlightMessageIndex] = useState(-1);

  const {ChatData, User, LastFIOffset, RequiredFilters, IP, CurrentChatTab} =
    useSelector(state => state.data);
  const chatDataRef = useRef(null);
  const dispatch = useDispatch();
  const channelA = supaClient.channel('typing-event');

  useEffect(() => {
    // API call or other actions to be performed with debounced value
    channelA
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: {receiverId: receiverId, userId: userId},
      })
      .then(() => {
        console.log('Typing event sent');
      });
  }, [debouncedSearchTerm]);

  const handleChatRequest = async () => {
    console.log('Requesting chat for tab: ', chatTab);
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
        typing: false,
      };
      dispatch(setChatData(chatData));
      setReceiverId(matchedReceiverId);

      // check if user is premium user and is there any automessage configured
      if (User.isPremium && User.premiumSettings?.autoMessage?.length != 0) {
        sendMessage(User.premiumSettings?.autoMessage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setNoMatchFound(true);
    }
    setIsRequesting(false);
  };

  useEffect(() => {
    chatDataRef.current = ChatData;
    console.log("swithced")
  

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
    setDraggedIndex(null);
    setReplyToIndex(null);
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
        reply_msg_id:
          replyToIndex !== null ? messages[replyToIndex]?.messageId : null,
      });

      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: message,
          belongs_to: true,
          messageId: randomId,
          reply_msg_id:
            replyToIndex !== null ? messages[replyToIndex]?.messageId : null,
        },
      ]);
      dispatch(
        setChatData({
          ...latestChatData,
          [chatTab]: {
            ...latestChatData[chatTab],
            messages: [
              ...latestChatData[chatTab].messages,
              {
                text: message,
                belongs_to: true,
                messageId: randomId,
                reply_msg_id:
                  replyToIndex !== null
                    ? messages[replyToIndex]?.messageId
                    : null,
              },
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
    try {
      if (messages.length > 0 && flatListRef.current) {
        setTimeout(() => {
          try {
            console.log("scroll to end")
            flatListRef.current.scrollToEnd({animated: true});
          } catch (error) {
            console.log('Error in scroll to end 20', error.message);
          }
        }, 0);
      }
    } catch (error) {
      console.log('Error in scroll to end 20', error.message);
    }
  }, [messages]);

  const handleSkip = async () => {
    
      setTimeout( async () => {
        try {
        await skipChat({
          userId: userId,
          receiverId: receiverId,
        });
        setInitialOpening(true);
        setReceiverData(null);
          setIsDisconnected(true);
        } catch (error) {
          console.log('Error in skip chat', error.message)
        }
      }, 200)
  }

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

  const showReplyToWindow = index => {
    setReplyToIndex(index);
    setDraggedIndex(null);
  };

  const scrollToDirectedMessage = messageId => {
    const index = messages.findIndex(msg => msg.messageId === messageId);
    if (index !== -1) {
      setHighlightMessageIndex(index);
      flatListRef.current.scrollToIndex({index: index, animated: true});
      const interval = setInterval(() => {
        setHighlightMessageIndex(null);
        clearInterval(interval);
      }, 5000);
    }

  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#211F1F',
        flexDirection: 'column',
      }}>
      {isRequesting ? (
        <View style={{marginTop: 250}}>
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
              onLayout={() => {
               
                  setTimeout(() => {
                    try {
                    flatListRef.current.scrollToEnd({animated: true});
                  } catch (error) {
                    console.log('Error in scroll to end', error.message);
                  }
                  }, 0);
       
              }}
              style={{
                height: '93%',
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
                  {ChatData[chatTab]?.typing ? (
                    <Text
                      style={{color: 'white', fontSize: 15, marginBottom: 20}}>
                      Stranger is Typing....
                    </Text>
                  ) : (
                    formatHeaderInfo()
                  )}
                </Text>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ref={flatListRef}
          
                initialNumToRender={messages.length || 1}
                style={{
                  backgroundColor: '#211F1F',
                  marginBottom:32 
                  
                }}
                data={messages}
                renderItem={({item, index}) => (
                  <DraggableMessageView
                    key={index}
                    message={item}
                    draggedIndex={draggedIndex}
                    setDraggedIndex={setDraggedIndex}
                    index={index}
                    showReplyToWindow={showReplyToWindow}
                    replyToMessage={messages.find(
                      msg => msg.messageId === item.reply_msg_id,
                    )}
                    scrollToDirectedMessage={scrollToDirectedMessage}
                    highlightMessageIndex={highlightMessageIndex}
                  />
                )}
              />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingBottom: 40,
                paddingHorizontal: 20,
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
                marginBottom: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  position: 'absolute',
                  bottom: 0,
                  paddingHorizontal: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: 5,
                  }}>
                  <TouchableOpacity
                    onPress={handleSkip}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 20,
                      paddingVertical: 7,
                      height: 40,
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
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    borderRadius: 50,
                    flex: 1,
                  }}>
                  {replyToIndex !== null ? (
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        width: '100%',
                        padding: 5,
                      }}>
                      <View
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          padding: 5,
                          borderRadius: 10,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#0066b2',
                              fontWeight: 500,
                              fontSize: 12,
                              paddingTop: 2,
                            }}>
                            {messages[replyToIndex].belongs_to
                              ? 'You'
                              : 'Stranger'}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setReplyToIndex(null)}
                            style={{
                              paddingVertical: 2,
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                color: 'grey',
                                fontWeight: 500,
                              }}>
                              X
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={{
                            color: 'grey',
                            fontSize: 12,
                          }}
                          numberOfLines={2}>
                          {replyToIndex !== null
                            ? messages[replyToIndex].text
                            : ''}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      backgroundColor: 'white',
                      borderTopLeftRadius: replyToIndex !== null ? 0 : 30,
                      borderTopRightRadius: replyToIndex !== null ? 0 : 30,
                      borderBottomLeftRadius: replyToIndex !== null ? 20 : 30,
                      borderBottomRightRadius: replyToIndex !== null ? 20 : 30,
                      width: '100%',
                      minHeight: 50,
                    }}>
                    <View
                      style={{
                        height: '100%',
                        width: '80%',
                      }}>
                      <TextInput
                        placeholderTextColor="grey"
                     
                    autoFocus={true}
                        placeholder="Type your message here..."
                        style={{
                          flex: 1,
                          color: 'black',
                          fontWeight: '800',
                          width: '100%',
                          maxHeight: 100,
                          paddingLeft: 20,
                        }}
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline={true}
                      />
                    </View>
                    <TouchableOpacity
                      style={{paddingRight: 20}}
                      onPress={() => sendMessage(messageText)}>
                      <Send />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
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
