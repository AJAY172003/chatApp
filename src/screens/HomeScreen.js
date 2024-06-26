import {
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {routes} from '../constants/routes';
import {
  setChatData,
  setCurrentChatTab,
  setInfoPopupSeen,
  setNumUserOnline,
  setRequiredFilters,
} from '../redux/DataSlice';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import uuid from 'react-native-uuid';
import React, {useEffect, useState} from 'react';
import {BlockedScreen} from '../components/BlockedScreen';
import {supaClient} from '../utils/SupaClient';
import appsFlyer from 'react-native-appsflyer';
export const HomeScreen = ({navigation}) => {
  appsFlyer.initSdk(
    {
      devKey: 'bMqCKui6dFrYiwP4mePF3Q',
      isDebug: false,
      appId: 'app.lit',
      onInstallConversionDataListener: false, //Optional
      onDeepLinkListener: true, //Optional
      timeToWaitForATTUserAuthorization: 10, //for iOS 14.5
      manualStart: true, //Optional
    },
    (res) => {
      console.log( "response",res);
    },
    (err) => {
      console.error(err);
    }
  );
  appsFlyer.startSdk();
  const [modalVisible, setModalVisible] = useState(false);

  const dispatch = useDispatch();
  const {NumUserOnline, Reports, isBlocked, InfoPopupSeen} = useSelector(
    state => state.data,
  );

  useFocusEffect(
    React.useCallback(() => {
      const channelA = supaClient.channel('server-msgs');
      setTimeout(() => {
        channelA
          .on('broadcast', {event: 'onlineU'}, payload => {
            dispatch(setNumUserOnline(payload.payload?.numOnlineUsers));
          })
          .subscribe();
      }, 0);

      return () => {
        console.log('unsubscribed......');
        channelA.unsubscribe();
      };
    }, []),
  );
  useEffect(() => {
    if (InfoPopupSeen == false) {
      openModal();
    }
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    dispatch(setInfoPopupSeen(true));
    setModalVisible(false);
  };

  // method to add commas in number
  const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <View
      style={{
        backgroundColor: '#211F1F',
        height: '100%',
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 35,
      }}>
      {!isBlocked ? (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 25,
            }}>
              <View style={{alignItems:'flex-end',justifyContent:'flex-end',flexDirection:'row'}}>
            <Text
              style={{
                color: 'white',
                fontSize: 40,
                marginTop: 15,
                fontWeight: 'bold',
                alignItems:'center',
                justifyContent:'center',
                alignSelf:'center'
              }}>
              {`${numberWithCommas(NumUserOnline)}`}
              <Text
                style={{
                  color: 'white',
                  fontSize: 25,
                  fontWeight: 'bold',
                }}>
                {`\nPEOPLE ONLINE` }

              </Text>

            </Text>
            <Image
                source={require('../assets/images/online.png')}
                style={{
                  marginBottom:10,
                  marginLeft: 7,
                  height: 11,
                  width: 11,
                  resizeMode: 'contain',
          
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate(routes.SETTINGS)}>
              <Image
                source={require('../assets/images/settings_icon.png')}
                style={{
                  height: 30,
                  width: 30,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 30,
            }}
            onPress={() => {
              dispatch(setCurrentChatTab(1));
              dispatch(
                setChatData({
                  1: {
                    receiverId: null,
                    messages: [],
                    unseenMessages: 0,
                    requestId: uuid.v4(),
                    typing: false
                  },
                }),
              );
              dispatch(
                setRequiredFilters({
                  country: null,
                  chatRoom: null,
                  likes: [],
                }),
              );
              navigation.navigate(routes.CHATMANAGER, {
                userId: uuid.v4(),
              });
            }}>
            <ImageBackground
              source={require('../assets/images/chat_with_strangers.png')}
              style={{
                resizeMode: 'contain',
                height: 90,
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 7,
            }}>
            <TouchableOpacity
              style={{
                marginTop: 7,
                flex: 0.5,
              }}
              onPress={() => {
                navigation.navigate(routes.COUNTRYCHAT);
              }}>
              <ImageBackground
                source={require('../assets/images/country_chat.png')}
                style={{
                  resizeMode: 'contain',
                  height: 90,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.5,
                marginTop: 7,
              }}
              onPress={() => {
                navigation.navigate(routes.CHATROOM);
              }}>
              <ImageBackground
                source={require('../assets/images/chat_room.png')}
                style={{
                  resizeMode: 'contain',
                  height: 90,
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 7,
            }}
            onPress={() => {
              navigation.navigate(routes.COMMONLIKES);
            }}>
            <ImageBackground
              source={require('../assets/images/common_likes_banner.png')}
              style={{
                resizeMode: 'contain',
                height: 90,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate(routes.ACCOUNTHEALTH)}>
            <Text
              style={{
                backgroundColor: '#051EFF',
                fontSize: 12,
                padding: 4,
                color: 'white',
                fontWeight: 700,
                marginTop: 7,
              }}>
              {`${Reports}/10 reports`}
            </Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 23.5,
                  height: 370,
                  backgroundColor: '#211F1F',
                  marginTop: 200,
                }}>
                <Image
                  source={require('../assets/images/behave_wisely.png')}
                  style={{
                    height: 204,
                    width: 240,
                    resizeMode: 'contain',
                    borderTopLeftRadius: 23.5,
                    borderTopRightRadius: 23.5,
                  }}
                />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 25,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: 30,
                  }}>
                  Behave Wisely
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    backgroundColor: '#051EFF',
                    marginTop: 35,
                    height: 50,
                    width: 130,
                    alignSelf: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      paddingTop: 10,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <BlockedScreen />
      )}
    </View>
  );
};
