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
  {key: '3', value: 'Others'},
];

function Settings({navigation}) {
  const {CountryFilter, LanguageFilter, SearchKey, User} = useSelector(
    state => state.data,
  );
  const scrollViewRef = useRef();
  const scrollToTop = () => {
    ToastAndroid.show('Login first to buy Premium ', ToastAndroid.SHORT);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');
  const [left, setLeft] = useState(!User.premiumSettings.autoReconnect);
  const [slideAnim, setSlideAnim] = useState(new Animated.Value(0));
  const [isOn, setIsOn] = useState(false);
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('');
  const[editable,setEditable]=useState(true)

  const dispatch = useDispatch();

  useEffect(() => {
    setValue(User.Name);
    setCountry(User.Country);
    setLanguage(User.Language);
    setGender(User.Gender);
    setIsOn(User.premiumSettings.autoReconnect);
    setMessage(User.premiumSettings.autoMessage);
  }, []);

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
        autoMessage: message,
      },
    };
    dispatch(setUser(user));
  }, [country, language, gender, value, isOn, message]);

  console.log('slideanim', slideAnim);

  const slideBox = () => {
    console.log('slidebox :', slideAnim);
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
    }
    else ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT)
  };

  const slideFromLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });
  const slideFromRight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const onTextPress=()=>{
    User.isPremium?setEditable(true):setEditable(false) 
    if(!User.isPremium) ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT)
    console.log('text pressed')
  }

  return (
    <ScrollView  ref={scrollViewRef} style={{height: '100%', backgroundColor: '#211F1F'}}>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <View style={{width: '80%'}}>
          <Text style={{fontSize: 25, fontWeight: '700', color: 'white'}}>
            Setting
          </Text>
        </View>
        <View
          style={{
            borderWidth: 3,
            borderColor: 'white',
            width: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginTop: 20,
            borderRadius: 50,
          }}>
          <Profile />
        </View>
        <GoogleSigninScreen />
        <View
          style={{
            height: '75%',
            paddingHorizontal: 10,
            paddingVertical: 20,
          }}>
          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 10,
              fontWeight: '700',
              color: 'white',
              fontSize: 16,
              backgroundColor: '#051EFF',
            }}
            placeholder="Name"
            placeholderTextColor={'white'}
          />

          <SelectList
            setSelected={setGender}
            data={genderData}
            save="value"
            dropdownStyles={{backgroundColor:'#212B7F',borderWidth:0}}
            dropdownTextStyles={{color:'white'}}
            search={false}
            maxHeight={120}
            boxStyles={{
              backgroundColor: '#051EFF',
              borderRadius: 0,
              marginTop: 20,
              borderWidth: 0,
              paddingHorizontal: 10,
            }}
            inputStyles={{
              fontWeight: 700,
              color: 'white',
              fontSize: 16,
              margin:0,
             
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
                  fontSize: 16,
                  marginTop: 20,
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
                fontSize: 16,
                marginTop: 20,
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
              Your message
            </Text>
            <TextInput
              style={{fontSize: 14}}
              placeholderTextColor={'grey'}
              onPress={onTextPress}
              editable={editable}
              multiline={true}
              
              value={message}
              onChangeText={setMessage}
              placeholder={`Automatic message when you connect with ${'\n'} strangers`}></TextInput>
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
            <Text style={{color: 'white', fontSize: 18, fontWeight: 700}}>
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
                  <Text style={{color: 'white'}}>{isOn ? 'On' : 'OFF'}</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        {  
          User.isPremium?  <></>:
        <TouchableOpacity color='white' onPress={scrollToTop}>
          <View
            style={{
              backgroundColor: '#051EFF',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: 10,
              marginTop: 20,
            }}>
            <Text style={{color: 'white', fontSize: 18, fontWeight: 700}}>
              Get pro and only connect with females
            </Text>
            <View>
              <Text style={{color: 'white', fontSize: 15}}>$20/Month</Text>
            </View>
          </View>
          </TouchableOpacity>
        
        }
        </View>
        
      </View>
    </ScrollView>
  );
}
export default Settings;
const styles = StyleSheet.create({
  outerBox: {
    width: 70,
    height: 30,
    backgroundColor: 'lightgray',
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
    backgroundColor: 'black',
  },
});
