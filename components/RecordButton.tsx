import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const RecordButton = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);

    const startRecording = async () => {
        try {
            const { Recordings } = await import('expo-av');
            const recording = new Recordings.Recording();
            await recording.prepareToRecordAsync(Recordings.RecordingOptionsPreset.HIGH_QUALITY);
            await recording.startAsync();
            setRecording(recording);
            setIsRecording(true);
        } catch (error) {
            console.error(error);
        }
    };

    const stopRecording = async () => {
        if (recording) {
            await recording.stopAndUnloadAsync();
            setIsRecording(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPressIn={startRecording}
            onPressOut={stopRecording}
        >
            {isRecording ? (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="small" color="white" />
                </View>
            ) : (
                <Text style={styles.text}>Press and hold to record</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        color: 'white',
        fontSize: 16,
        marginRight: 10,
    },
    activityIndicatorContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 10,
    },
});

export default RecordButton;