import { Button, View,ActivityIndicator, Text } from "react-native";
import { useEffect, useState } from "react";
import axios from 'axios';
import { GoogleSignin, statusCodes,GoogleSigninButton } from "@react-native-google-signin/google-signin";
function Start({ navigation }){
    // useEffect(()=>{
    //     console.log("reciverrrrrrrrr",receiverId)
    //     navigation.navigate('chat', { receiverId ,userId});
    // },[receiverId])
    // const [receiverId,setReceiverId]=useState(null);


    //google sign in
    const[user,setUser]=useState(null)
    useEffect(()=>{
        GoogleSignin.configure({
            webClientId: '968408332254-qiqjdjqh6m6t7f97n0l3u9os47rdh5t7.apps.googleusercontent.com',
            offlineAccess: true,
            forceCodeForRefreshToken: true,
          });
          issignIn()
    },[])
    const signIn = async () => {
        try{
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo)
            setUser(userInfo)

            
        }catch(error){
            if(error.code===statusCodes.SIGN_IN_CANCELLED){
                console.log("sign in cancelled")
            }else if(error.code===statusCodes.IN_PROGRESS){
                console.log("in progress");
            }
            else if(error.code===statusCodes.PLAY_SERVICES_NOT_AVAILABLE){
                console.log("play services not available or outdated")}
                else {
                    console.log("error",error)
                }
        }};
        const issignIn = async () => {
            const isSignedIn = await GoogleSignin.isSignedIn();
            if(isSignedIn){
               getCurrentUserInfo()
            }
            else{
                console.log("user not signed in")
            }
        }
        const getCurrentUserInfo = async () => {
            try{
                const userInfo = await GoogleSignin.getCurrentUser();
                setUser(userInfo)
                console.log(userInfo)
            }catch(error){
                console.log("error",error)
            }
        }
        const signOut = async () => {
            try{
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                setUser(null)
            }catch(error){
                console.error(error)
            }
        }


    const [userId, setUserId] = useState("2323"); // Set this to the current user's ID
    const[flag,setflag]=useState(false)
    useEffect(()=>{
     const randomId = Math.floor(Math.random() * 1000000);
     setUserId(randomId)
    },[])
 
    async function  handleStartPress(){
        
        try {
            setflag(true)
            const response = await axios.post('https://chatserver-arnv.onrender.com/user',{userId:userId});
            setflag(false)
           console.log("data from response: ",response.data.user)
            const data = response.data.user
           navigation.navigate('chat', {data ,userId});
          

         
        } catch (error) {
            setflag(false)
            console.error('Error fetching data:', error);
        }
}
return(
    <View style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%',backgroundColor:'black'}}>
        <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}    
        />
    {
    flag?
    <View >
     <ActivityIndicator size={30}/>
     <Text style={{color:'white'}}>Finding match...</Text>
    </View>
    :
    <View>

    <Button title='start'style={{width:'20%'}}   onPress={handleStartPress}></Button>
    </View>
    }
    </View>
) 
}
export default Start