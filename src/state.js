import { getLocal, setLocal } from './utils';

const defaultState = {
    board: 'a',
    boards: {},
    history: [],
    myComments: [],
};
export const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (state) => {
        await setLocal('board', state.board);
        await setLocal('history', state.history);
        await setLocal('boards', state.boards);
        await setLocal('myComments', state.myComments);
    },
    restore: async () => {
        return {
            board: await getLocal('board').catch(() => null) || defaultState.board,
            history: await getLocal('history').catch(() => null) || defaultState.history,
            boards: await getLocal('boards').catch(() => null) || defaultState.boards,
            myComments: await getLocal('myComments').catch(() => null) || defaultState.myComments,
        };
    },
};