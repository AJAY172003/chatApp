import {useEffect, useRef, useState} from 'react';
import {InAppPurchasePayments} from './InAppPurchase';
import {getSubscriptions, initConnection} from 'react-native-iap';
import axios from 'axios';
import {ActivityIndicator, Button, View, Text} from 'react-native';
import {createClient} from '@supabase/supabase-js';
import {useSelector} from 'react-redux';
import {routes} from '../constants/routes';

const client = createClient(
  'https://ninflipyamhqwcrfymmu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU',
);

function PaymentProcessing({navigation}) {
  const {User} = useSelector(state => state.data);
  const SKU_IDs = 'litsub99';
  const purchaseTokenRef = useRef(null);
  const subIdRef =useRef(null);
  useEffect(() => {
    InitializeConnection();
    makingPurchase();
    const channelA = client.channel('payment');

    // Subscribe to the Channel
    channelA
      .on('broadcast', {event: 'sendpaymentinfo'}, payload => {
        VerifyPurchaseToken(payload.payload.purchaseToken);
      })
      .subscribe();
    console.log('started the supa listener on channel A');

    return () => {
      channelA.unsubscribe();
    };
  }, []);

  async function VerifyPurchaseToken(ReceivedTokenFromServer) {
    console.log('this is the UI purchase token: ', purchaseTokenRef.current);
    if (purchaseTokenRef.current == ReceivedTokenFromServer) {
      console.log(
        'Purchased token matched with server token and sub id is: ',
        subIdRef.current,
      );

      axios
        .post('http://192.168.1.6:3000/payment', {
          purchaseToken: purchaseTokenRef.current,
          email: 'sumitsrawat2003@gmail.com',
          subId: subIdRef.current,
        })
        .then(function (response) {
          console.log(response.data);
          navigation.navigate(routes.SETTINGS);
        })
        .catch(function (error) {
          navigation.navigate(routes.SETTINGS);
          console.log(error);
        });
      console.log('this is the sub id.....', subId);
    } else {
      console.log('wrong purchase token received');
    }
  }

  const makingPurchase = async () => {
    try {
      const paymentResult = await InAppPurchasePayments(SKU_IDs);
      console.log('initiating payment.....');
      if (paymentResult.success) {
        console.log(
          'payment successful',
          paymentResult.detail[0].purchaseToken,
        );
        purchaseTokenRef.current = paymentResult.detail[0].purchaseToken;
        subIdRef.current = paymentResult.detail[0].productId;
        console.log('this is the sub id', paymentResult.detail[0].productId);
      } else {
        console.log('payment failed');
      }
    } catch (error) {
      console.log('Payment error:', error);
    }
  };

  const InitializeConnection = async () => {
    try {
      await initConnection();
      console.log('Connection initialized');
      //   const sub = await getSubscriptions({skus: ['litsub99']}).then(result => {
      //     console.log('result of subscription', result[0].subscriptionOfferDetails);

      //   });
    } catch (error) {
      console.log('Error checking subscription status:', error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#211F1F',
        width: '100%',
        justifyContent: 'center',
        display: 'flex',
        height: '100%',
      }}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={{color: 'white', fontSize: 20, fontWeight: 500}}>
          Processing Payment
        </Text>
        <Text style={{color: 'white', fontSize: 15, fontWeight: 500}}>
          Do not press back or close the app
        </Text>
      </View>

      {/* <Button title="Purchase" onPress={() => makingPurchase()} /> */}
    </View>
  );
}
export default PaymentProcessing;
