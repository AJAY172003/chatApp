import React,{useEffect, useRef, useState} from 'react';
import Triangle from "./triangle.svg"
import DownTriangle from "./DownTriangle.svg"
import { Button, FlatList, TextInput,KeyboardAvoidingView, TouchableOpacity, } from 'react-native';
import 'react-native-url-polyfill/auto'
import Send from './send.svg'
import Hand from "./hand.svg"
import { createClient } from '@supabase/supabase-js'
import axios from 'axios';
import uuid from 'react-native-uuid';
import {
  Text,
  View,
  ScrollView,
} from 'react-native';

const supabase = createClient("https://ninflipyamhqwcrfymmu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU")
function ChatScreen({ route }){

  // Create a function to handle inserts
const handleInserts = (payload) => {
  console.log('Change received!', payload.new)
  if(payload.new.receiver_id==userId && payload.new.sender_id==receiverId && messageId[messageId.length-1]!=payload.new.messageId){ 
    setMessages(prevMessages => [...prevMessages, {text:payload.new.message,id:"receiver",messageId:payload.new.messageId}])
    setMessageId(prevMessages=>[...prevMessages,payload.new.messageId])
    console.log("reciverdff")

}
else console.log("no new message");
}
  // Listen to inserts
supabase
.channel('test')
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'test' }, handleInserts)
.subscribe() 

const [messages, setMessages] = useState([]);
const [messageId, setMessageId] = useState([""]);
const [receiverId,setReceiverId]=useState("");
useEffect(()=>{
  const { data ,userId} = route.params;
  setReceiverId(data)
  setUserId(userId) 
  console.log( "this is receiver id",receiverId)
},[])
  const [messageText, setMessageText] = useState('');

  const [userId, setUserId] = useState("2323"); // Set this to the current user's ID

  const sendMessage = async () => {
  
      const randomId = uuid.v4();
      console.log(randomId)
      console.log( "this is user id",userId)
      console.log( "this is receiver id",receiverId)
    if (!messageText.trim()) return;
    try {
      const { data, error } = await supabase
        .from('test')
        .insert([{ sender_id: userId, receiver_id :receiverId,message: messageText ,messageId:randomId}]);
      if (error) throw error;
      setMessages(prevMessages=>[...prevMessages,{text:messageText,id:'sender',messageId:randomId}])
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };  

  const flatListRef = useRef(null);
  useEffect(() => {
    // Automatically scroll to the end when messages change
    if (flatListRef.current) {
      
      flatListRef.current.scrollToEnd({ animated: true});
    }
  }, [messages]);
  
  // const handleContentSizeChange = () => {
  //   const index=messages.length-1
  //   // Scroll to the end of the list when the content size changes (new message added)
  //   flatListRef.current.scrollToIndex({ animated: true, index });
  // };

  return(
<View style={{ flex: 1, justifyContent: 'space-around',backgroundColor:'black',flexDirection:'column'}}>
  <View style={{height:'80%',marginTop:'10%'}}>
{
  messages.length==0?
  <View style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
<View style={{width:'80%',padding:10,backgroundColor:"#62259F",display:'flex',justifyContent:'center',
alignItems:'center',borderRadius:50,flexDirection:'row'}}>
<Text style={{color:'white',fontSize:16}}>Say hi,To your new friend</Text>
<Hand/>

</View>
</View>
:


      <FlatList 
      ref={flatListRef}
      initialNumToRender={messages.length}
      style={{backgroundColor:'black'}}
   
        data={messages}
      
        renderItem={({ item ,index}) => (
          <View  key={index} style={{flex:1,width:'100%',flexDirection:'column',justifyContent:'space-around'}}>
      
          {
            item.id=='receiver'?
            <View style={{display:'flex',justifyContent:'flex-end',alignItems:'flex-end',width:'90%',margin:10}}>
  
           
            <View style={{display:'flex',backgroundColor:'#62259F',paddingLeft:10,paddingRight:10,paddingBottom:5,paddingTop:5,justifyContent:'center',alignItems:'center'}}>
            <Text  style={{color:'white',fontSize:16}}> {item.text}</Text>
            </View>
            <View style={{backgroundColor:'#62259F',height:'3%',width:'5%',top:'0%'}}>
            <View style={{position:'absolute',bottom:'0%',top:'0%',right:'0%',backgroundColor:'#62259F'}}>
             <DownTriangle/>
              </View>
              </View>
            </View>
            :
            <View  style={{display:'flex',justifyContent:'flex-start',alignItems:'flex-start',width:'90%',margin:10}}>
              <View style={{top:'5%'}}>
              <Triangle/>
              </View>
            <View style={{display:'flex',backgroundColor:'#1BA1E0',paddingLeft:10,paddingRight:10,paddingBottom:5,paddingTop:5,justifyContent:'center',alignItems:'center'}}>
            <Text  style={{color:'white',fontSize:16}}> {item.text}</Text>
            </View>

            </View>
          }
   </View>
        )}
        
      />
      }
  </View>
  <View style={{ display:'flex', alignItems: 'center' ,borderRadius:50,width:'100%'}}> 
      <View style={{ display:'flex',flexDirection: 'row', alignItems: 'center' ,backgroundColor:'white',borderRadius:50,width:'90%',justifyContent:'center',height:50}}>
        <View style={{height:'100%',width:'80%'}}>
        <TextInput
        placeholderTextColor="grey"
        
          placeholder='type here'
          style={{ flex: 1 ,color:'black',width:'100%'}}
          value={messageText}
        
          onChangeText={setMessageText}
        /></View>
        <TouchableOpacity onPress={sendMessage}>
        <Send/>
        </TouchableOpacity>
      


      </View>
      </View>
    </View>
  )
}

export default ChatScreen;

