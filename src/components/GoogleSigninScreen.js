import {
  Button,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useEffect, useState} from 'react';
import Google from '../assets/images/google.svg';
import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {createClient} from '@supabase/supabase-js';
function GoogleSigninScreen() {
  const supabase = createClient(
    'https://ninflipyamhqwcrfymmu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU',
  );
  const [user, setUser] = useState(null);

  const userDetails = async (name, email) => {
    try {
      const {error} = await supabase
        .from('users')
        .insert([{email: email, name: name}]);
      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };
  console.log('user signin: ', user);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '968408332254-qiqjdjqh6m6t7f97n0l3u9os47rdh5t7.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    issignIn();
  }, []);
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('user info', userInfo);
      userDetails(userInfo.user.name, userInfo.user.email);
      setUser({name: userInfo.user.name, email: userInfo.user.email});
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
  const issignIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      getCurrentUserInfo();
    } else {
      console.log('user not signed in');
    }
  };
  const getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      // setUser(userInfo)
      setUser({name: userInfo.user.name, email: userInfo.user.email});
      console.log(userInfo);
    } catch (error) {
      console.log('error', error);
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(null);
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
        borderRadius: 20,
      }}>
      <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>
        Login or sign up to restore your subscription
      </Text>
      <TouchableOpacity style={{width: '85%'}} onPress={signIn}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#051EFF',
            height: 40,
            borderRadius: 10,
            marginTop: 10,
          }}>
          <Google width={20} height={20} />
          <Text style={{marginLeft: 10, color: 'white',fontWeight:900}}>
          Login/SignUp
          </Text>
        </View>
      </TouchableOpacity>

      {/* <Button title="sign out" onPress={signOut}></Button> */}
    </View>
  );
}
export default GoogleSigninScreen;
