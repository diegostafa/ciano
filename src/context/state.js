import { getLocal, getRepliesTo, isImage, quotes, setLocal } from '../helpers';

const defaultState = {
    board: null,
    boards: null,
    activeBoards: [],
    history: [],
    myComments: [],
    watching: [], // [{thread, new, you}]
    catalogViewMode: 0,
    catalogSort: 0,
    threadSort: 0,
    catalogRev: false,
    threadRev: false,
    showNoConnectionNotice: true,
    api: null,
};
const needApi = ['board', 'boards', 'activeBoards', 'history', 'myComments', 'watching'];

export const State = {
    save: async (state) => {
        for (const [key, value] of Object.entries(state)) {
            if (needApi.includes(key)) {
                await setLocal(`${state.api.name}/${key}`, value)
            }
            else {
                await setLocal(key, value)
            }
        }
    },
    restore: async (api) => {
        let restored = {};
        for (const [key, defaultValue] of Object.entries(defaultState)) {
            if (needApi.includes(key)) {
                restored[key] = (await getLocal(`${api.name}/${key}`).catch(() => null)) ?? defaultValue;
            }
            else {
                restored[key] = (await getLocal(key).catch(() => null)) ?? defaultValue;
            }
        }
        restored.api = api;
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
            return (b.bumped_at - a.bumped_at) || (b.created_at - a.created_at);
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
            const hasVideoB = b.media_ext !== null && !isImage(b.media_ext) ? 1 : 0;
            return hasVideoB - hasVideoA;
        }
    },
];
export const setStateAndSave = async (state, setState, key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
    if (needApi.includes(key)) {
        await setLocal(`${state.api.name}/${key}`, value)
    }
    else {
        await setLocal(key, value)
    }
};
export const totNew = (state) => {
    let count = 0;
    state.watching.forEach(watched => { count += watched.new; });
    return count;
};
export const totYou = (state) => {
    let count = 0;
    state.watching.forEach(watched => { count += watched.you; });
    return count;
};