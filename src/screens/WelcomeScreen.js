import { ActivityIndicator, ImageBackground, View } from 'react-native';
import { getData } from '../utils/storage';
import { setIP, setIsBlocked, setNumUserOnline, setReports, setUser } from '../redux/DataSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { routes } from '../constants/routes';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import publicIP from 'react-native-public-ip';
import { StackActions } from '@react-navigation/native';


const MAX_REPORTS = 10;
export const WelcomeScreen = ({ navigation }) => {
  const [hasDataLoaded, setHasDataLoaded] = useState(null);
  const dispatch = useDispatch();

  const { User } = useSelector(state => state.data);

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
    } catch (error) { }
    return email;
  };


  const getUserOnlineNumber = async () => {
    const response = await axios.get('http://192.168.1.2:8000/online');
    dispatch(setNumUserOnline(response.data.numOnlineUsers));
  }

  const getUserDailyReportsAndBlockedStatus = async (ip) => {
    const response = await axios.get('http://192.168.1.2:8000/dailyUserReports?ip=' + ip);
    const reports = response.data.reports;
    const isBlocked = response.data.blocked;
    return { reports, isBlocked };
  }

  useEffect(() => {

    getData('user').then(async data => {

      if (data != null) {
        let ipRes = '';
        try {
          ipRes = await publicIP();
        } catch (e) {
          console.log("error in getting ip: ", e);
        }

        if (ipRes.length) {
          const { reports, isBlocked } = await getUserDailyReportsAndBlockedStatus(ipRes);
          dispatch(setReports(Math.min(reports.length, MAX_REPORTS)));
          console.log("isBlocked: ", isBlocked);
          dispatch(setIsBlocked(isBlocked));
        }

        await getUserOnlineNumber();

        GoogleSignin.configure({
          webClientId:
            '968408332254-qiqjdjqh6m6t7f97n0l3u9os47rdh5t7.apps.googleusercontent.com',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
        const email = await issignIn();
        if (email != null) {
          data = { ...data, Email: email };
        }

        if (!data.isPremium) {
          data = {
            ...data, premiumSettings: {
              autoReconnect: false,
              autoMessage: ""
            }
          };
        }

        dispatch(setUser(data));
        dispatch(setIP(ipRes));
        setHasDataLoaded(true);
      } else {
        setHasDataLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (hasDataLoaded) {
      if (User.isUserInfoFilled) {
        navigation.dispatch(StackActions.replace(routes.HOMESCREEN, { params: {} }));
      } else {
        navigation.dispatch(StackActions.replace(routes.FIRSTSCREEN, { params: {} }));
      }
    }
  }, [hasDataLoaded]);
  return (
    <ImageBackground
      style={{
        height: '100%',
        width: '100%'
      }}
      source={require('../assets/images/logo.png')}
      resizeMode='stretch'
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
