import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { setChatData, setCountryFilter, setCurrentChatTab, setLanguageFilter, setPreferences, setSearchKey, setUser } from "../redux/DataSlice";
import { routes } from "../constants/routes";
import { SelectList } from 'react-native-dropdown-select-list'
import { getData } from "../utils/storage";
import uuid from 'react-native-uuid';

const genderData = [
    { key: '1', value: 'Female' },
    { key: '2', value: 'Male' },
    { key: '3', value: 'Others' },
]
export const HomeScreen = ({ navigation }) => {
    const [numOnlineUsers, setNumOnlineUsers] = useState(2000);
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('');
    const [gender, setGender] = useState('');
    const [userGender, setUserGender] = useState('');

    const dispatch = useDispatch();
    const { CountryFilter, LanguageFilter, SearchKey } = useSelector((state) => state.data);

    useEffect(() => {
        getData('preferences').then((data) => {
            if (data != null) {
                setCountry(data.Country);
                setLanguage(data.Language);
                setGender(data.Gender);
                dispatch(setPreferences(data));
            }
        }
        );
        getData('user').then((data) => {
            if (data != null) {
                setUserGender(data.Gender);
                dispatch(setUser(data));
            }
        }
        );
    }, []);

    useEffect(() => {
        if (SearchKey == 'country' && CountryFilter !== null) {
            setCountry(CountryFilter);
            dispatch(setCountryFilter(null));
        }
        else if (SearchKey == 'language' && LanguageFilter !== null) {
            setLanguage(LanguageFilter);
            dispatch(setLanguageFilter(null));
        }
    }, [CountryFilter, LanguageFilter]);

    useEffect(() => {
        const preferences = {
            Country: country,
            Language: language,
            Gender: gender
        };
        dispatch(setPreferences(preferences));
    }, [country, language, gender])

    useEffect(() => {
        if (userGender != null && userGender.length != 0) {
            const user = {
                Gender: userGender
            };
            dispatch(setUser(user));
        }
    }, [userGender]);

    return (
        <View
            style={{
                backgroundColor: 'black',
                height: '100%',
                width: '100%',
                paddingHorizontal: 20,
                paddingVertical: 20,
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 10
                }}>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#62259F',
                        padding: 10,
                        borderRadius: 10,
                        justifyContent: 'center',
                    }}>
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 'bold',
                        }}>
                        BUY PREMIUM
                    </Text>
                    <Image
                        source={require('../assets/images/premium_icon.png')}
                        style={{
                            width: 20,
                            height: 20,
                            marginLeft: 5,
                        }}
                    />
                </TouchableOpacity>
            </View>
            <Text
                style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                }}>
                {`${numOnlineUsers}+\nPEOPLE ARE ONLINE`}
            </Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View
                    style={{
                        paddingHorizontal: 10,
                        paddingVertical: 20,
                        backgroundColor: '#202020',
                        marginTop: 40,
                        borderRadius: 20,
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 20,
                            fontWeight: 'bold',
                            marginTop: 10
                        }}
                    >
                        {`Tell us about \nyour preferences`}
                    </Text>
                    <Text
                        style={{
                            color: 'white',
                            marginTop: 5
                        }}
                    >We will use these to find relevant matches</Text>

                    <View style={{
                        paddingBottom: 20,
                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(setSearchKey('country'))
                                navigation.navigate(routes.SEARCHLIST, {
                                    title: 'Select Country'
                                })
                            }}
                        >
                            <TextInput
                                placeholder="Select Country"
                                placeholderTextColor={'grey'}
                                value={country}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 16,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(setSearchKey('language'))
                                navigation.navigate(routes.SEARCHLIST, {
                                    title: 'Select Language'
                                })
                            }}
                        >
                            <TextInput
                                placeholder="Select Language"
                                placeholderTextColor={'grey'}
                                value={language}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 16,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>
                        <SelectList
                            setSelected={setGender}
                            data={genderData}
                            save="value"
                            search={false}
                            boxStyles={{
                                backgroundColor: 'white',
                                borderRadius: 20,
                                marginTop: 20,
                                paddingHorizontal: 10,
                            }}
                            inputStyles={{
                                color: 'black',
                                fontSize: 16,
                            }}
                            placeholder={gender.length ? gender : "Select Gender"}
                        />
                        <Text
                            style={{
                                color: 'white',
                                marginTop: 20
                            }}
                        >
                            You must select your gender below before starting a chat
                            <Text
                                style={{ color: 'red' }}> *</Text>
                        </Text>
                        <SelectList
                            setSelected={setUserGender}
                            data={genderData}
                            save="value"
                            search={false}
                            boxStyles={{
                                backgroundColor: 'white',
                                borderRadius: 20,
                                marginTop: 20,
                                paddingHorizontal: 10,
                            }}
                            inputStyles={{
                                color: 'black',
                                fontSize: 16,
                            }}
                            placeholder={userGender.length ? userGender : "Select Your Gender"}
                        />
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity
                disabled={userGender == null || userGender.length == 0}
                onPress={() => {
                    dispatch(setCurrentChatTab(1));
                    dispatch(setChatData({
                        1: {
                            receiverId: null,
                            messages: []
                        }
                    }));
                    navigation.navigate(routes.CHATMANAGER, {
                        userId: uuid.v4(),
                    });
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: 10,
                        backgroundColor: (userGender != null && userGender.length != 0) ? '#0066b2' : 'grey',
                        borderRadius: 10,
                        marginHorizontal: 20,
                        marginVertical: 10,
                    }}>
                    START CHATTING
                </Text>
            </TouchableOpacity>
        </View>
    );
};