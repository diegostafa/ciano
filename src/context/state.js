import { api } from '../data/api';
import { getLocal, getRepliesTo, isImage, quotes, setLocal } from '../helpers';

const defaultState = {
    board: null,
    boards: null,
    activeBoards: [],
    history: [],
    myComments: [],
    watching: [], // [{thread, last, unread, replies}]
    catalogViewMode: 0,
    catalogSort: 0,
    threadSort: 0,
    catalogRev: false,
    threadRev: false,
    showNoConnectionNotice: true,
    api: api.ciano,
};
export const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (state) => {
        await setLocal(`${state.api.name}/board`, state.board);
        await setLocal(`${state.api.name}/boards`, state.boards);
        await setLocal(`${state.api.name}/activeBoards`, state.activeBoards);
        await setLocal(`${state.api.name}/history`, state.history);
        await setLocal(`${state.api.name}/myComments`, state.myComments);
        await setLocal(`${state.api.name}/watching`, state.watching);
        await setLocal(`catalogViewMode`, state.catalogViewMode);
        await setLocal(`catalogSort`, state.catalogSort);
        await setLocal(`threadSort`, state.threadSort);
        await setLocal(`catalogRev`, state.catalogRev);
        await setLocal(`threadRev`, state.threadRev);
        await setLocal(`showNoConnectionNotice`, state.showNoConnectionNotice);
    },
    restore: async (fromApi) => {
        let restored = {};
        const tempApi = fromApi !== undefined ? fromApi : (await getLocal('api').catch(() => null)) || defaultState.api;
        restored.board = (await getLocal(`${tempApi.name}/board`).catch(() => null)) || defaultState.board;
        restored.boards = (await getLocal(`${tempApi.name}/boards`).catch(() => null)) || defaultState.boards;
        restored.activeBoards = (await getLocal(`${tempApi.name}/activeBoards`).catch(() => null)) || defaultState.activeBoards;
        restored.history = (await getLocal(`${tempApi.name}/history`).catch(() => null)) || defaultState.history;
        restored.myComments = (await getLocal(`${tempApi.name}/myComments`).catch(() => null)) || defaultState.myComments;
        restored.watching = (await getLocal(`${tempApi.name}/watching`).catch(() => null)) || defaultState.watching;
        restored.catalogViewMode = (await getLocal(`catalogViewMode`).catch(() => null)) || defaultState.catalogViewMode;
        restored.catalogSort = (await getLocal(`catalogSort`).catch(() => null)) || defaultState.catalogSort;
        restored.threadSort = (await getLocal(`threadSort`).catch(() => null)) || defaultState.threadSort;
        restored.catalogRev = (await getLocal(`catalogRev`).catch(() => null)) || defaultState.catalogRev;
        restored.threadRev = (await getLocal(`threadRev`).catch(() => null)) || defaultState.threadRev;
        restored.showNoConnectionNotice = (await getLocal(`showNoConnectionNotice`).catch(() => null)) || defaultState.showNoConnectionNotice;
        restored.api = tempApi;
        return restored;
    },
    default: () => defaultState
};
export const catalogModes = [
    'list',
    'grid',
];
export const catalogSorts = [
    {
        name: 'created',
        icon: 'calendar',
        sort: (a, b) => {
            return a.created_at - b.created_at;
        }
    },
    {
        name: 'last reply',
        icon: 'time',
        sort: (a, b) => {
            return b.bumped_at - a.bumped_at || b.created_at - a.created_at;
        }
    },
    {
        name: 'replies',
        icon: 'chatbubbles',
        sort: (a, b) => {
            return b.replies - a.replies;
        }
    },
    {
        name: 'images',
        icon: 'image',
        sort: (a, b) => {
            return b.images - a.images;
        }
    },
];
export const threadSorts = [
    {
        name: 'time',
        icon: 'time',
        sort: () => (a, b) => {
            return a.created_at - b.created_at;
        }
    },
    {
        name: 'Number of replies',
        icon: 'chatbubbles',
        sort: ({ comments }) => (a, b) => {
            const repliesA = getRepliesTo(comments, a).length;
            const repliesB = getRepliesTo(comments, b).length;
            return repliesB - repliesA;
        }
    },
    {
        name: 'Replies to you first',
        icon: 'at',
        sort: ({ state }) => (a, b) => {
            const isQuotingMeA = quotes(a).some(id => state.myComments.includes(id)) ? 1 : 0;
            const isQuotingMeB = quotes(b).some(id => state.myComments.includes(id)) ? 1 : 0;
            return isQuotingMeB - isQuotingMeA;
        }
    },
    {
        name: 'Your comments first',
        icon: 'person',
        sort: (state) => (a, b) => {
            const isMineA = state.myComments.includes(a.id) ? 1 : 0;
            const isMineB = state.myComments.includes(b.id) ? 1 : 0;
            return isMineB - isMineA;
        }
    },
    {
        name: 'Images first',
        icon: 'image',
        sort: () => (a, b) => {
            const hasImgA = isImage(a.media_ext) ? 1 : 0;
            const hasImgB = isImage(b.media_ext) ? 1 : 0;
            return hasImgB - hasImgA;
        }
    },
    {
        name: 'Videos first',
        icon: 'film',
        sort: () => (a, b) => {
            const hasVideoA = a.media_ext !== null && !isImage(a.media_ext) ? 1 : 0;
            const hasVideoB = a.media_ext !== null && !isImage(b.media_ext) ? 1 : 0;
            return hasVideoB - hasVideoA;
        }
    },
];
export const setStateAndSave = async (setState, key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
    await State.set(key, value);
};
