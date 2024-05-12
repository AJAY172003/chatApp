import { View, Text, TouchableOpacity, Button } from 'react-native';
import { useEffect, useState } from 'react';
import Google from '../assets/images/google.svg';
import { useDispatch, useSelector } from 'react-redux';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { createClient } from '@supabase/supabase-js';
import { setUser } from '../redux/DataSlice';

function GoogleSigninScreen() {
  const dispatch = useDispatch();
  const { User } = useSelector(state => state.data);
  const supabase = createClient(
    'https://ninflipyamhqwcrfymmu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU',
  );

  const checkAndCreateUser = async (name, email) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([{ email: email, name: name }]);
      if (error) throw error;
    } catch (error) {
      console.error('User already exists: ', error.message);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '968408332254-qiqjdjqh6m6t7f97n0l3u9os47rdh5t7.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      dispatch(setUser({ Email: userInfo.user.email, isLoggedIn: true }));
      checkAndCreateUser(userInfo.user.name, userInfo.user.email);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('play services not available or outdated');
      } else {
        console.log('error', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      dispatch(setUser({ Email: '', isLoggedIn: false }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        borderRadius: 10,
      }}>
      {User.Email?.length > 0 ? (
        <>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 13,
              color: 'white',
              paddingTop: 10,
            }}>
            {User.Email}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Button title="sign out" onPress={signOut}></Button>
          </View>
        </>
      ) : (
        <>
          <Text
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: 'white',
              marginTop: 10,
            }}>
            Login or sign up to restore your subscription
          </Text>
          <TouchableOpacity
            style={{ width: '100%' }}
            onPress={signIn}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#051EFF',
                height: 50,
                borderRadius: 10,
                marginTop: 10,
              }}>
              <Google width={30} height={30} />
              <Text style={{
                marginLeft: 10,
                color: 'white',
                fontWeight: 700,
                fontSize: 20
              }}>
                Login/SignUp
              </Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
export default GoogleSigninScreen;
