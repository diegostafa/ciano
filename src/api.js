import axios from 'axios';

const blu = `http://192.168.21.97:3000`;
const chan = 'https://a.4cdn.org';

const api = {
    blu: {
        media: (comment) => {
            const url = comment && comment.media_name ? `${blu}/media/${comment.media_name}` : null;
            return url;
        },
        getBoards: () => {
            return axios({
                method: 'get',
                url: `${blu}/boards`,
            });
        },
        getThreads: (boardId) => {
            return axios({
                method: 'get',
                url: `${blu}/${boardId}`,
            });
        },
        getComments: (boardId, threadId) => {
            return axios({
                method: 'get',
                url: `${blu}/${boardId}/thread/${threadId}`,
            });
        },
        postComment: (comment) => {
            return axios({
                method: 'post',
                url: `${blu}/create_comment`,
                data: JSON.stringify(comment),
            }).then(res => res.ok);
        }
    },
    chan: {
        getBoards: () => { `${chan}/boards.json` },
        getThreads: (boardId) => { `${chan}/${boardId}/catalog.json` },
        getComments: (boardId, threadId) => { `${chan}/${boardId}/${threadId}.json` },
    }
};

export { api };
