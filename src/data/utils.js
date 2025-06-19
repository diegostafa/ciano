import { catalogSorts, threadSorts } from "../context/state";
import { quotes } from "../helpers";
import { Repo } from "./repo";

export const loadBoards = async (state, setState, setTemp, forceRefresh) => {
    setTemp(prev => ({
        ...prev,
        boardsFetchErrorTimeout: null,
        boardsFetchErrorResponse: null,
        boardsFetchErrorRequest: null,
        boardsFetchErrorUnknown: null,
        isFetchingBoards: true,
    }));

    try {
        const boards = forceRefresh ?
            await Repo(state.api).boards.getRemote() :
            await Repo(state.api).boards.getLocalOrRemote();

        setState({ ...state, boards });
    }
    catch (err) {
        console.log(err);
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
    }
    setTemp(prev => ({ ...prev, isFetchingBoards: false }));
};
export const loadThreads = async (state, setTemp, forceRefresh) => {
    const board = state.board;
    setTemp(prev => ({
        ...prev,
        threadsFetchErrorTimeout: null,
        threadsFetchErrorResponse: null,
        threadsFetchErrorRequest: null,
        threadsFetchErrorUnknown: null,
        isFetchingThreads: true,
    }));

    try {
        let threads = forceRefresh ?
            await Repo(state.api).threads.getRemote(board) :
            await Repo(state.api).threads.getLocalOrRemote(board);
        const sort = catalogSorts[state.catalogSort].sort;
        threads = threads.sort((a, b) => sort(a, b) * (state.catalogRev ? -1 : 1));
        setTemp(prev => ({ ...prev, threads }));
    }
    catch (err) {
        console.log(err);
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
    }
    setTemp(prev => ({ ...prev, isFetchingThreads: false }));
}
export const loadComments = async (state, setTemp, refresh) => {
    setTemp(prev => ({
        ...prev,
        commentsFetchErrorTimeout: null,
        commentsFetchErrorResponse: null,
        commentsFetchErrorRequest: null,
        commentsFetchErrorUnknown: null,
        isFetchingComments: true,
    }));

    try {
        const thread = state.history.at(-1);
        const data = refresh ?
            await Repo(state.api).comments.getRemote(thread.board, thread.id) :
            await Repo(state.api).comments.getLocalOrRemote(thread.board, thread.id);

        let comments = data;
        // don't sort op
        if (comments.lenght > 0) {
            const sort = threadSorts[state.threadSort].sort;
            const head = comments[0];
            const tail = comments.slice(1).sort((a, b) => sort({ state, comments })(a, b) * (state.threadRev ? -1 : 1));
            comments = [head, ...tail];
        }
        setTemp(prev => ({ ...prev, comments, commentsBoard: thread.id }));
    }
    catch (err) {
        console.log(err);
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
    }
    setTemp(prev => ({ ...prev, isFetchingComments: false }));
};
export const uploadComment = async (state, setState, setTemp, data) => {
    setTemp(prev => ({
        ...prev,
        uploadCommentErrorTimeout: null,
        uploadCommentErrorResponse: null,
        uploadCommentErrorRequest: null,
        uploadCommentErrorUnknown: null,
        isUploadingComment: true,
    }));


    try {
        const comment = await Repo(state.api).comments.create(data.form, data.form);
        setState(prev => ({ ...prev, myComments: [...prev.myComments, comment.id] }))
    }
    catch (err) {
        console.log(err);
        if (err.code === 'ECONNABORTED') {
            setTemp(prev => ({ ...prev, uploadCommentErrorTimeout: true }));
        }
        else if (err.response) {
            setTemp(prev => ({ ...prev, uploadCommentErrorResponse: true }));
        }
        else if (err.request) {
            setTemp(prev => ({ ...prev, uploadCommentErrorRequest: true }));
        }
        else {
            setTemp(prev => ({ ...prev, uploadCommentErrorUnknown: true }));
        }
    }

    setTemp(prev => ({ ...prev, isUploadingComment: false }));
};
export const updateWatcher = async (state, setState) => {
    const newWatching = state.watching.map(async watched => {
        const newComments = await Repo(state.api).comments.getRemote(watched.boardId, watched.threadId);
        const diff = newComments.slice(watched.last);
        const you = newComments.filter(com => quotes(com).some(id => state.myComments.includes(id)));
        return {
            ...watched,
            new: diff.length,
            you: you.length,
        };
    });
    setState(prev => ({ ...prev, watching: newWatching }));
}