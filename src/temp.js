const defaultTemp = {
    catalogReflist: null,
    threadReflist: null,

    selectedImageIndex: null,
    boardsSetupSearch: false,
    catalogSearch: false,
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