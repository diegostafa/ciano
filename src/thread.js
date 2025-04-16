/* eslint-disable react-native/no-inline-styles */

import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Text, TouchableHighlight, useWindowDimensions, View } from 'react-native';
import HTMLView from 'react-native-htmlview';

import { Ctx } from './app';
import { Repo } from './data';
import { getRepliesTo, imgFromComment } from './utils';

const ThreadHeader = () => {
    const { state } = React.useContext(Ctx);
    const currThread = state.history.at(-1).thread;

    return <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            overflow: 'hidden',
        }} >
        <Marquee>
            <HTMLView value={`/${state.board}/ - ${currThread.sub || currThread.com}`} />
        </Marquee>
    </View>;
};
const Thread = () => {
    const { state } = React.useContext(Ctx);
    const currThread = state.history.at(-1).thread;
    const [fullThread, setFullThread] = React.useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const { width } = useWindowDimensions();
    const tw = width;

    React.useEffect(() => {
        if (!fullThread) {
            async function fetch() {
                const value = await Repo.thread.getRemote(state.board, currThread.no);
                setFullThread(value);
            }
            fetch();
        }
    }, [currThread.no, state.board, fullThread, setFullThread]);

    if (!fullThread) {
        return <View>
            <CommentTile state={state} posts={[]} post={currThread} tw={tw} />
            <ActivityIndicator />
            <ThreadStats thread={currThread} />
        </View>;
    }

    return <View>
        <CommentList posts={fullThread.posts} setFullThread={setFullThread} state={state} currThread={currThread} refreshing={refreshing} setRefreshing={setRefreshing} tw={tw} />
        <ThreadStats thread={fullThread.posts[0]} />
    </View>;
};

const CommentList = ({ posts, setFullThread, state, currThread, refreshing, setRefreshing, tw }) => {
    const [replies, setReplies] = React.useState([]);

    return <View><FlatList
        data={posts}
        renderItem={({ item }) => <CommentTile state={state} posts={posts} post={item} tw={tw} setReplies={setReplies} />}
        keyExtractor={(item) => item.no}
        onRefresh={async () => {
            setRefreshing(true);
            const value = await Repo.thread.getRemote(state.board, currThread.no);
            setFullThread(value);
            setRefreshing(false);
        }}
        refreshing={refreshing}
    />
        <Modal
            visible={replies.length > 0}
            animationType="fade"
            onRequestClose={() => setReplies([])}
        >
            <View style={{
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                elevation: 5,
            }}>
                <CommentList posts={replies} setFullThread={setFullThread} state={state} currThread={currThread} refreshing={refreshing} setRefreshing={setRefreshing} tw={tw} />
            </View>
        </Modal >
    </View >
        ;
};

const ThreadStats = ({ thread }) => {
    return <View>
        <View><Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TODO: THREAD INFO</Text></View>
        <View><Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TODO: RELOAD BUTTON</Text></View>
    </View>;
};
const CommentTile = ({ state, posts, post, tw, setReplies }) => {
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

    const img = imgFromComment(state.board, post.tim);
    const thumbWidth = tw / 4;

    console.log('posts', posts);
    console.log('post', post);
    let replies = getRepliesTo(posts, post);

    return <View style={COMMENT_STYLE}>
        <View style={{ flexDirection: 'row' }}>
            {img && <CommentThumbnail src={img} w={thumbWidth} h={thumbWidth} />}
            <View>

                <Text>Anonymous, On: Date</Text>
                <Text>Filesize</Text>
                {post.sub && <HTMLView value={`<b>${post.sub}</b>`} />}
            </View>
        </View>
        {post.com && <HTMLView value={post.com} />}
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

export { Thread, ThreadHeader };
