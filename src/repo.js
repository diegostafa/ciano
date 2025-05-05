import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from './api';
import { getLocal, getLocalOrRemote, getRemote, setLocal } from './utils';

export const Repo = {
    clear: async () => {
        return AsyncStorage.clear();
    },
    media: {
        from: (comment) => {
            return api.blu.media(comment);
        }
    },
    threads: {
        set: async (threads) => {
            return setLocal('board', threads);
        },
        getLocal: async (boardId) => {
            return getLocal(`board/${boardId}`);
        },
        getLocalOrRemote: async (boardId) => {
            return getLocalOrRemote({ key: `board/${boardId}`, remote: () => api.blu.getThreads(boardId) });
        },
        getRemote: async (boardId) => {
            return getRemote({ key: `board/${boardId}`, remote: () => api.blu.getThreads(boardId) });
        },
    },
    comments: {
        getLocal: async (boardId, threadId) => {
            return getLocal(`board/${boardId}/thread/${threadId}`);
        },
        getLocalOrRemote: async (boardId, threadId) => {
            return getLocalOrRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.blu.getComments(boardId, threadId) });
        },
        getRemote: async (boardId, threadId) => {
            return getRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.blu.getComments(boardId, threadId) });
        },
        create: async (form) => {
            return api.blu.postComment(form);
        },
    },
    boards: {
    }
};

