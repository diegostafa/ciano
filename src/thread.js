import { Marquee } from '@animatereactnative/marquee';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, Linking, Modal, Pressable, TextInput, TouchableHighlight, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx } from './app';
import { Repo } from './repo';
import { Fab, getRepliesTo, HeaderIcon, HtmlText, quotes, relativeTime, ThemedIcon, ThemedText } from './utils';

// --- public

export const ThreadHeaderLeft = () => {
    return <HeaderIcon name='arrow-back' onPress={() => {
        // FIXME: can't pop the stack from the header rooted in bottom nav bar
    }} />;
};
export const ThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <Marquee
        speed={0.3}
        spacing={100}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        <ThemedText content={`/${thread.board}/ - ${thread.sub || thread.com}`} />
    </Marquee>;
};
export const ThreadHeaderRight = () => {
    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name='information-circle' onPress={() => {
            // show thread info
        }} />
        <HeaderIcon name='ellipsis-vertical' />
    </View>;
};
export const Thread = () => {
    const { state, config } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const thread = state.history.at(-1).thread;
    const [allComments, setAllComments] = React.useState(null);
    const [selectedComment, setSelectedComment] = React.useState(null);
    const [repliesStack, setRepliesStack] = React.useState([]);
    const [createComment, setCreateComment] = React.useState(false);
    const [highlightedComment, setHighlightedComment] = React.useState(null);
    const [lastComment, setLastComment] = React.useState(null);
    const [autoRefreshTimer, setAutoRefreshTimer] = React.useState(null);
    const refList = useRef(null);
    const [quoteList, setQuoteList] = React.useState([]);
    // const [refreshTimeout, setRefreshTimeout] = React.useState(state.refreshTimeout);


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (createComment) {
                    setCreateComment(false);
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [createComment])
    );


    React.useEffect(() => {
        if (!allComments) {
            loadThread(setAllComments, thread);
        }
    }, [allComments, setAllComments, thread]);

    React.useEffect(() => {
        if (!autoRefreshTimer) {
            const timer = setTimeout(() => {
                updateThread(allComments, setAllComments, setLastComment, thread);
                setAutoRefreshTimer(null);
            }, config.refreshTimeout * 1000);
            setAutoRefreshTimer(timer);
        }
    }, [allComments, autoRefreshTimer, config.refreshTimeout, thread]);

    React.useEffect(() => {
        if (highlightedComment) {
            setTimeout(() => setHighlightedComment(null), 3000);
        }
    }, [highlightedComment]);

    if (allComments === null) {
        return <View style={{ flex: 1 }}>
            <CommentTile allComments={[]} comment={thread} tw={width} />
            <ActivityIndicator />
            <ThemedText content={'FETCHING COMMENTS'} />
            <ActivityIndicator />
            <ThreadStats />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        <CommentList
            ref={refList}
            allComments={allComments} setAllComments={setAllComments}
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            highlightedComment={highlightedComment}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
            lastComment={lastComment}
            quoteList={quoteList}
        />

        <RepliesModal
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            allComments={allComments} setSelectedComment={setSelectedComment} refList={refList}
            setHighlightedComment={setHighlightedComment}
        />

        <CommentMenu
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
            quoteList={quoteList} setQuoteList={setQuoteList}
        />

        {createComment ?
            <CreateCommentForm setCreateComment={setCreateComment} setAllComments={setAllComments} /> :
            <Fab onPress={() => {
                // todo: check if the thread has reached max replies
                setCreateComment(true)
            }} />}
    </View>;
};

// --- sub components

const RepliesModal = ({ repliesStack, setRepliesStack, allComments, setSelectedComment, setHighlightedComment, refList }) => {
    const currReplies = repliesStack.at(-1);
    const theme = useTheme();
    const width = useWindowDimensions().width - 50;

    return <Modal
        visible={repliesStack.length > 0}
        transparent
        onRequestClose={() => setRepliesStack(repliesStack.slice(0, -1))}
        onBackdropPress={() => setRepliesStack(repliesStack.slice(0, -1))}>
        <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View
                style={{
                    width: width,
                    maxHeight: '70%',
                    backgroundColor: theme.colors.background,
                }}>

                <FlatList
                    data={currReplies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <CommentTile
                                    tw={width}
                                    allComments={allComments} comment={item}
                                    repliesStack={repliesStack} setRepliesStack={setRepliesStack}
                                    setSelectedComment={setSelectedComment}
                                />
                            </View>

                        </View>;
                    }}
                />

                <View display='flex' flexDirection='row'>
                    <TouchableNativeFeedback onPress={() => setRepliesStack(repliesStack.slice(0, -1))}>
                        <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
                            <ThemedText content='back' />
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback onPress={() => setRepliesStack([])}>
                        <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
                            <ThemedText content='close' />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    </Modal >;
};
const NoComments = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const tw = useWindowDimensions().width;

    return <View>
        <CommentTile allComments={[]} comment={thread} tw={tw} />
        <ThemedText content={'TODO: THERE ARE NO COMMENTS'} />
    </View>;
};
const CommentList = ({ ref, allComments, setAllComments, selectedComment, setSelectedComment, repliesStack, setRepliesStack, highlightedComment, lastComment, quoteList }) => {
    const { state } = React.useContext(Ctx);
    const { width } = useWindowDimensions();

    const thread = state.history.at(-1).thread;
    return <FlatList
        ref={ref}
        data={allComments}
        ListFooterComponent={ThreadStats}
        onScrollToIndexFailed={info => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
                ref.current?.scrollToEnd({ animated: true });

            });
        }}
        renderItem={({ item }) => <CommentTile
            allComments={allComments} comment={item}
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            highlightedComment={highlightedComment}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
            lastComment={lastComment}
            quoteList={quoteList}
            tw={width}
        />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => { await refreshThread(setAllComments, thread); }}
        refreshing={allComments === null}
        ListEmptyComponent={<NoComments />} />;
    // if (config.swipeToReply) {
    //     return <View><SwipeListView
    //         data={comments}
    //         renderItem={({ item, index }) => <CommentTile setSelectedComment={setSelectedComment} idx={index + 1} comments={comments} comment={item} tw={tw} setReplies={setReplies} />}
    //         renderHiddenItem={(data) => <HiddenItem data={data} />}
    //         disableRightSwipe
    //         keyExtractor={(item) => item.id}
    //         onRefresh={async () => { await refreshThread(setAllComments, thread); }}
    //         refreshing={comments === null}
    //         ListEmptyComponent={<NoComments />} />
    //     </View >;
    // }

};
const CommentTile = ({ selectedComment, setSelectedComment, allComments, comment, tw, repliesStack, setRepliesStack, highlightedComment, lastComment, quoteList }) => {
    const { state, config } = React.useContext(Ctx);
    const theme = useTheme();
    const img = Repo.media.from(comment);
    const thumbWidth = tw / 4;
    const replies = getRepliesTo(allComments, comment);
    const reply = replies.length === 1 ? 'reply' : 'replies';
    const alias = comment.alias || config.alias;

    let style = {
        padding: 10,
        flexDirection: 'column',
        borderBottomWidth: 2,
    };
    if (comment.id === highlightedComment || selectedComment && comment.id === selectedComment.id) {
        style = {
            ...style,
            backgroundColor: theme.colors.highlight,
        };
    }
    if (state.myComments.includes(comment.id)) {
        style = {
            ...style,
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.primary
        };
    }
    if (quotes(comment).some(id => state.myComments.includes(id))) {
        style = {
            ...style,
            backgroundColor: 'rgba(255, 0, 0, 0.5)'
        };
    }
    if (quoteList && quoteList.includes(comment.id)) {
        style = {
            ...style,
            backgroundColor: 'rgba(0, 255, 0, 0.5)'
        };
    }
    if (lastComment && comment.created_at > lastComment.created_at) {
        style = {
            ...style,
            borderLeftWidth: 2,
            borderLeftColor: 'red'
        };
    }

    return <Pressable
        onLongPress={() => { setSelectedComment(comment); }}>
        <View style={style}>
            <View style={{ flexDirection: 'row' }}>
                {img && <CommentThumbnail src={img} w={thumbWidth} h={thumbWidth} />}
                <View style={{ flex: 1 }}>
                    {comment.sub && <HtmlText value={`<sub>${comment.sub}</sub>`} />}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <HtmlText value={`<name>${alias}</name><info>, ${comment.created_at ? relativeTime(comment.created_at) : ''}</info>`} />
                        <HtmlText value={`<info>ID: ${comment.id}</info>`} />
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
                {comment.com && <HtmlText value={`<com>${comment.com}</com>`} onLinkPress={(url) => {
                    if (url.startsWith('#')) {
                        url = url.slice(2);
                    }
                    const quoted = allComments.find(item => item.id === Number(url));
                    if (quoted) {
                        setRepliesStack([...repliesStack, [quoted]]);
                    } else {
                        Linking.openURL(url);
                    }

                }} />}
            </View>

            {replies.length > 0 &&
                <TouchableNativeFeedback
                    onPress={() => setRepliesStack([...repliesStack, replies])}>
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
    return <TouchableNativeFeedback underlayColor='#fff'>
        <Image src={src} style={{ borderRadius: 10, width: w, height: h, marginRight: 8 }} />
    </TouchableNativeFeedback>;
};
const CreateCommentForm = ({ setCreateComment, setAllComments }) => {
    const { state, setState } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    // const [mediaTypeError, setMediaTypeError] = React.useState(false);

    const [form, setForm] = React.useState({
        data: {
            alias: null,
            com: null,
            op: thread.id,
            board: thread.board,
        },
        media: null,
    });
    const theme = useTheme();

    return <View style={{
        borderTopWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.formBg,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    }}>
        {
            form.media &&
            <View style={{
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
            }}>


                <View style={{ flexDirection: 'row' }}>
                    <View />

                    <TouchableHighlight onPress={() => { }}>
                        <Image src={form.media.path} style={{ width: 100, height: 100 }} />
                    </TouchableHighlight>

                    <View style={{ flex: 1, paddingLeft: 10 }}>
                        <ThemedText content={`Name: ${form.media.path.split('/').pop()}`} />
                        <ThemedText content={`Size: ${form.media.size}kb`} />
                        <ThemedText content={`Type: ${form.media.mime}`} />
                        <TouchableNativeFeedback onPress={() => {
                            setForm({ ...form, media: null });
                        }}>
                            <View style={{ padding: 10, width: '30%', alignItems: 'center', backgroundColor: 'rgba(255, 0,0, 0.2)', borderRadius: 20 }}>
                                <ThemedText content={`Remove`} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>

        }

        <View >
            <View style={{
                margin: 10,
                borderRadius: 20,
                overflow: 'hidden',
            }}>
                <TextInput
                    value={form.data.alias || ''}
                    style={{
                        backgroundColor: theme.colors.highlight,
                        fontSize: 16,
                        paddingLeft: 20,
                        color: theme.colors.text
                    }}
                    placeholder='Name (Optional)'
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                />
            </View>
            <View style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
                borderRadius: 20,
                overflow: 'hidden',
            }}>
                <View style={{ justifyContent: 'flex-end' }}>
                    <TouchableNativeFeedback onPress={() => {
                        ImageCropPicker.openPicker({
                            mediaType: "video",
                        }).then((video) => {
                            // todo: validation
                            setForm({ ...form, media: video });
                            console.log(video);
                        });
                    }}>
                        <View style={{ padding: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'attach'} size={22} />
                        </View>
                    </TouchableNativeFeedback>

                </View>
                <TextInput
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={true}
                    value={form.data.com || ''}
                    style={{
                        flex: 1,
                        padding: 5,
                        fontSize: 16,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.highlight
                    }}
                    placeholder='Comment (max 2000 chars)'
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
                <View style={{ justifyContent: 'flex-end' }}>
                    <TouchableNativeFeedback onPress={async () => {
                        console.log(form);
                        const comment = await Repo.comments.create(form);
                        setState({ ...state, myComments: [...state.myComments, comment.id] })
                        setCreateComment(false);
                        await refreshThread(setAllComments, thread);
                    }}>
                        <View style={{ padding: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'send'} size={22} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>

    </View >;

};
const ThreadStats = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    return <View style={{ padding: 30 }}>
        <ThemedText content={`Replies: ${thread.replies}, Images: ${thread.images}`} />
    </View>;
};
const CommentMenu = ({ selectedComment, setSelectedComment, quoteList, setQuoteList }) => {
    const { state, setState } = React.useContext(Ctx);
    const theme = useTheme();
    const itemStyle = { fontSize: 18, padding: 10, borderBottomWidth: 2 };

    return <Modal
        animationType='fade'
        transparent
        visible={selectedComment !== null}
        onRequestClose={() => { setSelectedComment(null); }}>
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View style={{
                width: '90%',
                backgroundColor: theme.colors.background,
                justifyContent: 'space-evenly',
            }}>

                <TouchableNativeFeedback onPress={() => {
                    setState({ ...state, myComments: [...state.myComments, selectedComment.id] })
                    setSelectedComment(null)
                }}>
                    <View>
                        <ThemedText content={`Mark as yours`} style={itemStyle} />
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={() => {
                    setQuoteList([...quoteList, selectedComment])
                    setSelectedComment(null)
                }}>
                    <View>
                        <ThemedText content={`Quote`} style={itemStyle} />
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={() => {
                    setSelectedComment(null)
                }}>
                    <View>
                        <ThemedText content={`Quote text`} style={itemStyle} />
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={() => setSelectedComment(null)}>
                    <View>
                        <ThemedText content={`Copy`} style={{ fontSize: 18, padding: 10 }} />
                    </View>
                </TouchableNativeFeedback>
            </View>
        </View>
    </Modal >;
};

// --- functions

const loadThread = async (setAllComments, thread) => {
    const value = await Repo.comments.getLocalOrRemote(thread.board, thread.id);
    setAllComments(value);
};
const refreshThread = async (setAllComments, thread) => {
    const value = await Repo.comments.getRemote(thread.board, thread.id);
    setAllComments(value);
};
const updateThread = async (comments, setAllComments, setlastComment, thread) => {
    const value = await Repo.comments.getRemote(thread.board, thread.id);
    const firstNew = value.find(v => !comments.find(c => c.id === v.id));
    setlastComment(firstNew);
    setAllComments(value);
};
const scrollToCommentId = (allComments, id, refList, setHighlightedComment) => {
    setHighlightedComment(id);
    const index = allComments.findIndex(item => item.id === id);
    if (index >= 0) {
        refList.current?.scrollToIndex({ index, animated: true });
    }
};

// const ThreadRefreshInfo = () => {
//     const { config } = React.useContext(Ctx);
//     if (config.refreshTimeout) {
//         return <View />;
//     }
//     return <ThemedText content={``} style={{ fontWeight: 'bold', textAlign: 'center' }}>Automatically refreshing in {config.refreshTimeout}s;
// };

// const HiddenItem = ({ data }) => {
//     return <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
//         <Icon name='return-down-back' size={20} color='black' />
//     </View>;
// };