import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const fetchBoards = () => axios.get('https://a.4cdn.org/boards.json');
const fetchBoard = (boardId) => axios.get(`https://a.4cdn.org/${boardId}/catalog.json`);
const fetchThread = (boardId, threadId) => axios.get(`https://a.4cdn.org/${boardId}/thread/${threadId}.json`);
const fetchArchive = (boardId) => axios.get(`https://a.4cdn.org/${boardId}/archive.json`);

const setLocal = async (key, value) => await AsyncStorage.setItem(key, JSON.stringify(value));
const getLocal = async (key) => await AsyncStorage.getItem(key).then(res => JSON.parse(res));

const getRemote = async ({ key, remote }) => {
    console.log('getRemote');
    const newValue = await remote().then(res => res.data);
    await setLocal(key, newValue);
    return newValue;
};
const getLocalOrRemote = async ({ key, remote }) => {
    console.log('getLocalOrRemote');
    const value = await getLocal(key);
    if (value !== null) {
        return value;
    }
    if (!remote) {
        return null;
    }
    console.log('orRemote');
    const newValue = await getRemote({ key, remote });
    return newValue;
};

const Repo = {
    board: {
        set: async (board) => await setLocal('board', board),
        getLocal: async (boardId) => await getLocalOrRemote({ key: `board/${boardId}`, remote: () => fetchBoard(boardId) }),
        getRemote: async (boardId) => await getRemote({ key: `board/${boardId}`, remote: () => fetchBoard(boardId) }),
    },

    thread: {
        getLocal: async (boardId, threadId) => getLocalOrRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => fetchThread(boardId, threadId) }),
        getRemote: async (boardId, threadId) => getRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => fetchThread(boardId, threadId) }),
    },
};

const state = {
    backend: null,
    board: 'g',
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
    get: async (key) => await getLocal(key),
    set: async (key, value) => await setLocal(key, value),
    clear: async () => await AsyncStorage.clear(),
    restore: async () => {
        return {
            backend: await getLocal('backend').catch(() => null) || state.backend,
            board: await getLocal('board').catch(() => null) || state.board,
            history: await getLocal('history').catch(() => null) || state.history,
            boards: await getLocal('boards').catch(() => null) || state.boards,
            catalogMode: await getLocal('catalogMode').catch(() => null) || state.catalogMode,
            catalogSort: await getLocal('catalogSort').catch(() => null) || state.catalogSort,
            catalogCols: await getLocal('catalogCols').catch(() => null) || state.catalogCols,
            catalogRows: await getLocal('catalogRows').catch(() => null) || state.catalogRows,
            selectedImg: await getLocal('selectedImg').catch(() => null) || state.selectedImg,
            themeLight: await getLocal('themeLight').catch(() => null) || state.themeLight,
            themeDark: await getLocal('themeDark').catch(() => null) || state.themeDark,
        };
    },
};

export { Prefs, Repo };

