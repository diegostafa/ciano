import axios from 'axios';
import RNBlobUtil from 'react-native-blob-util';

const BLU_SERVER = `http://192.168.78.97:3000`;
const CHAN_SERVER = 'https://a.4cdn.org';
const TIMEOUT = 8000;

export const api = {
    ciano: {
        name: 'ciano',
        thumb: (comment) => {
            if (!comment || !comment.thumb_name) {
                return null;
            }
            return `${BLU_SERVER}/media/${comment.thumb_name}`;
        },
        full: (comment) => {
            if (!comment || !comment.media_name) {
                return null;
            }
            return `${BLU_SERVER}/media/${comment.media_name}`;
        },
        getBoards: async () => {
            const data = await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${BLU_SERVER}/boards`,
            })
                .then(res => res.data);

            if ('Err' in data) {
                throw new Error(data.Err);
            }
            return data.Ok;
        },
        getThreads: async (boardId) => {
            const data = await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${BLU_SERVER}/${boardId}`,
            })
                .then(res => res.data);
            if ('Err' in data) {
                throw new Error(data.Err);
            }
            return data.Ok;
        },
        getComments: async (boardId, threadId) => {
            const data = await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${BLU_SERVER}/${boardId}/thread/${threadId}`,
            })
                .then(res => res.data);
            if ('Err' in data) {
                throw new Error(data.Err);
            }
            return data.Ok;
        },

        postComment: async (form, media) => {
            const multipartData = [];

            multipartData.push({
                name: 'data',
                data: JSON.stringify(form)
            });
            if (media !== null) {
                multipartData.push({
                    name: 'media',
                    filename: media.path.split('/').pop(),
                    data: RNBlobUtil.wrap(media.path)
                });
            }


            const response = await RNBlobUtil.fetch(
                'POST',
                `${BLU_SERVER}/create_comment`,
                { 'Content-Type': 'multipart/form-data' },
                multipartData
            );
            const data = await response.json();
            if ('Err' in data) {
                throw new Error(data.Err);
            }
            return data.Ok;
        }

    },
    chan: {
        name: '4chan',
        thumb: (comment) => {
            if (!comment || !comment.media_name) {
                return null;
            }
            const url = `https://i.4cdn.org/${comment.board}/${comment.media_name}s.jpg`;
            return url;
        },
        full: (comment) => {
            if (!comment || !comment.media_name) {
                return null;
            }
            const url = `https://i.4cdn.org/${comment.board}/${comment.media_name}.${comment.media_ext}`;
            return url;
        },
        getBoards: async () => {
            return await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${CHAN_SERVER}/boards.json`,
            })
                .then(res => res.data.boards
                    .map(board => {
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
                            is_nsfw: board.ws_board === 0,
                            created_at: null,
                        };
                    })
                    .filter(board => !board.is_nsfw)
                );
        },
        getThreads: async (boardId) => {
            return await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${CHAN_SERVER}/${boardId}/catalog.json`,
            })
                .then(res => res.data.flatMap(page => page.threads).map(thread => {
                    return {
                        id: thread.no,
                        sub: thread.sub,
                        com: thread.com,
                        replies: thread.replies,
                        images: thread.images,
                        op: thread.resto,
                        file_name: thread.filename,
                        media_name: thread.tim,
                        media_size: thread.fsize,
                        media_ext: thread.ext ? thread.ext.slice(1) : null,
                        board: boardId,
                        created_at: thread.time,
                        media_desc: null,
                    };
                }));
        },
        getComments: async (boardId, threadId) => {
            return await axios({
                method: 'get',
                timeout: TIMEOUT,
                url: `${CHAN_SERVER}/${boardId}/thread/${threadId}.json`
            })
                .then(res => res.data.posts.map(comment => {
                    return {
                        id: comment.no,
                        alias: comment.alias || 'Anonymous',
                        sub: comment.sub,
                        com: comment.com,
                        op: comment.resto,
                        file_name: comment.filename,
                        media_name: comment.tim,
                        media_size: comment.fsize,
                        media_ext: comment.ext ? comment.ext.slice(1) : null,
                        board: boardId,
                        created_at: comment.time,
                        media_desc: null,
                    };
                }));
        },
    }
};

