// components/RecordingModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';

interface Props { isVisible: boolean; onClose: () => void; onFinish: (uri: string, durationMs: number) => void; }
const fmt = (ms:number)=>{ const s=Math.floor(ms/1000); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };

const RecordingModal: React.FC<Props> = ({ isVisible, onClose, onFinish }) => {
    const [recording, setRecording] = useState<Audio.Recording|null>(null);
    const [elapsed, setElapsed] = useState(0);
    const ticking = useRef<NodeJS.Timeout|null>(null);

    async function start() {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        ticking.current = setInterval(async () => {
            const st = await rec.getStatusAsync();
            if ('durationMillis' in st) setElapsed(st.durationMillis ?? 0);
        }, 200);
    }

    async function discardConfirm() {
        Alert.alert('Exit? Audio will be deleted', '', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: async () => {
                    try { await recording?.stopAndUnloadAsync(); } catch {}
                    if (ticking.current) clearInterval(ticking.current);
                    setRecording(null); setElapsed(0); onClose();
                } },
        ]);
    }

    async function save() {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI()!;
            if (ticking.current) clearInterval(ticking.current);
            onFinish(uri, elapsed);
        } finally { setRecording(null); setElapsed(0); }
    }

    useEffect(() => { if (isVisible) start(); return () => { if (ticking.current) clearInterval(ticking.current); }; }, [isVisible]);

    return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={discardConfirm}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Recording</Text>
                    <View style={styles.timerWrap}><Text style={styles.timer}>{fmt(elapsed)}</Text></View>
                    <View style={styles.btnRow}>
                        <TouchableOpacity onPress={discardConfirm} style={[styles.btn, styles.btnGhost]}><Text style={[styles.btnTxt,{color:'#0B2239'}]}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary]}><Text style={[styles.btnTxt,{color:'#fff'}]}>Save</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.tip}>Press Save to keep, or Cancel to discard.</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop:{ flex:1, backgroundColor:'rgba(10,16,28,0.45)', alignItems:'center', justifyContent:'center' },
    card:{ width:'84%', borderRadius:18, padding:20, backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:20, elevation:6 },
    title:{ fontSize:16, fontWeight:'700', color:'#0B2239' },
    timerWrap:{ alignItems:'center', marginVertical:22 },
    timer:{ fontSize:34, color:'#0B2239', fontVariant:['tabular-nums'] },
    btnRow:{ flexDirection:'row', gap:12 },
    btn:{ flex:1, paddingVertical:14, borderRadius:14, alignItems:'center', justifyContent:'center' },
    btnGhost:{ backgroundColor:'#EEF2F6' },
    btnPrimary:{ backgroundColor:'#0B2239' },
    btnTxt:{ fontSize:15, fontWeight:'600' },
    tip:{ marginTop:10, textAlign:'center', color:'#7D8794', fontSize:12 },
});
export default RecordingModal;
