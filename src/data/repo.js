import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocal, setLocal } from '../utils';

export const Repo = (api) => {
    return {
        clear: async () => {
            return AsyncStorage.clear();
        },
        media: {
            thumb: (comment) => {
                return api.thumb(comment);
            },
            full: (comment) => {
                return api.full(comment);
            }
        },
        boards: {
            getLocalOrRemote: async () => {
                return getLocalOrRemote({ key: `boards`, remote: () => api.getBoards() });
            },
            getRemote: async () => {
                return api.getBoards();
            },
        },
        threads: {
            set: async (threads) => {
                return setLocal('board', threads);
            },
            getLocal: async (boardId) => {
                return getLocal(`board/${boardId}`);
            },
            getLocalOrRemote: async (boardId) => {
                return getLocalOrRemote({ key: `board/${boardId}`, remote: () => api.getThreads(boardId) });
            },
            getRemote: async (boardId) => {
                return getRemote({ key: `board/${boardId}`, remote: () => api.getThreads(boardId) });
            },
        },
        comments: {
            getLocal: async (boardId, threadId) => {
                return getLocal(`board/${boardId}/thread/${threadId}`);
            },
            getLocalOrRemote: async (boardId, threadId) => {
                return getLocalOrRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.getComments(boardId, threadId) });
            },
            getRemote: async (boardId, threadId) => {
                return getRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.getComments(boardId, threadId) });
            },
            create: async (form) => {
                return api.postComment(form);
            },
        },
    }
};

const getRemote = async ({ key, remote }) => {
    const res = await remote();
    await setLocal(key, res);
    return res;
};
const getLocalOrRemote = async ({ key, remote }) => {
    const value = await getLocal(key).catch(() => null);
    if (value !== null) {
        return value;
    }
    if (!remote) {
        return null;
    }
    return await getRemote({ key, remote });
};