import { useReducer, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export const HomeScreen = () => {
    const [numOnlineUsers, setNumOnlineUsers] = useState(2000);
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('');
    const [gender, setGender] = useState('');
    const [userGender, setUserGender] = useState('');

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
                    fontSize: 20,
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
                        marginTop: 20,
                        borderRadius: 20,
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 24,
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
                        <TouchableOpacity>
                            <TextInput 
                                placeholder="Select Country"
                                placeholderTextColor={'grey'}
                                value={country}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <TextInput 
                                placeholder="Select Language"
                                placeholderTextColor={'grey'}
                                value={language}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <TextInput 
                                placeholder="Select Gender"
                                placeholderTextColor={'grey'}
                                value={gender}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: 'white',
                                marginTop: 20
                            }}
                        >
                            You must select your gender below before starting a chat
                            <Text
                            style={{color: 'red'}}> *</Text>
                        </Text>
                        <TouchableOpacity>
                            <TextInput 
                                placeholder="Select Your Gender"
                                placeholderTextColor={'grey'}
                                value={userGender}
                                editable={false}
                                style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginTop: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    paddingHorizontal: 10
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity
                disabled={userGender.length == 0}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: 10,
                        backgroundColor: userGender.length != 0 ? '#0066b2' : 'grey',
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