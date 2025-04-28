import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import HTMLView from 'react-native-htmlview';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';

import { api } from './api';
import { Ctx } from './app';
import { Repo } from './repo';
import { getRepliesTo, HeaderIcon } from './utils';

const ThreadHeaderLeft = () => {
    return <HeaderIcon name="arrow-back" onPress={() => {
        // FIXME: can't pop the stack from the header rooted in bottom nav bar
    }} />;
};
const ThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <Marquee
        speed={0.3}
        spacing={100}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        <HTMLView value={`/${state.board}/ - ${thread.sub || thread.com}`} />
    </Marquee>;
};
const ThreadHeaderRight = () => {
    return <View style={{ backgroundColor: 'white', flexDirection: 'row' }}>
        <HeaderIcon name="information-circle" onPress={() => {
            // show thread info
        }} />
        <HeaderIcon name="ellipsis-vertical" />
    </View>;
};
const loadThread = async (setComments, thread) => {
    const value = await Repo.comments.getLocalOrRemote(thread.board, thread.id);
    setComments(value);
};
const refreshThread = async (setComments, thread) => {
    const value = await Repo.comments.getRemote(thread.board, thread.id);
    setComments(value);
};
const Thread = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    // const [refreshTimeout, setRefreshTimeout] = React.useState(state.refreshTimeout);
    const [comments, setComments] = React.useState(null);
    const [createComment, setCreateComment] = React.useState(false);
    const [formData, setFormData] = React.useState(null);
    const [showCommentMenu, setShowCommentMenu] = React.useState(null);
    const [replies, setReplies] = React.useState([]);
    const { width, height } = useWindowDimensions();
    const tw = width;

    React.useEffect(() => { if (!comments) { loadThread(setComments, thread); } }, [comments, setComments, thread]);


    if (comments === null) {
        return <View style={{ flex: 1 }}>
            <CommentTile comments={[]} comment={thread} tw={tw} />
            <ActivityIndicator />
            <Text>FETCHING COMMENTS</Text>
            <ActivityIndicator />
            <ThreadStats />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        <CommentList setReplies={setReplies} setShowCommentMenu={setShowCommentMenu} comments={comments} setComments={setComments} tw={tw} />
        <CreateCommentFab createComment={createComment} setCreateComment={setCreateComment} />
        <CommentMenu showCommentMenu={showCommentMenu} setShowCommentMenu={setShowCommentMenu} />
        {createComment && <CreateCommentForm height={height} setCreateComment={setCreateComment} formData={formData} setFormData={setFormData} />}
        <Modal
            visible={replies.length > 0}
            transparent
            onRequestClose={() => setReplies([])}>
            <Pressable
                onPress={() => setReplies([])}
            >

                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <CommentList comments={replies} setComments={setComments} tw={tw} />
                </View>

            </Pressable>
        </Modal >

    </View>;
};
const NoComments = () => {
    return <View>
        <Text>TODO: NO COMMENTS</Text>
    </View>;
};
const HiddenItem = ({ data }) => {
    return <View style={{ flex: 1, backgroundColor: 'lightblue', flexDirection: 'row-reverse' }}>
        <Icon name="return-down-back" size={20} color="black" />
    </View>;

};
const CommentList = ({ comments, setComments, tw, setShowCommentMenu, setReplies }) => {
    const { state, config } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    if (config.swipeToReply) {
        return <View><SwipeListView
            data={comments}
            renderItem={({ item, index }) => <CommentTile setShowCommentMenu={setShowCommentMenu} idx={index + 1} comments={comments} comment={item} tw={tw} setReplies={setReplies} />}
            renderHiddenItem={(data) => <HiddenItem data={data} />}
            disableRightSwipe
            keyExtractor={(item) => item.id}
            onRefresh={async () => { await refreshThread(setComments, thread); }}
            refreshing={comments === null}
            ListEmptyComponent={<NoComments />} />
        </View >;
    }
    return <View><FlatList
        data={comments}
        renderItem={({ item, index }) => <CommentTile setShowCommentMenu={setShowCommentMenu} idx={index + 1} comments={comments} comment={item} tw={tw} setReplies={setReplies} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => { await refreshThread(setComments, thread); }}
        refreshing={comments === null}
        ListEmptyComponent={<NoComments />} />
    </View >;
};
const CommentTile = ({ setShowCommentMenu, idx, comments, comment, tw, setReplies }) => {
    const { state, config } = React.useContext(Ctx);
    const COMMENT_STYLE = {
        paddingBottom: 4,
        paddingTop: 4,
        paddingLeft: 8,
        paddingRight: 8,
        flexDirection: 'column',
        backgroundColor: '#eeeeee',
        borderBottomColor: '#ccc',
        borderBottomWidth: 4,
    };

    const MY_COMMENT_STYLE = {};
    const STYLE = state.myComments.includes(comment.id) ? MY_COMMENT_STYLE : COMMENT_STYLE;
    const img = api.blu.media(comment);
    const thumbWidth = tw / 4;
    const replies = getRepliesTo(comments, comment);
    const alias = comment.alias || config.alias;


    return <Pressable
        onLongPress={() => { setShowCommentMenu(comment); }}>
        <View style={STYLE}>
            <View style={{ flexDirection: 'row' }}>
                {img && <CommentThumbnail src={img} w={thumbWidth} h={thumbWidth} />}
                <View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <View><Text>{alias} #{idx}, No. {comment.id}</Text></View>
                        <Text>, Sent: {comment.created_at}</Text>
                    </View>
                    <Text>Filesize</Text>
                    {comment.sub && <HTMLView value={`<b>${comment.sub}</b>`} />}
                </View>
            </View>
            {comment.com && <HTMLView value={comment.com} />}
            {replies.length > 0 &&
                <Pressable onPress={() => { setReplies(replies); }}>
                    <View><Text>Replies: {replies.length}</Text></View>
                </Pressable>
            }
        </View>
    </Pressable>;

};
const CommentThumbnail = ({ src, w, h }) => {
    return <Pressable underlayColor="#fff">
        <Image src={src} style={{ width: w, height: h }} />
    </Pressable>;
};
const CreateCommentFab = ({ createComment, setCreateComment }) => {
    return <FloatingAction
        showBackground={false}
        visible={!createComment}
        onPressMain={() => { setCreateComment(true); }}
    />;
};
const CreateCommentForm = ({ formData, setFormData, setCreateComment }) => {
    const { state, setState } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <View style={{
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        backgroundColor: '#2d2d2d'
    }}>
        <TextInput
            placeholder="Name (Optional)"
            onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        <TextInput
            placeholder="Comment (max 2000 chars)"
            multiline
            onChangeText={(text) => setFormData({ ...formData, com: text })}
        />
        <Button title="send" onPress={async () => {
            const data = { ...formData, op: thread.id };
            const id = await Repo.comments.create(data);
            setState({ ...state, myComments: [...state.myComments, id] })
            setCreateComment(false);
            // await refreshThread(setComments, thread);
        }} />
    </View>;

};
const ThreadStats = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    return <View><Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Replies: {thread.replies}, Images: {thread.images}</Text></View>;
};
// const ThreadRefreshInfo = () => {
//     const { config } = React.useContext(Ctx);
//     if (config.refreshTimeout) {
//         return <View />;
//     }
//     return <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Automatically refreshing in {config.refreshTimeout}s</Text>;

// };
const CommentMenu = ({ showCommentMenu, setShowCommentMenu }) => {
    return <Modal
        animationType="fade"
        transparent
        visible={showCommentMenu !== null}
        onRequestClose={() => { setShowCommentMenu(null); }}>
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
                style={{
                    width: '90%',
                    backgroundColor: 'rgb(255, 255, 255)',
                    justifyContent: 'space-evenly',
                }}>
                <Pressable onPress={() => {
                    setShowCommentMenu(null);

                }}><Text style={{ fontSize: 18, margin: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>Quote</Text></Pressable>
                <Pressable onPress={() => {
                    setShowCommentMenu(null);

                }}><Text style={{ fontSize: 18, margin: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>Quote text</Text></Pressable>
                <Pressable onPress={() => {
                    setShowCommentMenu(null);

                }}><Text style={{ fontSize: 18, margin: 10 }}>Copy</Text></Pressable>
            </View>
        </View>
    </Modal>;
};
export { Thread, ThreadHeaderLeft, ThreadHeaderRight, ThreadHeaderTitle };
