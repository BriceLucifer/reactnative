import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    ScrollView, // Import ScrollView to display messages
} from 'react-native';

// Get the screen height to calculate the modal height
const { height: screenHeight } = Dimensions.get('window');

// Define the structure for a single message
type Message = {
    text: string;
    type: 'user' | 'ai';
};

// Define the component's props
type ChatDialogProps = {
    visible: boolean;
    onClose: () => void;
};

/**
 * A reusable slide-up modal component with full chat functionality.
 * It appears from the bottom, supports sending messages, and displays a conversation.
 * @param {boolean} visible - Controls whether the modal is visible.
 * @param {() => void} onClose - Function to call when the modal should be closed.
 */
export default function ChatDialog({ visible, onClose }: ChatDialogProps) {
    // State to hold the current value of the text input
    const [inputValue, setInputValue] = useState('');
    // State to hold the list of all messages in the conversation
    const [messages, setMessages] = useState<Message[]>([
        { text: 'How are you doing lately?', type: 'ai' },
    ]);

    // Function to handle sending a message
    const handleSendMessage = () => {
        // Only send if there is text in the input
        if (inputValue.trim()) {
            // Add the new user message to the messages array
            setMessages([...messages, { text: inputValue, type: 'user' }]);
            // Clear the input field
            setInputValue('');
        }
    };

    // Determine which icon to show based on whether there is input
    const showSendIcon = inputValue.trim().length > 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalBackground} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Use a ScrollView to display the chat messages */}
                    <ScrollView style={styles.messagesContainer}>
                        {messages.map((message, index) => (
                            <View key={index}>
                                {message.type === 'ai' ? (
                                    // AI message bubble
                                    <View style={styles.chatMessageContainer}>
                                        <View style={styles.avatar}>
                                            <Image
                                                source={require("@/assets/images/chatdialog.png")}
                                                style={styles.avatarImage}
                                            />
                                        </View>
                                        <View style={styles.chatBubble}>
                                            <Text style={styles.chatText}>{message.text}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    // User message bubble
                                    <View style={styles.userMessageContainer}>
                                        <View style={styles.userChatBubble}>
                                            <Text style={styles.userChatText}>{message.text}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    {/* Input bar at the bottom */}
                    <View style={styles.inputBarContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="input"
                            placeholderTextColor="#9A9FA6"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <TouchableOpacity style={[styles.actionButton, showSendIcon && styles.sendButtonActive]} onPress={handleSendMessage}>
                            <Image
                                // Conditionally change the icon source using local assets
                                source={
                                    showSendIcon
                                        ? require('@/assets/images/send.png') // <-- YOUR SEND ICON LOCAL PATH
                                        : require('@/assets/images/record.png') // <-- YOUR MICROPHONE ICON LOCAL PATH
                                }
                                style={showSendIcon ? styles.sendImage : styles.micImage}
                            />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// Define the styles for the component
const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        height: screenHeight * 0.80,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    messagesContainer: {
        flex: 1, // Allows the scroll view to take up available space
    },
    // AI message styles
    chatMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 18,
        marginRight: '20%', // Ensure AI bubbles don't take full width
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 20,
        marginRight: 10,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    chatBubble: {
        backgroundColor: '#FAF7FA',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderTopLeftRadius: 4,
    },
    chatText: {
        fontSize: 18,
        color: '#020F20',
    },
    // User message styles
    userMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Aligns user messages to the right
        marginTop: 18,
        marginLeft: '20%', // Ensure user bubbles don't take full width
    },
    userChatBubble: {
        backgroundColor: '#F3F3F3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderTopRightRadius: 4,
    },
    userChatText: {
        fontSize: 18,
        color: '#020F20',
    },
    // Input bar styles
    inputBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Background color is needed for shadow
        borderRadius: 14,
        paddingLeft: 20,
        paddingRight: 18,
        marginBottom: 11,
        marginTop: 10,
        // Shadow for iOS
        shadowColor: 'rgba(0,0,0,0.88)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        height: 60,
        shadowOpacity: 0.2,
        shadowRadius: 3.8,
        // Elevation for Android
        elevation: 6,
    },
    textInput: {
        flex: 1,
        fontSize: 20,
        color: '#020F20',
        fontWeight: '400',
        height: 50,
    },
    actionButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#020F20',
        borderRadius: 15, // Corrected: Half of width/height to make it a circle
    },
    micImage: {
        width: 26,
        height: 26,
    },
    sendImage: {
        width: 20,
        height: 22,
        tintColor: '#FFFFFF', // Makes the send icon image white
    },
});
