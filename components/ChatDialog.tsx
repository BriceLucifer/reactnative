/**
 * @fileoverview ChatDialog component - AI chat interface modal
 * 
 * Optimized with proper TypeScript, performance enhancements,
 * consistent styling patterns, and better code organization.
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage, ModalProps, COLORS, SPACING, ANIMATIONS, LAYOUT } from '@/types';

// Constants
const { height: screenHeight } = Dimensions.get('window');
const AI_RESPONSE_DELAY = 3000;
const MESSAGE_SEPARATOR = '; ';

// Component types
type ChatDialogProps = ModalProps;

interface MessageBubbleProps {
    message: ChatMessage;
    index: number;
}

// Message Bubble Component
const MessageBubble = memo<MessageBubbleProps>(({ message, index }) => {
    if (message.type === 'ai') {
        return (
            <View key={index} style={styles.chatMessageContainer}>
                <View style={styles.avatar}>
                    <Image
                        source={require('@/assets/images/chatdialog.png')}
                        style={styles.avatarImage}
                        accessibilityLabel="AI Avatar"
                    />
                </View>
                <View style={styles.chatBubble}>
                    <Text style={styles.chatText} selectable>
                        {message.text}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View key={index} style={styles.userMessageContainer}>
            <View style={styles.userChatBubble}>
                <Text style={styles.userChatText} selectable>
                    {message.text}
                </Text>
            </View>
        </View>
    );
});

MessageBubble.displayName = 'MessageBubble';

/**
 * ChatDialog - AI chat interface modal component
 * 
 * Features:
 * - Real-time message exchange with AI simulation
 * - Auto-scroll to bottom on new messages
 * - Dynamic send/record button states
 * - Proper error handling and performance optimization
 */
const ChatDialog = memo<ChatDialogProps>(({ visible, onClose }) => {
    const insets = useSafeAreaInsets();
    
    // State management
    const [inputValue, setInputValue] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { text: 'How are you doing lately?', type: 'ai', timestamp: Date.now() },
    ]);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    // Refs for timer and scroll management
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const textInputRef = useRef<TextInput>(null);

    // Memoized handlers
    const handleInputChange = useCallback((text: string) => {
        setInputValue(text);
        setIsTyping(text.trim().length > 0);
    }, []);

    const handleSendMessage = useCallback(() => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        try {
            const userMessage: ChatMessage = {
                text: trimmedInput,
                type: 'user',
                timestamp: Date.now(),
            };
            
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(false);
            
            // Focus back to input for better UX
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 100);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [inputValue]);

    const generateAIResponse = useCallback((userMessages: ChatMessage[]) => {
        try {
            const concatenatedText = userMessages
                .map(msg => msg.text)
                .join(MESSAGE_SEPARATOR);

            const aiResponse: ChatMessage = {
                text: `I received: "${concatenatedText}"`,
                type: 'ai',
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error generating AI response:', error);
            // Fallback response
            const fallbackResponse: ChatMessage = {
                text: 'Sorry, I encountered an error. Please try again.',
                type: 'ai',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, fallbackResponse]);
        }
    }, []);

    // AI response logic with proper cleanup
    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        const lastMessage = messages[messages.length - 1];
        const shouldGenerateResponse = 
            lastMessage?.type === 'user' && 
            !isTyping && 
            inputValue.trim() === '';

        if (shouldGenerateResponse) {
            timerRef.current = setTimeout(() => {
                const lastAiMessageIndex = messages.map(m => m.type).lastIndexOf('ai');
                const userMessagesInTurn = messages.slice(lastAiMessageIndex + 1)
                    .filter((msg): msg is ChatMessage => msg.type === 'user');
                
                if (userMessagesInTurn.length > 0) {
                    generateAIResponse(userMessagesInTurn);
                }
            }, AI_RESPONSE_DELAY);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [messages, inputValue, isTyping, generateAIResponse]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            // Small delay to ensure layout is complete
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setInputValue('');
            setIsTyping(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [visible]);

    // Computed values
    const showSendIcon = inputValue.trim().length > 0;
    const modalHeight = screenHeight * LAYOUT.MODAL_HEIGHT_PERCENTAGE;

    return (
        <Modal
            visible={visible}
            animationType={ANIMATIONS.MODAL_ANIMATION_TYPE}
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable 
                style={styles.modalBackground} 
                onPress={onClose}
                accessibilityLabel="Close chat dialog"
            >
                <Pressable 
                    style={[
                        styles.modalContainer,
                        {
                            height: modalHeight,
                            paddingBottom: Math.max(insets.bottom, SPACING.MD),
                        }
                    ]} 
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header indicator */}
                    <View style={styles.modalHandle} />
                    
                    {/* Messages container */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((message, index) => (
                            <MessageBubble 
                                key={`${message.timestamp}-${index}`} 
                                message={message} 
                                index={index}
                            />
                        ))}
                    </ScrollView>

                    {/* Input bar */}
                    <View style={styles.inputBarContainer}>
                        <TextInput
                            ref={textInputRef}
                            style={styles.textInput}
                            placeholder="Type your message..."
                            placeholderTextColor={COLORS.SECONDARY}
                            value={inputValue}
                            onChangeText={handleInputChange}
                            onSubmitEditing={handleSendMessage}
                            returnKeyType="send"
                            blurOnSubmit={false}
                            multiline
                            maxLength={1000}
                            accessibilityLabel="Message input"
                        />
                        <TouchableOpacity 
                            style={[
                                styles.actionButton, 
                                showSendIcon && styles.sendButtonActive
                            ]} 
                            onPress={handleSendMessage}
                            disabled={!showSendIcon}
                            accessibilityRole="button"
                            accessibilityLabel={showSendIcon ? "Send message" : "Voice record"}
                        >
                            <Image
                                source={
                                    showSendIcon
                                        ? require('@/assets/images/send.png')
                                        : require('@/assets/images/record.png')
                                }
                                style={showSendIcon ? styles.sendImage : styles.micImage}
                                accessibilityIgnoresInvertColors
                            />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

ChatDialog.displayName = 'ChatDialog';

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: COLORS.WHITE,
        borderTopLeftRadius: LAYOUT.MODAL_BORDER_RADIUS,
        borderTopRightRadius: LAYOUT.MODAL_BORDER_RADIUS,
        paddingHorizontal: SPACING.LG,
        paddingTop: SPACING.LG,
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: SPACING.LG,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingBottom: SPACING.SM,
        flexGrow: 1,
    },
    chatMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.LG,
        marginRight: '20%',
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22,
        marginRight: SPACING.SM,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    chatBubble: {
        backgroundColor: '#FAF7FA',
        paddingVertical: SPACING.MD,
        paddingHorizontal: SPACING.LG,
        borderRadius: 18,
        borderTopLeftRadius: 4,
        maxWidth: '85%',
    },
    chatText: {
        fontSize: 16,
        color: COLORS.PRIMARY,
        lineHeight: 22,
    },
    userMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.LG,
        marginLeft: '20%',
    },
    userChatBubble: {
        backgroundColor: '#F3F3F3',
        paddingVertical: SPACING.MD,
        paddingHorizontal: SPACING.LG,
        borderRadius: 18,
        borderTopRightRadius: 4,
        maxWidth: '85%',
    },
    userChatText: {
        fontSize: 16,
        color: COLORS.PRIMARY,
        lineHeight: 22,
    },
    inputBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.WHITE,
        borderRadius: LAYOUT.INPUT_BORDER_RADIUS,
        paddingLeft: SPACING.LG,
        paddingRight: SPACING.LG,
        paddingVertical: SPACING.SM,
        marginTop: SPACING.MD,
        minHeight: 55,
        maxHeight: 120,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.PRIMARY,
        fontWeight: '400',
        maxHeight: 80,
        lineHeight: 20,
        paddingVertical: SPACING.SM,
    },
    actionButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        marginLeft: SPACING.SM,
    },
    sendButtonActive: {
        backgroundColor: COLORS.PRIMARY,
    },
    micImage: {
        width: 22,
        height: 22,
        tintColor: COLORS.SECONDARY,
    },
    sendImage: {
        width: 18,
        height: 18,
        tintColor: COLORS.WHITE,
    },
});

export default ChatDialog;
