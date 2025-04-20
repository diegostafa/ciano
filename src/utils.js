import { Prefs } from './data';

const protocol = 'http';
const ip = '192.168.4.5';
const port = 3000;

const imgFromComment = (com) => {
    const img = com ? `${protocol}://${ip}:${port}/media/${com.media_name}` : null;
    return img;
};
const prettyTimestamp = (tstamp) => {
    return tstamp;
};

const historyAdd = async (state, thread) => {
    if (!thread) {
        return state.history;
    }
    const idx = state.history.findIndex(item => item.board === state.board && item.thread.id === thread.id);
    if (idx !== -1) {
        state.history.splice(idx, 1);
    }
    const history = [...state.history, { board: state.board, thread }];
    await Prefs.set('history', history);
    return history;
};

const getThread = (thread, threadId) => {
    return thread.find(item => item.id === threadId);
};

const getRepliesTo = (thread, comment) => {
    return thread.filter(item => item.com.includes(comment.id));
};

export { getRepliesTo, getThread, historyAdd, imgFromComment, prettyTimestamp };


