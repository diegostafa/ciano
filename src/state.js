import { getLocal, setLocal } from "./utils";


const defaultState = {
    board: 'a',
    history: [],
    boards: {},
    myComments: [],
};
const State = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    restore: async () => {
        return {
            board: await getLocal('board').catch(() => null) || defaultState.board,
            history: await getLocal('history').catch(() => null) || defaultState.history,
            boards: await getLocal('boards').catch(() => null) || defaultState.boards,
            myComments: await getLocal('myComments').catch(() => null) || defaultState.myComments,
        };
    },
};

export { State };
