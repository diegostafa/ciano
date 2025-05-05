import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Modal, Text, TouchableNativeFeedback, View } from 'react-native';
import HTMLView from 'react-native-htmlview';
import Icon from 'react-native-vector-icons/Ionicons';

import { BOARD_TAB_KEY, CATALOG_KEY } from './app';
import { Config } from './config';
import { DarkHtmlTheme, LightHtmlTheme } from './theme';

// --- functions

export const setLocal = async (key, value) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
};
export const getLocal = async (key) => {
    return AsyncStorage.getItem(key).then(res => JSON.parse(res));
};
export const getRemote = async ({ key, remote }) => {
    const newValue = await remote().catch(console.error);
    await setLocal(key, newValue).catch(console.error);
    return newValue;
};
export const getLocalOrRemote = async ({ key, remote }) => {
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
export const relativeTime = (tstamp) => {
    return formatDistanceToNow(Number(tstamp) * 1000, { addSuffix: true });
};
export const historyAdd = async (state, thread) => {
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
export const getComment = (comments, threadId) => {
    return comments.find(item => item.id === threadId);
};
export const getRepliesTo = (comments, comment) => {
    return comments.filter(item => item.com && item.com.includes("&gt;&gt;" + comment.id));
};
export const quotes = (comment) => {
    if (!comment.com) {
        return [];
    }
    const matches = comment.com.match(/>>\S+/g) || [];
    return matches.map(str => str.slice(2));
}
export const getThreadSignature = (thread) => {
    const board = `<info>/${thread.board}/ - </info>`;
    if (thread.sub) {
        return `${board}<sub>${thread.sub}</sub>`;
    } else {
        return `${board}<com>${thread.com}</com>`;
    }
}
export const currRoute = (state) => {
    const tabRoute = state.routes.find(r => r.name === BOARD_TAB_KEY);
    const stackState = tabRoute?.state;
    const currentRoute = stackState?.routes?.[stackState.index]?.name;
    return currentRoute || CATALOG_KEY;
};

// --- components

export const ThemedIcon = ({ name, size, color }) => {
    const theme = useTheme();
    return <Icon name={name} size={size || 28} color={color || theme.colors.text} />;
};
export const HeaderIcon = ({ name, onPress }) => {
    return <TouchableNativeFeedback onPress={onPress}>
        <View style={{ padding: 10 }}>
            <ThemedIcon name={name} />
        </View>
    </TouchableNativeFeedback>;
};
export const TabIcon = (name) => ({ color }) => {
    return ThemedIcon({ name, size: 24, color });
};
export const Fab = ({ onPress }) => {
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
            backgroundColor: theme.colors.primary,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <ThemedIcon name={'add'} />
        </View>
    </TouchableNativeFeedback>;
};
export const ModalMenu = ({ child, visible, centered }) => {
    return <Modal
        animationType='fade'
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
export const ThemedText = ({ content, style }) => {
    const theme = useTheme();
    return <Text style={{ ...style, color: theme.colors.text }}>{content}</Text>;
};
export const HtmlText = ({ value, onLinkPress }) => {
    const theme = useTheme();
    return <HTMLView
        onLinkPress={onLinkPress}
        value={`<p>${value}</p>`}
        stylesheet={theme.dark ? DarkHtmlTheme : LightHtmlTheme}
    />;
};