import { getLocal, getRepliesTo, isImage, quotes, setLocal } from '../utils';

const defaultState = {
    board: null,
    boards: null,
    activeBoards: [],
    history: [],
    myComments: [],
    watching: [],

    catalogViewMode: 0,

    catalogSort: 0,
    threadSort: 0,

    catalogRev: false,
    threadRev: false,

    showNoConnectionNotice: true,
};
export const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (state) => {
        for (const [key, value] of Object.entries(state)) {
            await setLocal(key, value);
        }
    },
    restore: async () => {
        const restored = {};
        for (const [key, defaultValue] of Object.entries(defaultState)) {
            restored[key] = (await getLocal(key).catch(() => null)) || defaultValue
        }
        return restored;
    },
};
export const catalogModes = [
    'list',
    'grid',
];
export const catalogSorts = [
    {
        name: 'created',
        icon: 'calendar',
        sort: (a, b) => a.created_at - b.created_at
    },
    {
        name: 'last reply',
        icon: 'time',
        sort: (a, b) => b.bumped_at - a.bumped_at || b.created_at - a.created_at
    },
    {
        name: 'replies',
        icon: 'comment',
        sort: (a, b) => b.replies - a.replies
    },
    {
        name: 'images',
        icon: 'image',
        sort: (a, b) => b.images - a.images
    },
];
export const threadSorts = [
    {
        name: 'time',
        icon: 'time',
        sort: () => (a, b) => a.created_at - b.created_at
    },
    {
        name: 'Number of replies',
        icon: 'comment',
        sort: () => (a, b) => b.bumped_at - a.bumped_at || b.created_at - a.created_at
    },
    {
        name: 'Number of replies to you',
        icon: 'comment',
        sort: ({ comments }) => (a, b) => {
            const repliesA = getRepliesTo(comments, a).length;
            const repliesB = getRepliesTo(comments, b).length;
            return repliesB - repliesA;
        }
    },
    {
        name: 'Yours first',
        icon: 'user',
        sort: (state) => (a, b) => {
            const isMineA = state.myComments.includes(a.id) ? 1 : 0;
            const isMineB = state.myComments.includes(b.id) ? 1 : 0;
            return isMineB - isMineA;
        }
    },
    {
        name: 'Replies to you first',
        icon: 'user',
        sort: (state) => (a, b) => {
            const isQuotingMeA = quotes(a).some(id => state.myComments.includes(id)) ? 1 : 0;
            const isQuotingMeB = quotes(b).some(id => state.myComments.includes(id)) ? 1 : 0;
            return isQuotingMeB - isQuotingMeA;
        }
    },
    {
        name: 'Image first',
        icon: 'image',
        sort: () => (a, b) => {
            const hasImgA = isImage(a.media_ext) ? 1 : 0;
            const hasImgB = isImage(b.media_ext) ? 1 : 0;
            return hasImgB - hasImgA;
        }
    },
    {
        name: 'Video first',
        icon: 'film',
        sort: () => (a, b) => {
            const hasVideoA = a.media_ext !== null && !isImage(a.media_ext) ? 1 : 0;
            const hasVideoB = a.media_ext !== null && !isImage(b.media_ext) ? 1 : 0;
            return hasVideoB - hasVideoA;
        }
    },
];