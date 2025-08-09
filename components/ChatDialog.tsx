import React, { useState, useEffect, useRef } from 'react';
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
    ScrollView,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

// Defines the structure for a single message object.
type Message = {
    text: string;
    type: 'user' | 'ai'; // 'user' for messages sent by the user, 'ai' for responses.
};

// Defines the props accepted by the ChatDialog component.
type ChatDialogProps = {
    visible: boolean; // Controls the visibility of the modal.
    onClose: () => void; // Function to call when the modal should be closed.
};

/**
 * A slide-up chat dialog component that simulates a conversation with an AI.
 * It waits for the user to stop sending messages and typing before generating a response.
 * The AI's response concatenates all messages the user sent in their last "turn".
 * @param {ChatDialogProps} props - The component's props.
 */
export default function ChatDialog({ visible, onClose }: ChatDialogProps) {
    // --- STATE MANAGEMENT ---
    // Stores the current text in the input field.
    const [inputValue, setInputValue] = useState('');
    // Stores the entire conversation history as an array of Message objects.
    const [messages, setMessages] = useState<Message[]>([
        { text: 'How are you doing lately?', type: 'ai' },
    ]);

    // --- REFS ---
    // Holds the timer ID for the AI's response delay. Using a ref prevents re-renders.
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    // Holds a reference to the ScrollView to enable automatic scrolling.
    const scrollViewRef = useRef<ScrollView>(null);

    // --- EFFECTS ---

    /**
     * This is the core effect that manages the AI's response logic.
     * It runs whenever the user sends a message (changing `messages`) OR types in the input
     * (changing `inputValue`), allowing it to cancel the AI's response if the user is active.
     */
    useEffect(() => {
        // 1. Always clear any existing timer.
        // This is the crucial step that "resets" the AI's response countdown
        // every time the user takes an action (sends a message or types).
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 2. Define the conditions for the AI to respond.
        const lastMessage = messages[messages.length - 1];
        const userIsNotTyping = inputValue.trim() === '';

        // 3. Set a new timer ONLY if the user has just sent a message AND is not currently typing.
        if (lastMessage && lastMessage.type === 'user' && userIsNotTyping) {
            // Start a 3-second countdown.
            // @ts-ignore
            timerRef.current = setTimeout(() => {
                // --- AI Response Generation Logic ---

                // Find the index of the last AI message to define the start of the user's "turn".
                const lastAiMessageIndex = messages.map(m => m.type).lastIndexOf('ai');

                // Slice the array to get all user messages sent since the last AI response.
                const userMessagesInTurn = messages.slice(lastAiMessageIndex + 1);

                // Extract the text from each message and join them into a single string.
                const concatenatedText = userMessagesInTurn
                    .map((msg) => msg.text)
                    .join('; '); // Using '; ' as a separator.

                // Create the new AI response message.
                const aiResponse: Message = {
                    text: `I received: "${concatenatedText}"`,
                    type: 'ai',
                };

                // Add the AI's response to the conversation history.
                setMessages((prevMessages) => [...prevMessages, aiResponse]);
            }, 3000); // 3-second (3000ms) delay.
        }

        // Cleanup function: This will be called if the component unmounts.
        // It ensures no timers are left running in the background.
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [messages, inputValue]); // Dependencies: The effect re-runs if `messages` or `inputValue` changes.

    /**
     * This effect handles automatically scrolling to the bottom of the chat
     * whenever a new message is added to the conversation.
     */
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]); // Dependency: Runs only when the `messages` array changes.

    /**
     * Handles the action of sending a user's message.
     * It adds the new message to the state and clears the input field.
     */
    const handleSendMessage = () => {
        if (inputValue.trim()) {
            setMessages([...messages, { text: inputValue, type: 'user' }]);
            setInputValue('');
        }
    };

    // Determines whether to show the "send" icon or the "microphone" icon.
    const showSendIcon = inputValue.trim().length > 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalBackground} onPress={onClose}>
                {/* By stopping propagation, tapping inside the modal won't close it. */}
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    >
                        {messages.map((message, index) => (
                            <View key={index}>
                                {message.type === 'ai' ? (
                                    // AI Message Bubble
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
                                    // User Message Bubble
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
                                source={
                                    showSendIcon
                                        ? require('@/assets/images/send.png')
                                        : require('@/assets/images/record.png')
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
        flex: 1,
    },
    chatMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 18,
        marginRight: '20%',
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
    userMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 18,
        marginLeft: '20%',
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
    inputBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingLeft: 20,
        paddingRight: 18,
        marginBottom: 11,
        marginTop: 10,
        shadowColor: 'rgba(0,0,0,0.88)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        height: 55,
        shadowOpacity: 0.2,
        shadowRadius: 3.8,
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
        borderRadius: 15,
    },
    micImage: {
        width: 26,
        height: 26,
    },
    sendImage: {
        width: 20,
        height: 22,
    },
});
