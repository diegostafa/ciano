import { getLocal, setLocal } from './utils';

const defaultState = {
    board: null,
    boards: null,
    selectedBoards: [],
    history: [],
    myComments: [],
};
export const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (state) => {
        await setLocal('board', state.board);
        await setLocal('boards', state.boards);
        await setLocal('selectedBoards', state.selectedBoards);
        await setLocal('history', state.history);
        await setLocal('myComments', state.myComments);
    },
    restore: async () => {
        return {
            board: await getLocal('board').catch(() => null) || defaultState.board,
            boards: await getLocal('boards').catch(() => null) || defaultState.boards,
            selectedBoards: await getLocal('selectedBoards').catch(() => null) || defaultState.selectedBoards,
            history: await getLocal('history').catch(() => null) || defaultState.history,
            myComments: await getLocal('myComments').catch(() => null) || defaultState.myComments,
        };
    },
};