import axios from 'axios';

const blu = `http://192.168.4.5:3000`;
const chan = 'https://a.4cdn.org';

export const api = {
    ciano: {
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
        postComment: (form) => {
            const multipart = new FormData();
            const data = form.data;
            const media = form.media;

            if (!data.com && !media) {
                return null;
            }
            if (data.com) {
                multipart.append('data', JSON.stringify(data));
            }
            if (media) {
                multipart.append('media', "@" + media.path);
            }
            return axios({
                method: 'post',
                url: `${blu}/create_comment`,
                headers: { 'Content-Type': 'multipart/form-data' },
                data: multipart,
            }).then(res => res.data.Ok);
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
            }).then(res => res.data.boards.map(board => {
                return {
                    code: board.board,
                    name: board.title,
                    desc: board.meta_description,
                    max_threads: null,
                    max_replies: null,
                    max_img_replies: board.image_limit,
                    max_sub_len: board.max_comment_chars,
                    max_com_len: board.max_comment_chars,
                    max_file_size: board.max_file_size,
                    is_nsfw: board.ws_board === 1,
                    created_at: null,
                };
            }));
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

