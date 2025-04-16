import { Prefs } from './data';

const imgFromComment = (board, tim) => {
    const img = tim ? `https://i.4cdn.org/${board}/${tim}s.jpg` : null;
    return img;
};
const prettyTimestamp = (tstamp) => {
    return tstamp;
};

const historyAdd = async (state, thread) => {
    if (!thread) {
        return state.history;
    }
    const idx = state.history.findIndex(item => item.board === state.board && item.thread.no === thread.no);
    if (idx !== -1) {
        state.history.splice(idx, 1);
    }
    const history = [...state.history, { board: state.board, thread }];
    await Prefs.set('history', history);
    return history;
};

const getThread = (thread, threadId) => {
    return thread.find(item => item.no === threadId);
};

const getRepliesTo = (thread, comment) => {
    return thread.filter(item => item.com.includes(comment.no));
};

export { getRepliesTo, getThread, historyAdd, imgFromComment, prettyTimestamp };


