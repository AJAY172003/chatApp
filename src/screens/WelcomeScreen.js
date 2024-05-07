import {ActivityIndicator, ImageBackground, View} from 'react-native';
import {getData} from '../utils/storage';
import {setUser} from '../redux/DataSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {routes} from '../constants/routes';
import {GoogleSignin} from '@react-native-google-signin/google-signin';


export const WelcomeScreen = ({navigation}) => {
  const [hasDataLoaded, setHasDataLoaded] = useState(null);
  const dispatch = useDispatch();

  const {User} = useSelector(state => state.data);

  const issignIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      return getSignedInUserEmail();
    }
    return null;
  };

  const getSignedInUserEmail = async () => {
    let email = null;
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      email = userInfo.user.email;
    } catch (error) {}
    return email;
  };

  useEffect(() => {
  

    getData('user').then(async data => {
      if (data != null) {
        GoogleSignin.configure({
          webClientId:
            '968408332254-qiqjdjqh6m6t7f97n0l3u9os47rdh5t7.apps.googleusercontent.com',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
        const email = await issignIn();
        if (email != null) {
          data = {...data, Email: email};
        }
        dispatch(setUser(data));
        setHasDataLoaded(true);
      } else {
        setHasDataLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (hasDataLoaded) {
      console.log('user data: ', User);
      if (User.isUserInfoFilled) {
        navigation.navigate(routes.HOMESCREEN);
      } else {
        navigation.navigate(routes.FIRSTSCREEN);
      }
    }
  }, [hasDataLoaded]);
  return (
    <ImageBackground
    style={{height:'100%'}}
    source={require('../assets/images/logo.png')}
    resizeMode="cover"
    >
    <ActivityIndicator
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      size="large"
      color="#0000ff"
    />
    </ImageBackground>
  );
};
