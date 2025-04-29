import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, TextInput, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';

import { Ctx } from './app';
import { Repo } from './repo';
import { Fab, getRepliesTo, HeaderIcon, HtmlText, ThemedText } from './utils';

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
        <HtmlText value={`/${state.board}/ - ${thread.sub || thread.com}`} />
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
            <ThemedText content={"FETCHING COMMENTS"} />
            <ActivityIndicator />
            <ThreadStats />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        <CommentList setReplies={setReplies} setShowCommentMenu={setShowCommentMenu} comments={comments} setComments={setComments} tw={tw} />
        {!createComment && <Fab onPress={() => { setCreateComment(true) }} />}
        <CommentMenu showCommentMenu={showCommentMenu} setShowCommentMenu={setShowCommentMenu} />
        {createComment && <CreateCommentForm height={height} setCreateComment={setCreateComment} formData={formData} setFormData={setFormData} />}
        <Modal
            visible={replies.length > 0}
            transparent
            onRequestClose={() => setReplies([])}>
            <TouchableNativeFeedback onPress={() => setReplies([])} >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <CommentList comments={replies} setComments={setComments} tw={tw} />
                </View>

            </TouchableNativeFeedback>
        </Modal >

    </View>;
};
const NoComments = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const tw = useWindowDimensions().width;

    return <View>
        <CommentTile comments={[]} comment={thread} tw={tw} />
        <ThemedText content={"TODO: THERE ARE NO COMMENTS"} />
    </View>;
};
const HiddenItem = ({ data }) => {
    return <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
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
    const commentStyle = {
        padding: 8,
        flexDirection: 'column',
        borderBottomWidth: 2,
    };
    const myCommentStyle = {};
    const img = Repo.media.from(comment);
    const thumbWidth = tw / 4;
    const replies = getRepliesTo(comments, comment);
    const reply = replies.length === 1 ? 'reply' : 'replies';
    const alias = comment.alias || config.alias;

    return <Pressable
        onLongPress={() => { setShowCommentMenu(comment); }}>
        <View style={state.myComments.includes(comment.id) ? myCommentStyle : commentStyle}>
            <View style={{ flexDirection: 'row' }}>
                {img && <CommentThumbnail src={img} w={thumbWidth} h={thumbWidth} />}
                <View style={{ flex: 1 }}>
                    {comment.sub && <HtmlText value={`<b>${comment.sub}</b>`} />}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <HtmlText value={`<name>${alias}</name><info>, ${comment.created_at}</info>`} />
                        <HtmlText value={`<info>No. ${comment.id}</info>`} />
                    </View>
                    {img &&
                        <View>
                            <HtmlText value={`<info>filename</info>`} />
                            <HtmlText value={`<info>filesize</info>`} />
                        </View>
                    }
                </View>
            </View>

            <View style={{ marginTop: 8 }}>
                {comment.com && <HtmlText value={comment.com} />}
            </View>

            {replies.length > 0 &&
                <TouchableNativeFeedback
                    onPress={() => { setReplies(replies); }}>
                    <View style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: 4,
                        marginTop: 8,
                        paddingLeft: 0,
                    }}>
                        <HtmlText value={`<replies>View ${replies.length} ${reply}</replies>`} />
                    </View>
                </TouchableNativeFeedback>
            }
        </View>
    </Pressable>;

};
const CommentThumbnail = ({ src, w, h }) => {
    return <TouchableNativeFeedback underlayColor="#fff">
        <Image src={src} style={{ width: w, height: h, marginRight: 8 }} />
    </TouchableNativeFeedback>;
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
    return <View>
        <ThemedText content={`Replies: ${thread.replies}, Images: ${thread.images}`} style={{ fontWeight: 'bold', textAlign: 'center' }} />
    </View>;
};
// const ThreadRefreshInfo = () => {
//     const { config } = React.useContext(Ctx);
//     if (config.refreshTimeout) {
//         return <View />;
//     }
//     return <ThemedText content={``} style={{ fontWeight: 'bold', textAlign: 'center' }}>Automatically refreshing in {config.refreshTimeout}s;

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
                <TouchableNativeFeedback onPress={() => setShowCommentMenu(null)}>
                    <ThemedText content={`Quote`} style={{ fontSize: 18, margin: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }} />
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={() => setShowCommentMenu(null)}>
                    <ThemedText content={`Quote text`} style={{ fontSize: 18, margin: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }} />
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={() => setShowCommentMenu(null)}>
                    <ThemedText content={`Copy`} style={{ fontSize: 18, margin: 10 }} />
                </TouchableNativeFeedback>
            </View>
        </View>
    </Modal >;
};
export { Thread, ThreadHeaderLeft, ThreadHeaderRight, ThreadHeaderTitle };
