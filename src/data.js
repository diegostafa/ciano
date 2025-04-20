import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const protocol = 'http';
const ip = '192.168.4.5';
const port = 3000;

// const fetchBoards = () => axios.get('${protocol}://${ip}:${port}/boards');
const fetchThreads = (boardId) => axios.get(`${protocol}://${ip}:${port}/${boardId}`);
const fetchComments = (boardId, threadId) => axios.get(`${protocol}://${ip}:${port}/${boardId}/thread/${threadId}`);
const createComment = (comment) => {
    return axios.postForm(`${protocol}://${ip}:${port}/create_comment`, {
        data: JSON.stringify(comment),
    });
};

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
    return await getRemote({ key, remote }).catch(console.error);
};

const Repo = {
    threads: {
        set: async (threads) => {
            return setLocal('board', threads);
        },
        getLocal: async (boardId) => {
            return getLocalOrRemote({ key: `board/${boardId}`, remote: () => fetchThreads(boardId) });
        },
        getRemote: async (boardId) => {
            return getRemote({ key: `board/${boardId}`, remote: () => fetchThreads(boardId) });
        },
    },
    comments: {
        getLocal: async (boardId, threadId) => {
            return getLocalOrRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => fetchComments(boardId, threadId) });
        },
        getRemote: async (boardId, threadId) => {
            return getRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => fetchComments(boardId, threadId) });
        },
        create: async (comment) => {
            return createComment(comment);
        },
    },
};

const state = {
    backend: null,
    board: 'a',
    history: [],
    boards: {},
    catalogMode: 'list', // 'list' or 'grid'
    catalogSort: 'new', // 'new' or 'latest' or 'replies'
    catalogCols: 3,
    catalogRows: 4,
    selectedImg: null, // this can be lowered
    themeLight: null,
    themeDark: null,
};

const Prefs = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    clear: async () => AsyncStorage.clear(),
    restore: async () => {
        return {
            backend: getLocal('backend').catch(() => null) || state.backend,
            board: getLocal('board').catch(() => null) || state.board,
            history: getLocal('history').catch(() => null) || state.history,
            boards: getLocal('boards').catch(() => null) || state.boards,
            catalogMode: getLocal('catalogMode').catch(() => null) || state.catalogMode,
            catalogSort: getLocal('catalogSort').catch(() => null) || state.catalogSort,
            catalogCols: getLocal('catalogCols').catch(() => null) || state.catalogCols,
            catalogRows: getLocal('catalogRows').catch(() => null) || state.catalogRows,
            selectedImg: getLocal('selectedImg').catch(() => null) || state.selectedImg,
            themeLight: getLocal('themeLight').catch(() => null) || state.themeLight,
            themeDark: getLocal('themeDark').catch(() => null) || state.themeDark,
        };
    },
};

export { Prefs, Repo };

