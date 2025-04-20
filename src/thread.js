/* eslint-disable react-native/no-inline-styles */

import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Text, TextInput, TouchableHighlight, useWindowDimensions, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import HTMLView from 'react-native-htmlview';

import { Ctx } from './app';
import { Repo } from './data';
import { getRepliesTo, imgFromComment } from './utils';

const ThreadHeaderLeft = () => {
    return <View>
        <Text>TODO: GO BACK</Text>
    </View>;
};
const ThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <View
        style={{ flex: 1, overflow: 'hidden' }}
    >
        <Marquee speed={1} spacing={10}>
            <HTMLView value={`/${state.board}/ - ${thread.sub || thread.com}`} />
        </Marquee>
    </View>;
};
const ThreadHeaderRight = () => {
    return <View>
        <Text>TODO: OPTIONS</Text>
    </View>;
};
const Thread = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const [comments, setComments] = React.useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const [createComment, setCreateComment] = React.useState(false);
    const [formData, setFormData] = React.useState(null);
    const { width } = useWindowDimensions();
    const tw = width;

    React.useEffect(() => {
        if (!comments) {
            async function fetch() {
                const value = await Repo.comments.getRemote(state.board, thread.id);
                setComments(value);
            }
            fetch();
        }
    }, [thread.id, state.board, comments, setComments]);

    if (comments === null) {
        return <View style={{ flex: 1 }}>
            <CommentTile comments={[]} comment={thread} tw={tw} />
            <Text>FETCHING COMMENTS</Text>
            <ActivityIndicator />
            <ThreadStats thread={thread} />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        <CommentList comments={comments} setComments={setComments} state={state} thread={thread} refreshing={refreshing} setRefreshing={setRefreshing} tw={tw} />
        <ThreadStats thread={thread} />
        <CreateCommentButton createComment={createComment} setCreateComment={setCreateComment} />
        <Modal visible={createComment} onRequestClose={() => { setCreateComment(false); }}>
            <CreateCommentForm thread={thread} setCreateComment={setCreateComment} formData={formData} setFormData={setFormData} />
        </Modal>
    </View>;
};
const CommentList = ({ comments, setComments, state, thread, refreshing, setRefreshing, tw }) => {
    const [replies, setReplies] = React.useState([]);

    return <View><FlatList
        data={comments}
        renderItem={({ item }) => <CommentTile comments={comments} comment={item} tw={tw} setReplies={setReplies} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => {
            setRefreshing(true);
            const value = await Repo.comments.getRemote(state.board, thread.id);
            setComments(value);
            setRefreshing(false);
        }}
        refreshing={refreshing}
    />
        <Modal
            visible={replies.length > 0}
            animationType="fade"
            onRequestClose={() => setReplies([])}>
            <View style={{
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                elevation: 5,
            }}>
                <CommentList comments={replies} setComments={setComments} state={state} thread={thread} refreshing={refreshing} setRefreshing={setRefreshing} tw={tw} />
            </View>
        </Modal >
    </View >
        ;
};
const CommentTile = ({ comments, comment, tw, setReplies }) => {
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

    const img = imgFromComment(comment);
    const thumbWidth = tw / 4;
    let replies = getRepliesTo(comments, comment);

    return <View style={COMMENT_STYLE}>
        <View style={{ flexDirection: 'row' }}>
            {img && <CommentThumbnail src={img} w={thumbWidth} h={thumbWidth} />}
            <View>
                <Text>Anonymous, On: {comment.created_at}</Text>
                <Text>Filesize</Text>
                {comment.sub && <HTMLView value={`<b>${comment.sub}</b>`} />}
            </View>
        </View>
        {comment.com && <HTMLView value={comment.com} />}
        {replies.length > 0 &&
            <TouchableHighlight
                onPress={() => {
                    setReplies(replies);
                }}
                underlayColor="#fff">
                <View>
                    <Text>Replies: {replies.length}</Text>
                </View>
            </TouchableHighlight>
        }
    </View>;
};
const CommentThumbnail = ({ src, w, h }) => {
    return <TouchableHighlight underlayColor="#fff">
        <Image src={src} style={{ width: w, height: h }} />
    </TouchableHighlight>;
};
const CreateCommentButton = ({ createComment, setCreateComment }) => {
    return <FloatingAction
        showBackground={false}
        visible={!createComment}
        onPressMain={() => { setCreateComment(true); }}
    />;
};
const CreateCommentForm = ({ thread, setCreateComment, formData, setFormData }) => {
    return <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}>
        <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
        }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Create a Thread</Text>
            <TextInput
                placeholder="Content"
                style={{ height: 80, borderColor: '#ddd', borderWidth: 1, marginBottom: 10, paddingLeft: 10, textAlignVertical: 'top' }}
                multiline
                onChangeText={(text) => setFormData({ ...formData, com: text })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => { setCreateComment(false); }} />
                <Button title="Submit" onPress={async () => {
                    const data = { ...formData, op: thread.id };
                    console.log('creating comment', data);
                    await Repo.comments.create(data).catch(console.error);
                    setCreateComment(false);
                }} />
            </View>
        </View>
    </View>;
};
const ThreadStats = ({ thread }) => {
    return <View>
        <View><Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TODO: THREAD INFO</Text></View>
        <View><Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TODO: RELOAD BUTTON</Text></View>
    </View>;
};

export { Thread, ThreadHeaderLeft, ThreadHeaderRight, ThreadHeaderTitle };

