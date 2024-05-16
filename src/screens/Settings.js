import React, {useEffect, useRef, useState} from 'react';
import GoogleSigninScreen from '../components/GoogleSigninScreen';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  ToastAndroid,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Profile from '../assets/images/profile.svg';
import {
  setCountryFilter,
  setLanguageFilter,
  setSearchKey,
  setUser,
} from '../redux/DataSlice';
import {routes} from '../constants/routes';
import {SelectList} from 'react-native-dropdown-select-list';

const genderData = [
  {key: '1', value: 'Female'},
  {key: '2', value: 'Male'},
];

function Settings({navigation}) {
  const {CountryFilter, LanguageFilter, SearchKey, User} = useSelector(
    state => state.data,
  );
  const scrollViewRef = useRef();
  const scrollToTop = () => {
    ToastAndroid.show('Login first to buy Premium ', ToastAndroid.SHORT);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 0, animated: true});
    }
  };

  const [country, setCountry] = useState(User.Country);
  const [language, setLanguage] = useState(User.Language);
  const [gender, setGender] = useState(User.Gender);
  const [left, setLeft] = useState(!User.premiumSettings.autoReconnect);
  const [slideAnim, setSlideAnim] = useState(new Animated.Value(0));
  const [isOn, setIsOn] = useState(User.premiumSettings.autoReconnect);
  const [message, setMessage] = useState(User.premiumSettings.autoMessage);
  const [value, setValue] = useState(User.Name);

  const dispatch = useDispatch();

  useEffect(() => {
    if (SearchKey == 'country' && CountryFilter !== null) {
      setCountry(CountryFilter);
      dispatch(setCountryFilter(null));
    } else if (SearchKey == 'language' && LanguageFilter !== null) {
      setLanguage(LanguageFilter);
      dispatch(setLanguageFilter(null));
    }
  }, [CountryFilter, LanguageFilter]);

  useEffect(() => {
    const user = {
      Country: country,
      Name: value,
      Language: language,
      Gender: gender,
      premiumSettings: {
        autoReconnect: isOn,
        autoMessage: message.trim(),
      },
    };
    dispatch(setUser(user));
  }, [country, language, gender, value, isOn, message]);

  const slideBox = () => {
    if (User.isPremium) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsOn(!isOn);
      setTimeout(() => {
        setLeft(!left);

        setSlideAnim(new Animated.Value(0));
      }, 300);
    } else ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT);
  };

  const slideFromLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });
  const slideFromRight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const onTextPress = () => {
    if (!User.isPremium)
      ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
      contentContainerStyle={{
        paddingBottom: 30,
      }}
      style={{
        height: '100%',
        backgroundColor: '#211F1F',
        paddingHorizontal: 20,
      }}>
      <TouchableOpacity
        style={{
          marginTop: 20,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/images/back_icon.png')}
          style={{
            width: 90,
            height: 20,
          }}
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 40,
          fontWeight: '700',
          color: 'white',
          marginTop: 10,
        }}>
        Setting
      </Text>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <View
          style={{
            borderWidth: 4,
            borderColor: 'white',
            width: 70,
            height: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginTop: 20,
            borderRadius: 35,
          }}>
          <Profile />
        </View>
        <GoogleSigninScreen />
        <View
          style={{
            marginTop: 30,
            width: '100%',
          }}>
          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 10,
              fontWeight: '700',
              color: 'white',
              height: 50,
              fontSize: 20,
              backgroundColor: '#051EFF',
            }}
            placeholder="Name"
            placeholderTextColor={'white'}
          />

          <SelectList
            setSelected={setGender}
            data={genderData}
            save="value"
            dropdownStyles={{backgroundColor: '#212B7F', borderWidth: 0}}
            dropdownTextStyles={{color: 'white'}}
            search={false}
            maxHeight={120}
            boxStyles={{
              backgroundColor: '#051EFF',
              borderRadius: 0,
              marginTop: 15,
              height: 50,
              borderWidth: 0,
              paddingHorizontal: 10,
            }}
            inputStyles={{
              fontWeight: 700,
              color: 'white',
              fontSize: 20,
              margin: 0,
            }}
            placeholder={gender.length ? gender : 'Select Gender'}
          />

          <View>
            <TouchableOpacity
              onPress={() => {
                dispatch(setSearchKey('country'));
                navigation.navigate(routes.SEARCHLIST, {
                  title: 'Select Country',
                });
              }}>
              <TextInput
                placeholder="Select Country"
                placeholderTextColor={'white'}
                value={country}
                editable={false}
                style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: 20,
                  height: 50,
                  marginTop: 15,
                  backgroundColor: '#051EFF',
                  paddingHorizontal: 10,
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              dispatch(setSearchKey('language'));
              navigation.navigate(routes.SEARCHLIST, {
                title: 'Select Language',
              });
            }}>
            <TextInput
              placeholder="Select Language"
              placeholderTextColor={'white'}
              value={language}
              editable={false}
              style={{
                fontWeight: '700',
                color: 'white',
                fontSize: 20,
                height: 50,
                marginTop: 15,
                backgroundColor: '#051EFF',
                paddingHorizontal: 10,
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: '#051EFF',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: 10,
              marginTop: 20,
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
              {`Your message ${User.isPremium ? '' : '(Premium feature)'}`}
            </Text>
            <TextInput
              style={{fontSize: 14}}
              placeholderTextColor={'white'}
              onPress={onTextPress}
              editable={User.isPremium}
              multiline={true}
              value={message}
              onChangeText={setMessage}
              placeholder={`Automatic message when you connect with ${'\n'}strangers`}></TextInput>
          </View>
          <View
            style={{
              backgroundColor: '#051EFF',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              marginTop: 20,
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
              Automatic Reconnect
            </Text>
            <View style={styles.outerBox}>
              <TouchableOpacity onPress={slideBox}>
                <Animated.View
                  style={[
                    styles.innerBox,
                    {
                      transform: [
                        {translateX: left ? slideFromLeft : slideFromRight},
                      ],
                    },
                  ]}>
                  <Text
                    style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                    {isOn ? 'ON' : 'OFF'}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            color="white"
            onPress={() =>
              User.Email && User.Email.length
                ? navigation.navigate(routes.PAYMENT_PROCESSING)
                : scrollToTop()
            }
            disabled={User.isPremium}
            >
            <View
              style={{
                backgroundColor: '#051EFF',
                display: 'flex',
                justifyContent: 'flex-start',
                paddingHorizontal: 10,
                marginTop: 50,
                paddingVertical: 15,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 900,
                  lineHeight: 40,
                }}>
                {`Get pro and only\nconnect with\nfemales`}
              </Text>
              <View
                style={{
                  marginTop: 30,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
                  {User.isPremium ? 'Subscription active' : '$99/Month'}
                </Text>
                {!User.isPremium ? (
                  <Image
                    source={require('../assets/images/back_icon.png')}
                    style={{
                      width: 90,
                      height: 20,
                      marginRight: 20,
                    }}
                    transform={[{rotate: '180deg'}]}
                  />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
export default Settings;
const styles = StyleSheet.create({
  outerBox: {
    width: 70,
    height: 35,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'center',
  },
  innerBox: {
    width: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    backgroundColor: '#1BA1E0',
  },
});
