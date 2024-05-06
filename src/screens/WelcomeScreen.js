import {ActivityIndicator, View} from 'react-native';
import {getData} from '../utils/storage';
import {setUser} from '../redux/DataSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {routes} from '../constants/routes';

export const WelcomeScreen = ({navigation}) => {
  const [hasDataLoaded, setHasDataLoaded] = useState(null);
  const dispatch = useDispatch();

  const {User} = useSelector(state => state.data);
  useEffect(() => {
    getData('user').then(data => {
      if (data != null) {
        dispatch(setUser(data));
        setHasDataLoaded(true);
      }
      else {
        setHasDataLoaded(true)
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
    <ActivityIndicator
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      size="large"
      color="#0000ff"
    />
  );
};
