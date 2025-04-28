import { api } from './api';
import { getLocal, getLocalOrRemote, getRemote, setLocal } from './utils';

const Repo = {
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
        create: async (comment) => {
            return api.blu.postComment(comment);
        },
    },
};

export { Repo };

