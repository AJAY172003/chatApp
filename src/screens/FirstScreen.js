import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCountryFilter,
  setLanguageFilter,
  setSearchKey,
  setUser,
} from '../redux/DataSlice';
import { routes } from '../constants/routes';
import { SelectList } from 'react-native-dropdown-select-list';
import { StackActions } from '@react-navigation/native';

const genderData = [
  { key: '1', value: 'Female' },
  { key: '2', value: 'Male' },
];

function FirstScreen({ navigation }) {
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');

  const dispatch = useDispatch();
  const { CountryFilter, LanguageFilter, SearchKey } = useSelector(
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
    navigation.dispatch(StackActions.replace(routes.HOMESCREEN, {params: {}}));
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{
        backgroundColor: '#211F1F',
        height: '100%'
      }}>
      <View
        style={{
          backgroundColor: '#211F1F',
          justifyContent: 'space-evenly',
          paddingHorizontal: 10
        }}>
        <Text
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 40,
            marginTop: 40
          }}>
          Tell us about yourself
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 18,
            fontWeight: 500,
            marginTop: 10,
            paddingRight: 30
          }}>
          Join a chat room and talk with strangers about certain things
        </Text>
        <View
          style={{
            paddingVertical: 20,
          }}>

          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 10,
              height: 55,
              fontWeight: '700',
              color: 'white',
              fontSize: 24,
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
            dropdownStyles={{ backgroundColor: '#212B7F', borderWidth: 0 }}
            dropdownTextStyles={{ color: 'white' }}

            boxStyles={{
              backgroundColor: '#051EFF',
              borderRadius: 0,
              height: 55,
              marginTop: 15,
              borderWidth: 0,
              paddingHorizontal: 10,
            }}
            inputStyles={{
              fontWeight: 700,
              color: 'white',
              fontSize: 24,
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
                  fontSize: 24,
                  height: 55,
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
                height: 55,
                fontSize: 24,
                marginTop: 15,
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
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 55,
                height: 55
              }}>
              <Image
                source={require('../assets/images/arrow_icon.png')}
                style={{
                  alignSelf: 'center',
                  marginRight: 30,
                  width: 50,
                  height: 50
                }}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={Save}>
              <View
                style={{
                  backgroundColor: '#051EFF',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 20,
                  height: 55
                }}>
                <Image
                  source={require('../assets/images/arrow_icon.png')}
                  style={{
                    alignSelf: 'center',
                    marginRight: 30,
                    width: 50,
                    height: 50
                  }}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
export default FirstScreen;
