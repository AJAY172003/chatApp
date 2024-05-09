import {
    Button,
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Settings from '../assets/images/settings.svg';
import { routes } from '../constants/routes';
import { setChatData, setCurrentChatTab } from '../redux/DataSlice';
import { useDispatch, useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { useEffect, useState } from 'react';
 
export const HomeScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const {NumUserOnline} = useSelector(state => state.data);
    useEffect(() => {   
        openModal()
    },[])
    const openModal = () => {
        setModalVisible(true);
      };
      const closeModal = () => {
        setModalVisible(false);
      };
    console.log("homescreen data: ",NumUserOnline)
    const dispatch = useDispatch();
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
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                }}>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}>
                    {`${NumUserOnline}\nPEOPLE ARE ONLINE`}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SETTINGS)}>
                    <Settings />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={() => {
                    dispatch(setCurrentChatTab(1));
                    dispatch(setChatData({
                        1: {
                            receiverId: null,
                            messages: []
                        }
                    }));
                    navigation.navigate(routes.CHATMANAGER, {
                        userId: uuid.v4(),
                    });
                }}
            >
                <Image
                    source={require('../assets/images/chat_with_strangers.png')}
                    style={{
    
                        resizeMode: 'cover',
                        alignSelf: 'center',
                    }}
                />
                
            </TouchableOpacity>

            <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{display:'flex',justifyContent:'center',alignItems:'center' ,gap:20 }}>
         <Image
                    source={require('../assets/images/behave_wisely.png')}
                    style={{
                        borderWidth:1,
                        borderColor:'white',
                        borderRadius:20,
                        height:300,
                        width:280,
                        resizeMode: 'cover',
                        alignSelf: 'center',
                    }}
                />
               <Text style={{color:'white',fontSize:30,fontWeight:500}}>Behave Wisely</Text> 
          <Button title="Continue"  onPress={closeModal} color={"#051EFF"} />
        </View>
      </View>
    </Modal>
        </View>
    );
};
