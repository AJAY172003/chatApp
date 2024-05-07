import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds,GAMBannerAdSize } from 'react-native-google-mobile-ads';
const Admob = () => {
    const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-5213405198446794/5981178664';
  return (
  
    <BannerAd
    unitId={adUnitId}
    size={BannerAdSize.MEDIUM_RECTANGLE}
    requestOptions={{
      networkExtras: {
        collapsible: 'top',
        
     },
    }}
  />


  );
}
export default Admob;