import { catalogSorts, threadSorts } from "../context/state";
import { Repo } from "./repo";

export const loadBoards = async (conf, state, setState, setTemp, forceRefresh) => {
    setTemp(prev => ({
        ...prev,
        boardsFetchErrorTimeout: false,
        boardsFetchErrorResponse: false,
        boardsFetchErrorRequest: false,
        boardsFetchErrorUnknown: false,
        isFetchingBoards: true,
    }));

    try {
        const boards = forceRefresh ?
            await Repo(conf.api).boards.getRemote() :
            await Repo(conf.api).boards.getLocalOrRemote();

        setTemp(prev => ({ ...prev, isFetchingBoards: false }));
        setState({ ...state, boards });
    }
    catch (err) {
        if (err.code === 'ECONNABORTED') {
            setTemp(prev => ({ ...prev, boardsFetchErrorTimeout: true }));
        }
        else if (err.response) {
            setTemp(prev => ({ ...prev, boardsFetchErrorResponse: true }));
        }
        else if (err.request) {
            setTemp(prev => ({ ...prev, boardsFetchErrorRequest: true }));
        }
        else {
            setTemp(prev => ({ ...prev, boardsFetchErrorUnknown: true }));
        }
        setTemp(prev => ({ ...prev, isFetchingBoards: false }));
    }

};
export const loadThreads = async (conf, state, setTemp, forceRefresh) => {
    const board = state.board;
    setTemp(prev => ({
        ...prev,
        threadsFetchErrorTimeout: false,
        threadsFetchErrorResponse: false,
        threadsFetchErrorRequest: false,
        threadsFetchErrorUnknown: false,
        isFetchingThreads: true,
    }));

    try {
        let threads = forceRefresh ?
            await Repo(conf.api).threads.getRemote(board) :
            await Repo(conf.api).threads.getLocalOrRemote(board);

        const sort = catalogSorts[state.catalogSort].sort;
        threads = threads.sort((a, b) => sort(a, b) * (state.catalogRev ? -1 : 1));
        setTemp(prev => ({ ...prev, isFetchingThreads: false, threads }));
    }
    catch (err) {
        if (err.code === 'ECONNABORTED') {
            setTemp(prev => ({ ...prev, threadsFetchErrorTimeout: true }));
        }
        else if (err.response) {
            setTemp(prev => ({ ...prev, threadsFetchErrorResponse: true }));
        }
        else if (err.request) {
            setTemp(prev => ({ ...prev, threadsFetchErrorRequest: true }));
        }
        else {
            setTemp(prev => ({ ...prev, threadsFetchErrorUnknown: true }));
        }
        setTemp(prev => ({ ...prev, isFetchingThreads: false }));
    }
}
export const loadComments = async (conf, state, setTemp, refresh) => {
    setTemp(prev => ({
        ...prev,
        commentsFetchErrorTimeout: false,
        commentsFetchErrorResponse: false,
        commentsFetchErrorRequest: false,
        commentsFetchErrorUnknown: false,
        isFetchingComments: true,
    }));

    try {
        const thread = state.history.at(-1).thread;
        const data = refresh ?
            await Repo(conf.api).comments.getRemote(thread.board, thread.id) :
            await Repo(conf.api).comments.getLocalOrRemote(thread.board, thread.id);

        let comments = data;
        const sort = threadSorts[state.threadSort].sort;
        const head = comments[0]; // do not sort OP
        const tail = comments.slice(1).sort((a, b) => sort({ state, comments })(a, b) * (state.threadRev ? -1 : 1));
        comments = [head, ...tail];
        setTemp(prev => ({ ...prev, isFetchingComments: false, comments, commentsBoard: thread.id }));
    }
    catch (err) {
        if (err.code === 'ECONNABORTED') {
            setTemp(prev => ({ ...prev, commmentsFetchErrorTimeout: true }));
        }
        else if (err.response) {
            setTemp(prev => ({ ...prev, commmentsFetchErrorResponse: true }));
        }
        else if (err.request) {
            setTemp(prev => ({ ...prev, commmentsFetchErrorRequest: true }));
        }
        else {
            setTemp(prev => ({ ...prev, commmentsFetchErrorUnknown: true }));
        }
        setTemp(prev => ({ ...prev, isFetchingComments: false }));
    }



};