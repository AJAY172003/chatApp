import {useRef} from 'react';
import {
  Linking,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Animated} from 'react-native';

export const DraggableMessageView = ({
  message,
  setDraggedIndex,
  index,
  showReplyToWindow,
  replyToMessage,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setDraggedIndex(index);
        // Only update pan.x if the gesture is moving to the right
        if (gestureState.dx > 50) {
          Animated.event(
            [null, {dx: pan.x, dy: pan.y}], // Update pan.x and pan.y with gesture
            {useNativeDriver: false},
          )(evt, gestureState);
        }
      },
      onPanResponderRelease: () => {
        showReplyToWindow(index);
        // Reset the position of the view to its initial state
        Animated.timing(pan, {
          toValue: {x: 0, y: 0},
          duration: 0, // Set duration to 0 to make it immediate
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  // method to parse the text passed and idintifying the links in it and then returning the text component with the links
  const parseTextWithLinks = text => {
    // Regular expression to split text by URLs
    const parts = text.split(
      /\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/,
    );
    return parts.map((part, index) => {
      if (
        part.match(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/)
      ) {
        const url =
          part.startsWith('http') || part.startsWith('www')
            ? part
            : 'http://' + part; // Append http:// to URLs missing a protocol or www.
        return (
          <Text
            key={index}
            style={{color: '#FF4949'}}
            onPress={() => Linking.openURL(url)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };
  return (
    <>
      <Animated.View
        onTouchStart={() => setDraggedIndex(index)}
        style={[
          {
            transform: [{translateX: pan.x}],
          },
        ]}
        {...panResponder.panHandlers}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: message.belongs_to ? 'flex-end' : 'flex-start',
          }}>
          <View
            style={{
              backgroundColor: message.belongs_to ? '#0066b2' : '#606060',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderRadius: message.reply_msg_id !== null ? 20 : 30,
              marginTop: 5,
              marginBottom: 10,
            }}>
            {message.reply_msg_id !== null ? (
              <View
                style={{
                  backgroundColor: 'white',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  width: '100%',
                  padding: 5,
                }}>
                <View
                  style={{
                    padding: 5,
                    borderRadius: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: '#0066b2',
                        fontWeight: 500,
                        fontSize: 12,
                        paddingTop: 2,
                      }}>
                      {message.belongs_to ? 'You' : 'Stranger'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: 'grey',
                      fontSize: 12,
                    }}
                    numberOfLines={2}>
                    {replyToMessage ? replyToMessage.text : ''}
                  </Text>
                </View>
              </View>
            ) : null}
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                paddingTop: message.reply_msg_id !== null ? 5 : 0,
                flexWrap: 'wrap', // Allow text to wrap if it exceeds the available width
              }}>
              {' '}
              {parseTextWithLinks(message.text)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};
