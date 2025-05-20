import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocal, getLocalOrRemote, getRemote, setLocal } from '../utils';
import { api } from './api';

export const Repo = {
    clear: async () => {
        return AsyncStorage.clear();
    },
    media: {
        thumb: (comment) => {
            return api.blu.thumb(comment);
        },
        full: (comment) => {
            return api.blu.full(comment);
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
            console.log('getLocal', `board/${boardId}/thread/${threadId}`);
            return getLocal(`board/${boardId}/thread/${threadId}`);
        },
        getLocalOrRemote: async (boardId, threadId) => {
            console.log('getLocalOrRemote', `board/${boardId}/thread/${threadId}`);
            return getLocalOrRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.blu.getComments(boardId, threadId) });
        },
        getRemote: async (boardId, threadId) => {
            console.log('getRemote', `board/${boardId}/thread/${threadId}`);
            return getRemote({ key: `board/${boardId}/thread/${threadId}`, remote: () => api.blu.getComments(boardId, threadId) });
        },
        create: async (form) => {
            return api.blu.postComment(form);
        },
    },
    boards: {
        getLocalOrRemote: async () => {
            return getLocalOrRemote({ key: `boards`, remote: () => api.blu.getBoards() });
        },
        getRemote: async () => {
            return api.blu.getBoards();
        },
    }
};

