import { Repo } from './repo';
import { getLocal, setLocal } from './utils';

export const defaultFlags = {
    boardsSetupSearch: false,
    catalogSearch: false,
    catalogModalActions: false,

    isFetchingBoards: false,
    isFetchingThreads: false,
    isFetchingComments: false,

    boardsFetchError: false,
    threadsFetchError: false,
};

const defaultState = {
    board: null,
    threads: null,
    boards: null,
    activeBoards: [],
    history: [],
    myComments: [],
};
export const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (state) => {
        await setLocal('board', state.board);
        await setLocal('boards', state.boards);
        await setLocal('threads', state.threads);
        await setLocal('activeBoards', state.activeBoards);
        await setLocal('history', state.history);
        await setLocal('myComments', state.myComments);
    },
    restore: async () => {
        return {
            board: await getLocal('board').catch(() => null) || defaultState.board,
            boards: await getLocal('boards').catch(() => null) || defaultState.boards,
            threads: await getLocal('threads').catch(() => null) || defaultState.threads,
            activeBoards: await getLocal('activeBoards').catch(() => null) || defaultState.activeBoards,
            history: await getLocal('history').catch(() => null) || defaultState.history,
            myComments: await getLocal('myComments').catch(() => null) || defaultState.myComments,
        };
    },
};

export const loadThreads = async (state, setState, setFlags, forceRefresh) => {
    setFlags(flags => ({ ...flags, threadsFetchError: false, isFetchingThreads: true }));

    const threads = forceRefresh ?
        await Repo.threads.getRemote(state.board) :
        await Repo.threads.getLocalOrRemote(state.board);

    if (!threads) {
        setFlags(flags => ({ ...flags, threadsFetchError: true, isFetchingThreads: false }));
        return;
    }
    setFlags(flags => ({ ...flags, isFetchingThreads: false }));
    setState({ ...state, threads });
}
export const loadBoards = async (state, setState, setFlags, forceRefresh) => {
    setFlags(flags => ({ ...flags, boardsFetchError: false, isFetchingBoards: true }));

    const boards = forceRefresh ?
        await Repo.boards.getRemote() :
        await Repo.boards.getLocalOrRemote();

    if (!boards) {
        setFlags(flags => ({ ...flags, boardsFetchError: true, isFetchingBoards: false }));
        return;
    }
    setFlags(flags => ({ ...flags, isFetchingBoards: false }));
    setState({ ...state, boards });
};
