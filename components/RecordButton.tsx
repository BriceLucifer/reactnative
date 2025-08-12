// components/RecordButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function RecordButton({ onPress }:{ onPress:()=>void }) {
    return (
        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <Text style={styles.icon}>🎙️</Text>
            <Text style={styles.txt}>Press & Hold to Record</Text>
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    btn:{ height:48, borderRadius:16, backgroundColor:'#0B2239', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
    icon:{ color:'#fff', fontSize:16 }, txt:{ color:'#fff', fontSize:14, fontWeight:'600' },
});
