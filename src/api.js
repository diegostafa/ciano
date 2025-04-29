import axios from 'axios';

const blu = `http://192.168.21.97:3000`;
const chan = 'https://a.4cdn.org';

const api = {
    chan: {
        media: (comment) => {
            if (!comment || !comment.media_name) {
                return null;
            }
            return `${blu}/media/${comment.media_name}`;
        },
        getBoards: () => {
            return axios({
                method: 'get',
                url: `${blu}/boards`,
            }).then(res => res.data);
        },
        getThreads: (boardId) => {
            return axios({
                method: 'get',
                url: `${blu}/${boardId}`,
            }).then(res => res.data);
        },
        getComments: (boardId, threadId) => {
            return axios({
                method: 'get',
                url: `${blu}/${boardId}/thread/${threadId}`,
            }).then(res => res.data);
        },
        postComment: (comment) => {
            return axios({
                method: 'post',
                url: `${blu}/create_comment`,
                data: JSON.stringify(comment),
            }).then(res => res.data.ok);
        }
    },
    blu: {
        media: (comment) => {
            if (!comment || !comment.media_name) {
                return null;
            }
            const url = `https://i.4cdn.org/${comment.board}/${comment.media_name}s.jpg`;
            return url;
        },
        getBoards: () => {
            return axios({
                method: 'get',
                url: `${chan}/boards.json`,
            }).then(res => res.data);
        },
        getThreads: (boardId) => {
            return axios({
                method: 'get',
                url: `${chan}/${boardId}/catalog.json`,
            })
                .then(res => res.data.flatMap(page => page.threads).map(thread => {
                    return {
                        id: thread.no,
                        sub: thread.sub,
                        com: thread.com,
                        replies: thread.replies,
                        images: thread.images,
                        op: thread.resto,
                        media_name: thread.tim,
                        board: boardId,
                        created_at: thread.time
                    };
                }));
        },
        getComments: (boardId, threadId) => {
            return axios({
                method: 'get',
                url: `${chan}/${boardId}/thread/${threadId}.json`
            }).then(res => res.data.posts.map(thread => {
                return {
                    id: thread.no,
                    sub: thread.sub,
                    com: thread.com,
                    op: thread.resto,
                    media_name: thread.tim,
                    board: boardId,
                    created_at: thread.time
                };
            }));
        },
    }
};

export { api };
