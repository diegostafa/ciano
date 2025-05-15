/* eslint-disable react/react-in-jsx-scope */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
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
export const arraysDiffer = (a, b) => {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return true;
    }
    return false;
};
export const sortThreads = (threads, sortMode, reverse = false) => {
    let sorted = [...threads];
    switch (sortMode) {
        case 0:
            sorted.sort((a, b) => b.created_at - a.created_at);
            break;
        case 1:
            sorted.sort((a, b) => b.bumped_at - a.bumped_at || b.created_at - a.created_at);
            break;
        case 2: // Most replies
            sorted.sort((a, b) => b.replies - a.replies);
            break;
        case 3: // Most images
            sorted.sort((a, b) => b.images - a.images);
            break;
        default:
            break;
    }
    return reverse ? sorted.reverse() : sorted;
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
export const Fab = ({ onPress, child }) => {
    const theme = useTheme();
    const size = 52;

    return <TouchableNativeFeedback onPress={onPress}>
        <View style={{
            position: 'absolute',
            bottom: 36,
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
            {child || <ThemedIcon name={'add'} />}
        </View>
    </TouchableNativeFeedback>;
};
export const ModalView = ({ content, visible, onClose }) => {
    const theme = useTheme();
    return <Modal
        animationType='fade'
        transparent
        visible={visible}
        onRequestClose={onClose}>
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View style={{
                width: '90%',
                borderRadius: 10,
                backgroundColor: theme.colors.card,
                justifyContent: 'space-evenly',
                overflow: 'hidden'
            }}>
                {content}
            </View>
        </View>
    </Modal >;
};
export const ModalAlert = ({ msg, visible, cancel, confirm, onClose, onCancel, onConfirm }) => {
    const btnStyle = { padding: 10, flex: 1, alignItems: 'center' };

    return <ModalView
        visible={visible}
        onClose={onClose}
        content={
            <View>
                <View style={{ padding: 15 }} >
                    <ThemedText content={msg} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableNativeFeedback onPress={onCancel}>
                        <View style={btnStyle}>
                            <ThemedText content={cancel} />
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback onPress={onConfirm}>
                        <View style={btnStyle}>
                            <ThemedText content={confirm} />
                        </View>
                    </TouchableNativeFeedback>

                </View>
            </View>
        }
    />
}
// content is an array of pairs [name, action]
export const ModalMenu = ({ visible, onClose, items }) => {
    const btnStyle = { padding: 15 };
    return <ModalView
        visible={visible}
        onClose={onClose}
        content={
            <View>
                {items.map(([value, action]) => {
                    return <TouchableNativeFeedback key={value} onPress={action}>
                        <View style={btnStyle}>
                            <ThemedText content={value} />
                        </View>
                    </TouchableNativeFeedback>
                })}
            </View>
        }
    />
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
