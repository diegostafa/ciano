import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Modal, Text, TouchableNativeFeedback, View } from 'react-native';
import HTMLView from 'react-native-htmlview';
import Icon from 'react-native-vector-icons/Ionicons';

import { Config } from './config';
import { DarkHtmlTheme, LightHtmlTheme } from './theme';

const setLocal = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));
const getLocal = async (key) => AsyncStorage.getItem(key).then(res => JSON.parse(res));
const getRemote = async ({ key, remote }) => {
    const newValue = await remote().catch(console.error);
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
    const newValue = await remote().catch(console.error);
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
const getThread = (comments, threadId) => {
    return comments.find(item => item.id === threadId);
};
const getRepliesTo = (comments, comment) => {
    return comments.filter(item => item.com && item.com.includes(comment.id));
};
const ThemedIcon = ({ name, size }) => {
    const theme = useTheme();
    return <Icon name={name} size={size || 28} color={theme.colors.text} />;
};
const HeaderIcon = ({ name, onPress }) => {
    return <TouchableNativeFeedback onPress={onPress}>
        <View style={{ padding: 10 }}>
            <ThemedIcon name={name} />
        </View>
    </TouchableNativeFeedback>;
};
const Fab = ({ onPress }) => {
    const theme = useTheme();
    const size = 52;

    return <TouchableNativeFeedback onPress={onPress}>
        <View style={{
            position: 'absolute',
            bottom: 48,
            right: 32,
            zIndex: 1,
            height: size,
            width: size,
            borderRadius: '50%',
            backgroundColor: theme.colors.secondary,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <ThemedIcon name={"add"} />
        </View>
    </TouchableNativeFeedback>;
};
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
                    justifyContent: 'space-evenly',
                }}>
                {child}
            </View>
        </View>
    </Modal>;
};
const ThemedText = ({ content, style }) => {
    const theme = useTheme();
    return <Text style={{ ...style, color: theme.colors.text }}>{content}</Text>;
}

const HtmlTextRendered = (node, index, siblings, parent, defaultRenderer) => {
    const next = siblings[index + 1];

    if (node.name === 'br') {
        if (next.name === 'br') {
            return undefined;
        } else {
            return null
        }
    }
};
const HtmlText = ({ value, renderNode }) => {
    const theme = useTheme();

    return <HTMLView
        onLinkPress={() => { }}
        renderNode={renderNode || HtmlTextRendered}
        addLineBreaks={false}
        value={`<p>${value}</p>`}
        stylesheet={theme.dark ? DarkHtmlTheme : LightHtmlTheme}
    />;
};

export {
    Fab,
    getLocal,
    getLocalOrRemote, getRemote,
    getRepliesTo,
    getThread,
    HeaderIcon,
    historyAdd, HtmlText, ModalMenu,
    prettyTimestamp,
    setLocal, ThemedIcon, ThemedText
};


