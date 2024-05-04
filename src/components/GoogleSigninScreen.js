import {Button, View, ActivityIndicator, Text} from 'react-native';
import {useEffect, useState} from 'react';
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
        height: '100%',
        backgroundColor: 'black',
      }}>
        <View style={{display:'flex',justifyContent:'space-around',height:'50%'}}>
        {/* <Text style={{fontWeight:'900',color:'white'}}>PREMIUM BENEFITS!</Text>
        <Text style={{color:'white'}}>Get acces to catogry matching</Text>
        <Text style={{color:'white'}}>Get acces to MultiChat Windows</Text> */}
      <GoogleSigninButton
        style={{width: 192, height: 48}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
      />
      <View>
        <Button title="sign out" onPress={signOut}></Button>
      </View>
    </View>
    </View>
  );
}
export default GoogleSigninScreen;
