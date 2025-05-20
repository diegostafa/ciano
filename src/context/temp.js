import { Repo } from "../data/repo";

const defaultTemp = {
    threads: null,
    bottomBarWidth: null,
    catalogReflist: null,
    threadReflist: null,
    selectedImageIndex: null,

    setupBoardsFilter: null,
    catalogFilter: null,
    catalogModalActions: false,
    isFetchingBoards: false,
    isFetchingThreads: false,
    isFetchingComments: false,
    boardsFetchError: false,
    threadsFetchError: false,
    noConnection: false,
};

export const Temp = {
    default: () => defaultTemp,
};
export const loadThreads = async (board, setTemp, forceRefresh) => {
    setTemp(prev => ({ ...prev, threadsFetchError: false, isFetchingThreads: true }));

    const threads = forceRefresh ?
        await Repo.threads.getRemote(board) :
        await Repo.threads.getLocalOrRemote(board);


    if (!threads) {
        setTemp(prev => ({ ...prev, threadsFetchError: true, isFetchingThreads: false }));
        return;
    }
    setTemp(prev => ({ ...prev, isFetchingThreads: false, threads }));
}