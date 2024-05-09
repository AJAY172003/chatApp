import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
const Admob = () => {
  const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-5213405198446794/5981178664';
  return (

    <View style={{
      alignSelf: 'center',
    }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          networkExtras: {
            collapsible: 'top',

          },
        }}
      />
    </View>
  );
}
export default Admob;