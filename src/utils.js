import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/Ionicons';

import { Config } from './config';



const setLocal = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));
const getLocal = async (key) => AsyncStorage.getItem(key).then(res => JSON.parse(res));
const getRemote = async ({ key, remote }) => {
    const newValue = await remote().then(res => res.data).catch(console.error);
    await setLocal(key, newValue).catch(console.error);
    return newValue;
};
const getLocalOrRemote = async ({ key, remote }) => {
    const value = await getLocal(key).catch(console.error);
    if (value !== null) {
        return value;
    }
    if (!remote) {
        return null;
    }
    const newValue = await remote().then(res => res.data).catch(console.error);
    await setLocal(key, newValue).catch(console.error);
    return newValue;
};
const prettyTimestamp = (tstamp) => {
    return tstamp;
};
const historyAdd = async (state, thread) => {
    if (!thread) {
        return state.history;
    }
    const idx = state.history.findIndex(item => item.board === state.board && item.thread.id === thread.id);
    if (idx !== -1) {
        state.history.splice(idx, 1);
    }
    const history = [...state.history, { board: state.board, thread }];
    await Config.set('history', history);
    return history;
};
const getThread = (thread, threadId) => {
    return thread.find(item => item.id === threadId);
};
const getRepliesTo = (thread, comment) => {
    return thread.filter(item => item.com.includes(comment.id));
};
const HeaderIcon = ({ name, onPress }) => {
    return <Pressable onPress={onPress}>
        <View style={{ padding: 10 }}>
            <Icon name={name} size={28} />
        </View>
    </Pressable>;
};
const Fab = ({ isShowing, setIsShowing }) => {
    return <FloatingAction
        showBackground={false}
        visible={isShowing}
        onPressMain={() => { setIsShowing(false); }}
    />;
}
// todo spawn it near the tap
const ModalMenu = ({ child, visible, centered }) => {
    return <Modal
        animationType="fade"
        transparent
        visible={visible}>
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
                style={{
                    width: '90%',
                    backgroundColor: 'rgb(255, 255, 255)',
                    justifyContent: 'space-evenly',
                }}>
                {child}
            </View>
        </View>
    </Modal>;
};

export {
    Fab,
    getLocal,
    getLocalOrRemote,
    getRemote,
    getRepliesTo,
    getThread,
    HeaderIcon,
    historyAdd,
    ModalMenu,
    prettyTimestamp,
    setLocal
};


