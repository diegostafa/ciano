import { Repo } from '../data/repo';
import { getLocal, setLocal } from '../utils';

const defaultState = {
    board: null,
    threads: null,
    boards: null,
    activeBoards: [],
    history: [],
    myComments: [],
    threadWatcher: [],

    catalogViewMode: 0,
    catalogSort: 0,
    catalogRev: false,
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
            restored[key] = await getLocal(key).catch(() => null) || defaultValue
        }
        return restored;
    },
};
export const loadThreads = async (state, setState, setTemp, forceRefresh) => {
    setTemp(temp => ({ ...temp, threadsFetchError: false, isFetchingThreads: true }));

    const threads = forceRefresh ?
        await Repo.threads.getRemote(state.board) :
        await Repo.threads.getLocalOrRemote(state.board);

    if (!threads) {
        setTemp(temp => ({ ...temp, threadsFetchError: true, isFetchingThreads: false }));
        return;
    }
    setTemp(temp => ({ ...temp, isFetchingThreads: false }));
    setState({ ...state, threads });
}
export const loadBoards = async (state, setState, setTemp, forceRefresh) => {
    setTemp(temp => ({ ...temp, boardsFetchError: false, isFetchingBoards: true }));

    const boards = forceRefresh ?
        await Repo.boards.getRemote() :
        await Repo.boards.getLocalOrRemote();

    if (!boards) {
        setTemp(temp => ({ ...temp, boardsFetchError: true, isFetchingBoards: false }));
        return;
    }
    setTemp(temp => ({ ...temp, isFetchingBoards: false }));
    setState({ ...state, boards });
};
export const numToMode = {
    0: 'list',
    1: 'grid',
};
export const numToSort = {
    0: 'created',
    1: 'last reply',
    2: 'replies',
};
export const sortThreads = (threads, sortMode, reverse = false) => {
    switch (sortMode) {
        case 0:
            threads.sort((a, b) => b.created_at - a.created_at);
            break;
        case 1:
            threads.sort((a, b) => b.bumped_at - a.bumped_at || b.created_at - a.created_at);
            break;
        case 2: // Most replies
            threads.sort((a, b) => b.replies - a.replies);
            break;
        case 3: // Most images
            threads.sort((a, b) => b.images - a.images);
            break;
        default:
            break;
    }
    return reverse ? threads.reverse() : threads;
};