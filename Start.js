import { Button, View,ActivityIndicator, Text } from "react-native";
import { useEffect, useState } from "react";
import axios from 'axios';
function Start({ navigation }){
    // useEffect(()=>{
    //     console.log("reciverrrrrrrrr",receiverId)
    //     navigation.navigate('chat', { receiverId ,userId});
    // },[receiverId])
    // const [receiverId,setReceiverId]=useState(null);
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
     
     
    {
    flag?
    <View >
     <ActivityIndicator size={30}/>
     <Text style={{color:'white'}}>Finding match...</Text>
    </View>
    :<Button title='start'style={{width:'20%'}}   onPress={handleStartPress}></Button>}
    </View>
) 
}
export default Start