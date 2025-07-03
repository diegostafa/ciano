import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import { decode } from 'he';
import RNBlobUtil from 'react-native-blob-util';

import { BOARD_NAV_KEY, CATALOG_KEY } from './app';
import { setStateAndSave } from './context/state';
import { Repo } from './data/repo';

export const stripHtml = (str) => {
    return str.replace(/<[^>]*>/g, '');
};
export const commentContains = (comment, filter) => {
    const lowerFilter = filter.toLowerCase();
    return (comment.com && comment.com.toLowerCase().includes(lowerFilter)) ||
        (comment.file_name && comment.file_name.toLowerCase().includes(lowerFilter)) ||
        (comment.media_desc && comment.media_desc.toLowerCase().includes(lowerFilter));
};
export const threadContains = (thread, filter) => {
    const lowerFilter = filter.toLowerCase();
    return (thread.sub && thread.sub.toLowerCase().includes(lowerFilter)) ||
        (thread.com && thread.com.toLowerCase().includes(lowerFilter));
};
export const firstSplitAt = (text, needle) => {
    const index = text.indexOf(needle);
    return index !== -1 ? text.substring(0, index) : text;
};
export const setLocal = async (key, value) => {
    return await AsyncStorage.setItem(key, JSON.stringify(value));
};
export const getLocal = async (key) => {
    return await AsyncStorage.getItem(key).then(res => JSON.parse(res));
};
export const relativeTime = (tstamp) => {
    return formatDistanceToNow(Number(tstamp) * 1000, { addSuffix: true });
};
export const historyAdd = async (state, setState, item) => {
    if (!item) {
        return state.history;
    }
    const others = state.history.filter(i => i.id !== item.id);
    await setStateAndSave(setState, 'history', [...others, item]);
};
export const watcherAdd = async (state, setState, item) => {
    if (!item) {
        return state.history;
    }
    if (state.watching.some(i => i.thread.id === item.thread.id)) {
        return;
    }
    await setStateAndSave(setState, 'watching', [...state.watching, item]);
};
export const watcherReset = async (state, setState, id) => {
    await setStateAndSave(setState, 'watching', state.watching.map(i =>
        i.thread.id === id ? { ...i, new: 0, you: 0 } : i
    ));
};
export const getComment = (comments, threadId) => {
    return comments.find(item => item.id === threadId);
};
export const getRepliesTo = (comments, comment) => {
    return comments.filter(item => item.com && item.com.includes('&gt;&gt;' + comment.id));
};
export const quotes = (comment) => {
    if (!comment.com) {
        return [];
    }
    const matches = comment.com.match(/&gt;&gt;\d+/g) || [];
    return matches.map(match => Number(match.slice(8)));
};
export const getThreadHistorySignature = (thread) => {
    const content = decode(stripHtml((thread.sub || thread.com)));
    const board = `/${thread.board}/`;
    return board + ' - ' + content;
};
export const getThreadSignature = (thread) => {
    const board = `<info>/${thread.board}/ - </info>`;
    let text = thread.sub ? `${board}<sub>${thread.sub}</sub>` : `${board}<com>${thread.com}</com>`;
    text = firstSplitAt(text, '<br>');
    text = firstSplitAt(text, '\n');
    return text;
};
export const getThreadHeaderSignature = (thread) => {
    let text = thread.sub ? `/${thread.board}/ - ${thread.sub}` : `/${thread.board}/ - ${thread.com}`;
    text = firstSplitAt(text, '<br>');
    text = firstSplitAt(text, '\n');
    return text;
};
export const currRoute = (state) => {
    const tabRoute = state.routes.find(r => r.name === BOARD_NAV_KEY);
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
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const isImage = (ext) => {
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png';
};
export const isGif = (ext) => {
    return ext === 'gif';
};
export const isVideo = (ext) => {
    return ext === 'mp4' || ext === 'webm';
};
export const getCurrFullBoard = (state) => {
    if (!state.boards) {
        return null;
    }
    return state.boards.find(item => item.code === state.board);
};
export const downloadMedia = async (setTemp, state, comment) => {
    try {
        const url = Repo(state.api).media.full(comment);
        const saveDir = RNBlobUtil.fs.dirs.DownloadDir;
        const savepath = `${saveDir}/${comment.file_name}.${comment.media_ext}`;
        const result = await RNBlobUtil.config({
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                path: savepath,
                description: `Downloading ${comment.file_name}.${comment.media_ext}`,
            },
        }).fetch('GET', url);
        if (result.statusCode === 200) {
            setTemp(prev => ({
                ...prev,
                mediaDownloadSuccess: true,
            }));
        }
        else {
            setTemp(prev => ({
                ...prev,
                mediaDownloadError: 'Returned status code ' + result.statusCode,
            }));
        }
    } catch (error) {
        setTemp(prev => ({
            ...prev,
            mediaDownloadError: 'Returned error: ' + error,
        }));
    }
};
export const getImageAsset = (theme, name) => {
    const images = {
        light: {
            fullLogo: require('../assets/light/full-logo.png'),
            error: require('../assets/light/error.png'),
            placeholder: require('../assets/light/placeholder.png'),
        },
        dark: {
            fullLogo: require('../assets/dark/full-logo.png'),
            error: require('../assets/dark/error.png'),
            placeholder: require('../assets/dark/placeholder.png'),
        },
    };
    return images[theme]?.[name] || null;
};
