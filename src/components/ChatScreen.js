import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Linking, TextInput, TouchableOpacity, } from 'react-native';
import 'react-native-url-polyfill/auto'
import Send from '../assets/images/send.svg'
import Hand from "../assets/images/hand.svg"
import { createClient } from '@supabase/supabase-js'
import uuid from 'react-native-uuid';
import {
  Text,
  View,
} from 'react-native';

const supabase = createClient("https://ninflipyamhqwcrfymmu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbmZsaXB5YW1ocXdjcmZ5bW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTcwOTYsImV4cCI6MjAzMDEzMzA5Nn0.FBRmz0HOlsMUkMXzQiZTXxyLruKqygXjw17g0QuHhPU")
function ChatScreen({ route }) {

  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {

    if (userId == null) {
      const { data, userId } = route.params;
      console.log("recieverId: ", data);
      setReceiverId(data);
      setUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (userId !== null && receiverId !== null) {
      // Create a function to handle inserts
      const handleInserts = (payload) => {
        console.log('Change received!', payload);
        // check to recieve new msg only once and not after it as supa may send same msg multiple times in a row
        if ((payload.new.receiver_id == userId && payload.new.sender_id == receiverId) && (messages.length == 0 || messages[messages.length - 1].messageId != payload.new.messageId)) {
          setMessages(prevMessages => [...prevMessages, { text: payload.new.message, belongs_to: false, messageId: payload.new.messageId }])
          console.log("new msg is recieved...");
        }
      }

      // Listen to inserts
      supabase
        .channel('test')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'test' }, handleInserts)
        .subscribe();
    }
    return () => {
      if (userId !== null && receiverId !== null) {
        supabase.removeAllChannels();
      }
    }
  }, [receiverId, userId]);


  const sendMessage = async () => {
    const randomId = uuid.v4();
    if (!messageText.trim()) return;
    try {
      const { error } = await supabase
        .from('test')
        .insert([{ sender_id: userId, receiver_id: receiverId, message: messageText, messageId: randomId }]);
      if (error) throw error;
      setMessages(prevMessages => [...prevMessages, { text: messageText, belongs_to: true, messageId: randomId }]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const flatListRef = useRef(null);
  useEffect(() => {
    // Automatically scroll to the end when messages change
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // method to parse the text passed and idintifying the links in it and then returning the text component with the links
  const parseTextWithLinks = (text) => {
    // Regular expression to split text by URLs
    const parts = text.split(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/);
    return parts.map((part, index) => {
      if (part.match(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/)) {
        const url = part.startsWith("http") || part.startsWith("www") ? part : "http://" + part; // Append http:// to URLs missing a protocol or www.
        return (
          <Text key={index} style={{ color: '#FF4949' }} onPress={() => Linking.openURL(url)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: 'black',
        flexDirection: 'column'
      }}>
      <View
        style={{
          height: '80%',
        }}>
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              textAlign: 'center',
              padding: 10,
              fontStyle: 'italic'
            }}
          >
            {`You are talking with: `}
            <Text
              style={{
                color: '#0066b2',
                fontWeight: 500
              }}
            >{receiverId}</Text>
          </Text>
        {
          messages.length == 0 ?
            <View
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <View style={{
                width: '80%',
                padding: 10,
                backgroundColor: "#62259F",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 50,
                flexDirection: 'row'
              }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Say hi,To your new friend</Text>
                <Hand />
              </View>
            </View>
            :
            <FlatList
              ref={flatListRef}
              initialNumToRender={messages.length}
              style={{ backgroundColor: 'black' }}
              data={messages}
              renderItem={({ item, index }) => (
                <>
                  {
                    item.belongs_to ?
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'flex-end',
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 14,
                            flexWrap: 'wrap', // Allow text to wrap if it exceeds the available width
                            backgroundColor: '#62259F',
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 30,
                            marginLeft: '20%',
                            marginRight: 10,
                            marginTop: 15
                          }}> {parseTextWithLinks(item.text)}</Text>
                      </View>
                      :
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 14,
                            flexWrap: 'wrap', // Allow text to wrap if it exceeds the available width
                            backgroundColor: '#0066b2',
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 30,
                            marginRight: '20%',
                            marginLeft: 10,
                            marginTop: 15
                          }}> {parseTextWithLinks(item.text)}</Text>
                      </View>
                  }
                </>
              )}
            />
        }
      </View>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 50,
          width: '100%'
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 50,
            width: '90%',
            justifyContent: 'center',
            minHeight: 50
          }}>
          <View
            style={{
              height: '100%',
              width: '80%'
            }}>
            <TextInput
              placeholderTextColor="grey"
              placeholder='Type your message here...'
              style={{ flex: 1, color: 'black', width: '100%' }}
              value={messageText}
              onChangeText={setMessageText}
              multiline={true}
            />
          </View>
          <TouchableOpacity onPress={sendMessage}>
            <Send />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default ChatScreen;
