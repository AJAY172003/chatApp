import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { ActivityIndicator } from "react-native";

export const ConfirmationPopup = ({ 
    isVisible,
    title, 
    positiveLabel, 
    negativeLabel, 
    positiveCallback, 
    negativeCallback,
    positiveCallbackParams = [],
    negativeCallbackParams = [],
    popupLoader,
    singleOption = false
}) => {
    return (
        <Modal
            visible={isVisible}
            style={{ marginTop: 100 }}
            animationType="none"
            transparent={true}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#00000080',
                }}>
                <View style={styles.popupContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={[{...styles.buttonBlock}, {justifyContent: singleOption ? 'flex-end' : 'space-between'}]}>
                        {!singleOption && <TouchableOpacity style={[{...styles.button}, {backgroundColor: '#c04000'}]} onPress={() => negativeCallback(...negativeCallbackParams)}>
                            <Text style={styles.buttonLabel}>{negativeLabel}</Text>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity style={[{...styles.button}, {backgroundColor: '#228b22'}]} onPress={() => positiveCallback(...positiveCallbackParams)}>
                            {popupLoader ? 
                                <ActivityIndicator size="small" color="white" />
                            : <Text style={styles.buttonLabel}>{positiveLabel}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        width: 300,
        backgroundColor: '#0066b2',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        fontWeight: 'bold',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white'
    }
});
