import { Repo } from "../data/repo";
import { catalogSorts, threadSorts } from "./state";

const defaultTemp = {
    noConnection: false,

    thread: null,
    threads: null,
    comments: null,
    selectedMediaComment: null,
    commentsBoard: null,


    catalogReflist: null,
    threadReflist: null,

    catalogFilter: null,
    setupBoardsFilter: null,

    isFetchingBoards: false,
    isFetchingThreads: false,
    isFetchingComments: false,

    boardsFetchError: null,
    threadsFetchError: null,
    commentsFetchError: null,

};

export const Temp = {
    default: () => defaultTemp,
};
export const loadThreads = async (state, setTemp, forceRefresh) => {
    const board = state.board;
    setTemp(prev => ({ ...prev, threadsFetchError: false, isFetchingThreads: true }));

    let threads = forceRefresh ?
        await Repo.threads.getRemote(board) :
        await Repo.threads.getLocalOrRemote(board);


    if (!threads) {
        setTemp(prev => ({ ...prev, threadsFetchError: true, isFetchingThreads: false }));
        return;
    }

    const sort = catalogSorts[state.catalogSort].sort;
    threads = threads.sort((a, b) => sort(a, b) * (state.catalogRev ? -1 : 1));
    setTemp(prev => ({ ...prev, isFetchingThreads: false, threads }));
}

export const loadComments = async (state, setTemp, refresh) => {
    const thread = state.history.at(-1).thread;
    console.log('loadComments', thread);

    setTemp(prev => ({ ...prev, isFetchingComments: true }));

    let comments = refresh ?
        await Repo.comments.getRemote(thread.board, thread.id) :
        await Repo.comments.getLocalOrRemote(thread.board, thread.id);

    if (!comments) {
        setTemp(prev => ({ ...prev, commentsFetchError: true, isFetchingCommments: false }));
        return;
    }
    const sort = threadSorts[state.threadSort].sort;
    const head = comments[0]; // do not sort OP
    const tail = comments.slice(1).sort((a, b) => sort({ state, comments })(a, b) * (state.threadRev ? -1 : 1));
    comments = [head, ...tail];
    console.log('loadComments', comments);


    setTemp(prev => ({ ...prev, isFetchingComments: false, comments, commentsBoard: thread.id }));
};