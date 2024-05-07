import React, {useEffect, useState} from 'react';
import Arrow from '../assets/images/arroe.svg';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
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

function FirstScreen({navigation}) {
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');

  const dispatch = useDispatch();
  const {CountryFilter, LanguageFilter, SearchKey} = useSelector(
    state => state.data,
  );

  useEffect(() => {
    if (SearchKey == 'country' && CountryFilter !== null) {
      setCountry(CountryFilter);
      dispatch(setCountryFilter(null));
    } else if (SearchKey == 'language' && LanguageFilter !== null) {
      setLanguage(LanguageFilter);
      dispatch(setLanguageFilter(null));
    }
  }, [CountryFilter, LanguageFilter]);

  const Save = () => {
    const user = {
      Name: value,
      Country: country,
      Language: language,
      Gender: gender,
      isUserInfoFilled: true
    };
    dispatch(setUser(user));
    navigation.navigate(routes.HOMESCREEN);
  };

  const [value, setValue] = useState('');
  console.log(value);
  const [isEmpty, setIsEmpty] = useState(true);
  useEffect(() => {
    if (
      country.length != 0 &&
      language.length != 0 &&
      gender.length != 0 &&
      value.length != 0
    )
      setIsEmpty(false);
    else setIsEmpty(true);
  }, [country, language, gender, value]);

  return (
    <View
      style={{
        backgroundColor: '#211F1F',
        height: 800,
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: '#211F1F',
          height: '70%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}>
        <View style={{width: '80%', display: 'flex'}}>
          <Text style={{color: 'white', fontWeight: 900, fontSize: 30}}>
            Tell us about yourself
          </Text>
        </View>
  
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 20,
            width: '90%',
            height: 400,
          }}>
          <Text style={{color: 'white', fontWeight: 500}}>
            Join a chat room and talk with strangers about certain things
          </Text>
        
          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 15,
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
            search={false}
            dropdownStyles={{backgroundColor:'#212B7F',borderWidth:0}}
            dropdownTextStyles={{color:'white'}}
            
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
          {isEmpty ? (
            <View
              style={{
                backgroundColor: '#212B7F',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                marginTop: 20,
              }}>
              <Arrow />
            </View>
          ) : (
            <TouchableOpacity onPress={Save}>
              <View
                style={{
                  backgroundColor: '#051EFF',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  marginTop: 20,
                }}>
                <Arrow />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
export default FirstScreen;
