// File: app/screens/NoteEditorScreen.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ImageSourcePropType,
    Alert, // <-- 1. 导入 Alert 用于权限提示
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Note, ContentBlock } from '@/components/NoteCard';
import * as ImagePicker from 'expo-image-picker'; // <-- 2. 导入 ImagePicker

// ... (FAKE_NOTES_DATABASE 和类型定义保持不变)
const FAKE_NOTES_DATABASE: Note[] = [
    { id: '1', updatedAt: '2025/08/11 10:24', content: [ { type: 'text', value: 'If you want to make a product that can go global, it is not enough to just translate the language.' }, { type: 'image', url: "https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg"} ] },
    { id: '3', updatedAt: '2025/06/16 12:24', content: [ { type: 'text', value: 'It is not enough to just translate the language.' }, { type: 'audio', url: 'path/to/audio.mp3', duration: '10"' } ] },
    { id: '2', updatedAt: '2025/06/15 09:15', content: [ { type: 'text', value: 'The key is to master two principles: to maintain the core functions that are universal globally, and to make special adjustments for different regions.' } ] },
];
type EditorContentBlock = ContentBlock | { type: 'prompt'; value: string };


export default function NoteEditorScreen() {
    // ... (state 和 useEffect 保持不变)
    const { noteId } = useLocalSearchParams<{ noteId?: string }>();
    const [content, setContent] = useState<EditorContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (noteId) {
            const existingNote = FAKE_NOTES_DATABASE.find(note => note.id === noteId);
            if (existingNote) setContent(existingNote.content);
        } else {
            const now = new Date();
            const greeting = `Good ${now.getHours() < 12 ? 'morning' : 'evening'}, Mike.`;
            setContent([ { type: 'prompt', value: `${greeting}\nWhat do you want to share with me today?` }, { type: 'text', value: '' } ]);
        }
        setIsLoading(false);
    }, [noteId]);

    // ... (handleTextChange 保持不变)
    const handleTextChange = (newText: string, blockIndex: number) => {
        const newContent = [...content];
        const blockToUpdate = newContent[blockIndex];
        if (blockToUpdate && blockToUpdate.type === 'text') {
            blockToUpdate.value = newText;
            setContent(newContent);
        }
    };


    const handleClose = () => router.back();

    // --- START: 更新 handleAddImage 函数 ---
    const handleAddImage = async () => {
        // 1. 请求访问相册的权限
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You've refused to allow this app to access your photos.");
            return;
        }

        // 2. 打开相册
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // 只允许选择图片
            allowsEditing: true, // 允许用户编辑图片（裁剪等）
            aspect: [4, 3],      // 编辑时的裁剪比例
            quality: 1,          // 图片质量 (0 to 1)
        });

        // 3. 处理结果
        if (!result.canceled) {
            // 获取选中图片的本地 URI
            const imageUri = result.assets[0].uri;

            // 创建一个新的 image content block
            const newImageBlock: ContentBlock = {
                type: 'image',
                url: imageUri,
            };

            // 4. 更新 state，将新图片块添加到内容数组中
            setContent(currentContent => [...currentContent, newImageBlock]);
        }
    };
    // --- END: 更新 handleAddImage 函数 ---

    const handleRecordAudio = () => console.log('Record audio pressed');
    const handleSave = () => console.log('Save (Respond) pressed');

    // ... (渲染部分 JSX 保持不变)
    if (isLoading) { return <View style={styles.container}><Text>Loading...</Text></View>; }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25} >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.timestamp}>{new Date().toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).replace(' ', ' ')}</Text>
                    {content.map((block, index) => {
                        switch (block.type) {
                            case 'prompt': return <Text key={index} style={styles.promptText}>{block.value}</Text>;
                            case 'text': return ( <TextInput key={index} style={styles.textInput} placeholder="Write down here" placeholderTextColor="#C7C7CC" multiline value={block.value} onChangeText={(text) => handleTextChange(text, index)} /> );
                            case 'image': const source = typeof block.url === 'string' ? { uri: block.url } : block.url; return <Image key={index} source={source as ImageSourcePropType} style={styles.image} />;
                            default: return null;
                        }
                    })}
                </ScrollView>
                <View style={styles.toolbar}>
                    <TouchableOpacity onPress={handleRecordAudio}><Image source={require('../../assets/images/record.png')} style={styles.toolbarIcon} /></TouchableOpacity>
                    <TouchableOpacity style={styles.respondButton} onPress={handleSave}><Text style={styles.respondButtonText}>Respond</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleAddImage}><Image source={require('../../assets/images/gallery.png')} style={styles.toolbarIcon} /></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ... (样式保持不变)
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8F9FA', }, keyboardAvoidingContainer: { flex: 1, }, header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, }, closeButton: { padding: 8, }, closeButtonText: { fontSize: 24, color: '#8E8E93', fontWeight: '300', }, contentContainer: { paddingHorizontal: 24, paddingBottom: 24, }, timestamp: { fontSize: 13, color: '#AEAEB2', marginBottom: 16, }, promptText: { fontSize: 18, lineHeight: 26, color: '#020F20', marginBottom: 24, }, textInput: { fontSize: 18, lineHeight: 26, color: '#020F20', minHeight: 100, }, image: { width: '100%', height: 250, borderRadius: 16, marginVertical: 16, }, toolbar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#F8F9FA', borderTopWidth: 1, borderTopColor: '#E7EAED', }, toolbarIcon: { width: 28, height: 28, resizeMode: 'contain', }, respondButton: { backgroundColor: '#333231', borderRadius: 99, paddingVertical: 16, paddingHorizontal: 40, }, respondButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', }, });