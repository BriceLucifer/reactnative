import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import {router} from "expo-router";

const Discord = () => {
    const [discordId, setDiscordId] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSave = () => {
        console.log('Save button clicked with Discord ID:', discordId);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Discord Account Linking</Text>
            <Text style={styles.subtitle}>
                Connect your Discord account to use Discord to chat and receive notifications.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Discord ID"
                value={discordId}
                onChangeText={setDiscordId}
            />
            <Text style={styles.instructions}>
                Please enter your Discord ID. Right-click on your Discord avatar and select &#34;Copy ID&#34; to get it.
                Tip: You need to turn on developer mode in the Discord settings.
            </Text>
            <Button title="Save" onPress={handleSave} color="#000" />
            <TouchableOpacity onPress={toggleModal} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>How to connect</Text>
            </TouchableOpacity>
            <Modal visible={showModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>How to connect</Text>
                    <Text style={styles.modalContent}>
                        To connect your Discord account, follow these steps:
                        1. Open Discord and go to User Settings.
                        2. Enable Developer Mode.
                        3. Right-click on your avatar and select &#34;Copy ID&#34;.
                        4. Paste the copied ID into the input field above.
                        5. Click the Save button to complete the connection.
                    </Text>
                    <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        marginTop: 10,
    },
    backButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    instructions: {
        fontSize: 14,
        marginBottom: 20,
    },
    connectButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    connectButtonText: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalContent: {
        fontSize: 16,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Discord;