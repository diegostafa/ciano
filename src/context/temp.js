const defaultTemp = {
    isComputingThreads: false,
    isComputingComments: false,

    connType: 'none',
    viewLocal: false,

    thread: null,
    threads: null,
    comments: null,
    selectedMediaComment: null,
    selectedLocalMedia: null,
    commentsBoard: null,

    catalogReflist: null,
    threadReflist: null,
    setupBoardsReflist: null,

    catalogFilter: null,
    setupBoardsFilter: null,
    threadFilter: null,

    mediaDownloadError: null,
    mediaDownloadSuccess: null,

    isFetchingBoards: false,
    isFetchingThreads: false,
    isFetchingComments: false,
    isUploadingComment: false,

    uploadCommentErrorTimeout: null,
    uploadCommentErrorRequest: null,
    uploadCommentErrorResponse: null,
    uploadCommentErrorUnknown: null,

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

    formMediaError: null,
    formNameError: null,
    formComError: null,
    formSubError: null,
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
export const hasFormErrors = (temp) => {
    return temp.formMediaError !== null ||
        temp.formNameError !== null ||
        temp.formComError !== null ||
        temp.formSubError !== null;
};
export const isOnline = (temp) => {
    return temp.connType !== 'none';
};
export const Temp = {
    default: () => defaultTemp,
};
