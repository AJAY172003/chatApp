import {
  BackHandler,
  Image,
  Modal,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  AppState,
} from 'react-native';
import uuid from 'react-native-uuid';
import {useDispatch, useSelector} from 'react-redux';
import {setChatData, setCurrentChatTab, setIsBlocked, setisTabSwitched} from '../redux/DataSlice';
import {useEffect, useRef, useState} from 'react';
import ChatScreen from '../components/ChatScreen';
import {ConfirmationPopup} from '../components/ConfirmationPopup';
import BackgroundTimer from 'react-native-background-timer';
import {supaClient} from '../utils/SupaClient';
import {removeRequest, removeUsers, reportUser, skipChat} from '../utils/api';

const MAX_CHAT_TAB_LIMIT = 5;
const HEARTBEAT_TIMER = 2000;

export const ChatManager = ({navigation, route}) => {
  const [confirmationPopupVisible, setConfirmationPopupVisible] =
    useState(false);
  const [confirmationPopupLoading, setConfirmationPopupLoading] =
    useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const {userId = uuid.v4()} = route.params;
  const dispatch = useDispatch();
  const chatDataRef = useRef(null);
  const {ChatData, CurrentChatTab, IP} = useSelector(state => state.data);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    chatDataRef.current = ChatData;
  }, [ChatData]);

  // Create a function to handle inserts
  const handleInserts = payload => {
    setIsLocked(true);

    const latestChatData = chatDataRef.current;
    console.log('Change received!', payload);
    console.log('chatData: ', latestChatData);
    const senderId = payload.new.sender_id;
    const receiverId = payload.new.receiver_id;
    if (receiverId == userId) {
      // check if senderId is in chatData
      if (
        Object.values(latestChatData).some(
          chatTab => chatTab.receiverId == senderId,
        )
      ) {
        // set new Message in chatData
        let tempChatData = {...latestChatData};
        let chatTabKey = Object.keys(tempChatData).find(
          key => tempChatData[key].receiverId == senderId,
        );
        tempChatData[chatTabKey] = {
          ...tempChatData[chatTabKey],
          messages: [
            ...tempChatData[chatTabKey].messages,
            {
              text: payload.new.message,
              belongs_to: false,
              messageId: payload.new.messageId,
            },
          ],
          unseenMessages:
            CurrentChatTab === chatTabKey
              ? 0
              : tempChatData[chatTabKey].unseenMessages + 1,
        };
        dispatch(setChatData(tempChatData));
      }
    }
    setIsLocked(false);
  };

  // Create a function to handle deletes
  const handleDeletes = payload => {
    const latestChatData = chatDataRef.current;
    const user1 = payload.old.user1;
    const user2 = payload.old.user2;

    if (user1 == userId || user2 == userId) {
      // if user1 == userId, then find user2 as receiverId in chatData and if user2 == userId, then find user1 as receiverId in chatData
      let chatTabKey = Object.keys(latestChatData).find(
        key =>
          latestChatData[key].receiverId == (user1 == userId ? user2 : user1),
      );

      if (chatTabKey !== undefined) {

        if(chatTabKey == CurrentChatTab) {
          setModalVisible(false);
        }
        let tempChatData = {...latestChatData};

        // set receivedId to null and messages to empty array
        tempChatData[chatTabKey] = {
          receiverId: null,
          messages: [],
          unseenMessages: 0,
          requestId: uuid.v4(),
        };

        dispatch(setChatData(tempChatData));
        console.log(
          'chat is deleted with user1: ',
          user1,
          ' and user2: ',
          user2,
        );
      }
    }
  };

  const removeUsersFunc = async (userId, connectedUserIds) => {
    try {
      const response = await removeUsers({
        userId: userId,
        connectedUserIds: connectedUserIds,
      });

      if (response.status !== 200) {
        ToastAndroid.show('Error disconnecting chats', ToastAndroid.SHORT);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleBack = async () => {
    setConfirmationPopupLoading(true);
    removeUsersFunc(
      userId,
      Object.keys(ChatData).map(key => ChatData[key].receiverId),
    );
    setConfirmationPopupLoading(false);
    setConfirmationPopupVisible(false);
    navigation.goBack();
  };

  const handleBlocked = payload => {
    dispatch(setIsBlocked(true));
    handleBack();
  };

  const pingServer = async () => {
    const channel = supaClient.channel('heartbeat');
    channel.subscribe(status => {
      // Wait for successful connection
      if (status !== 'SUBSCRIBED') {
        return null;
      }
      // Send a message once the client is subscribed
      supaClient.channel('heartbeat').send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: {userId: userId},
      });
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        BackgroundTimer.runBackgroundTimer(() => {
          pingServer();
        }, HEARTBEAT_TIMER);
        //rest of code will be performing for iOS on background too
      } else {
        BackgroundTimer.stopBackgroundTimer();
      }
    });

    let interval = null;
    if (userId !== null) {
      // Listen to inserts
      supaClient
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`,
          },
          handleInserts,
        )
        .on(
          'postgres_changes',
          {event: 'DELETE', schema: 'public', table: 'chat'},
          handleDeletes,
        )
        .on(
          'postgres_changes',
          {event: 'INSERT', schema: 'public', table: 'blocked', filter: `ip=eq.${IP}`},
          handleBlocked,
        )
        .subscribe();

      // send heartbeat to server
      interval = setInterval(() => {
        pingServer();
      }, HEARTBEAT_TIMER);
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setConfirmationPopupVisible(true);
        return true;
      },
    );

    return () => {
      if (userId !== null) {
        supaClient.removeAllChannels();
      }
      backHandler.remove();
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const handleAddChatTab = () => {
    if (Object.keys(ChatData).length >= MAX_CHAT_TAB_LIMIT) {
      ToastAndroid.show(
        `You can only have ${MAX_CHAT_TAB_LIMIT} chat tabs at a time`,
        ToastAndroid.SHORT,
      );
    } else {
      // find the maximum number in the keys and add 1 to it
      let newChatTab =
        Math.max(...Object.keys(ChatData).map(key => parseInt(key))) + 1;

      let tempChatData = {...ChatData};
      tempChatData[newChatTab] = {
        messages: [],
        receiverId: null,
        unseenMessages: 0,
        requestId: uuid.v4(),
      };
      dispatch(setChatData(tempChatData));
      dispatch(setCurrentChatTab(newChatTab));
    }
  };

  const handleDeleteChatTab = chatTabToDelete => {
    let tempChatData = {...ChatData};
    if (tempChatData[chatTabToDelete].receiverId !== null) {
      skipChat({userId, receiverId: tempChatData[chatTabToDelete].receiverId});
    } else {
      console.log(tempChatData[chatTabToDelete]);
      removeRequest({
        userId,
        requestId: tempChatData[chatTabToDelete].requestId,
      });
    }

    chatDataRef.current = tempChatData;
    delete tempChatData[chatTabToDelete];
    dispatch(setChatData(tempChatData));
    if (CurrentChatTab == chatTabToDelete) {
      dispatch(setCurrentChatTab(Object.keys(tempChatData)[0]));
    }
  };

  const reportUserFunc = async reason => {
    if (ChatData[CurrentChatTab].receiverId !== null) {
      closeModal();
      try {
        await reportUser({
          userId: userId,
          receiverId: ChatData[CurrentChatTab].receiverId,
          reason: reason,
        });
        skipChat({userId, receiverId: ChatData[CurrentChatTab].receiverId});
        ToastAndroid.show('Stranger has been reported', ToastAndroid.SHORT);
      } catch (e) {
        console.log(e);
        ToastAndroid.show('Stranger has been reported', ToastAndroid.SHORT);
      }
    }
  };

  const formatTabName = key => {
    if (CurrentChatTab == key) {
      return `@`;
    } else if (ChatData[key].receiverId == null) {
      return 'X';
    } else {
      return ChatData[key].unseenMessages;
    }
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#211F1F',
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <ScrollView
          style={{
            maxHeight: 80,
          }}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: 20,
            height: 60,
            gap: 10,
            paddingHorizontal: 20,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              height: 42,
              justifyContent: 'flex-start',
              borderBottomColor: '#051EFF',
              borderBottomWidth: 2,
            }}>
            {Object.keys(ChatData).map((key, index) => {
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: CurrentChatTab == key ? '#051EFF' : 'grey',
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    minWidth: 80,
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    rowGap: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(setCurrentChatTab(key));
                      const latestChatData = chatDataRef.current;
                      const chatData = {...latestChatData};
                      chatData[key] = {...chatData[key], unseenMessages: 0};
                      dispatch(setChatData(chatData));
                    }}
                    style={{
                      flex: 1,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}>
                      {formatTabName(key)}
                    </Text>
                  </TouchableOpacity>
                  {Object.keys(ChatData).length > 1 && (
                    <TouchableOpacity onPress={() => handleDeleteChatTab(key)}>
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                          alignSelf: 'center',
                        }}
                        source={require('../assets/images/cancel_icon.png')}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleAddChatTab} style={{}}>
            <Image
              style={{
                width: 36,
                height: 36,
                marginTop: 2,
                alignSelf: 'center',
              }}
              source={require('../assets/images/plus_icon.png')}
            />
          </TouchableOpacity>
        </ScrollView>
        {ChatData[CurrentChatTab].receiverId !== null && (
          <TouchableOpacity onPress={openModal}>
            <Image
              source={require('../assets/images/options_icon.png')}
              style={{
                width: 36,
                height: 40,
                resizeMode: 'contain',
                marginTop: 20,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      {Object.keys(ChatData).map((key, index) => {
        return (
          <View
            style={{
              display: CurrentChatTab == key ? 'flex' : 'none',
              flex: 1,
              backgroundColor: 'black',
              flexDirection: 'column',
            }}
            key={index}>
            <ChatScreen chatTab={key} userId={userId} isLocked={isLocked} />
          </View>
        );
      })}
      <ConfirmationPopup
        isVisible={confirmationPopupVisible}
        title={`Are you sure you want to exit the chat? all windows will be closed`}
        positiveLabel="YES"
        positiveCallback={handleBack}
        negativeLabel="NO"
        negativeCallback={() => {
          setConfirmationPopupVisible(false);
        }}
        popupLoader={confirmationPopupLoading}
      />
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 23.5,
              width: 260,
              backgroundColor: '#211F1F',
              marginTop: 100,
              paddingBottom: 30,
            }}>
            <Image
              source={require('../assets/images/report_popup.jpg')}
              style={{
                height: 204,
                width: 260,
                resizeMode: 'cover',
                borderTopLeftRadius: 23.5,
                borderTopRightRadius: 23.5
              }}
            />
             <TouchableOpacity
              onPress={closeModal}
              style={{
                position: 'absolute',
                top: 10,
                right: 15,
              }}>
              <Text
                style={{
                  fontSize: 24,
                  color: '#051EFF',
                  fontWeight: 700,
                }}>
                X
              </Text>
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  position: 'absolute',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'white',
                  alignSelf: 'center',
                  top: -30,
                }}>
                Report User
              </Text>
              <View
                style={{
                  paddingHorizontal: 20,
                }}>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Spam User')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Spam User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Abusive')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 7,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Abusive
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Pornography')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 7,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Pornography
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
