const defaultTemp = {
    connType: "none",
    viewLocal: false,

    thread: null,
    threads: null,
    comments: null,
    selectedMediaComment: null,
    commentsBoard: null,

    catalogReflist: null,
    threadReflist: null,

    catalogFilter: null,
    setupBoardsFilter: null,

    mediaDownloadError: null,
    mediaDownloadSuccess: null,

    isFetchingBoards: false,
    isFetchingThreads: false,
    isFetchingComments: false,

    boardsFetchErrorTimeout: null,
    boardsFetchErrorRequest: null,
    boardsFetchErrorResponse: null,
    boardsFetchErrorUnknown: null,

    threadsFetchErrorTimeout: null,
    threadsFetchErrorRequest: null,
    threadsFetchErrorResponse: null,
    threadsFetchErrorUnknown: null,

    commentsFetchErrorTimeout: null,
    commentsFetchErrorRequest: null,
    commentsFetchErrorResponse: null,
    commentsFetchErrorUnknown: null,
};
export const hasBoardsErrors = (temp) => {
    return temp.boardsFetchErrorTimeout !== null ||
        temp.boardsFetchErrorRequest !== null ||
        temp.boardsFetchErrorResponse !== null ||
        temp.boardsFetchErrorUnknown !== null;
};
export const hasThreadsErrors = (temp) => {
    return temp.threadsFetchErrorTimeout !== null ||
        temp.threadsFetchErrorRequest !== null ||
        temp.threadsFetchErrorResponse !== null ||
        temp.threadsFetchErrorUnknown !== null;
};
export const hasCommentsErrors = (temp) => {
    return temp.commentsFetchErrorTimeout !== null ||
        temp.commentsFetchErrorRequest !== null ||
        temp.commentsFetchErrorResponse !== null ||
        temp.commentsFetchErrorUnknown !== null;
};
export const isOffline = (temp) => {
    return temp.connType === "none";
};

export const Temp = {
    default: () => defaultTemp,
};
