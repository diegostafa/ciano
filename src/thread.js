/* eslint-disable react/display-name */
import { Marquee } from '@animatereactnative/marquee';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, Linking, ScrollView, TextInput, TouchableHighlight, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx } from './app';
import { Repo } from './repo';
import { Fab, getRepliesTo, HeaderIcon, HtmlText, ListSeparator, ModalAlert, ModalMenu, ModalView, quotes, relativeTime, ThemedIcon, ThemedText } from './utils';

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
    const { temp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const [threadActions, setThreadActions] = React.useState(false);
    const items = [
        ['Sort...', () => { setThreadActions(false); }],
        ['Refresh', () => { setThreadActions(false); }],
        ['View info', () => { setThreadActions(false); }],
        ['Go top', () => {
            setThreadActions(false);
            temp.threadReflist.current?.scrollToIndex({ animated: true, index: 0 });
        }],
    ];
    if (!config.loadFaster) {
        items.push(['Go Bottom', () => {
            setThreadActions(false);
            setTimeout(() => {
                temp.threadReflist.current?.scrollToEnd();
            }, 100);

        }]);
    }
    return <View style={{ flexDirection: 'row', backgroundColor: theme.colors.card }}>
        <HeaderIcon name='search' onPress={() => { }} />
        <HeaderIcon name='ellipsis-vertical' onPress={() => { setThreadActions(true) }} />

        {threadActions &&
            <ModalMenu
                visible={threadActions}
                onClose={() => { setThreadActions(false) }}
                items={items}
            />
        }
    </View>;
};
export const Thread = () => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const theme = useTheme();
    const thread = state.history.at(-1).thread;
    const reflist = useRef(null);
    const [comments, setComments] = React.useState(null);
    const [selectedComment, setSelectedComment] = React.useState(null);
    const [repliesStack, setRepliesStack] = React.useState([]);
    const [createComment, setCreateComment] = React.useState(false);
    const [isAutoUpdating, setIsAutoUpdating] = React.useState(false);
    const [isFetchingComments, setIsFetchingComments] = React.useState(false);
    const [autoRefreshSec, setAutoRefreshSec] = React.useState(config.refreshTimeout);
    const [form, setForm] = React.useState({
        data: {
            alias: config.alias,
            com: null,
            op: thread.id,
            board: thread.board,
        },
        media: null,
    });

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
        if (!temp.threadReflist) {
            setTemp({ ...temp, threadReflist: reflist });
        }
    }, [setTemp, temp]);
    React.useEffect(() => {
        if (!comments) {
            loadComments(setComments, setIsFetchingComments, thread, false);
        }
    }, [comments, setComments, thread])


    React.useEffect(() => {
        const countdownInterval = setInterval(() => {
            setAutoRefreshSec(async (prev) => {
                if (prev === 0) {
                    autoUpdateComments(setComments, setIsAutoUpdating, thread, true);
                    return config.refreshTimeout;
                }
                if (isAutoUpdating) { return prev; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdownInterval);
    }, [comments, config.refreshTimeout, thread, isAutoUpdating, setIsAutoUpdating]);

    if (isFetchingComments || !comments) {
        return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.card }}>
            <CommentTile
                comment={thread}
                setSelectedComment={setSelectedComment}
                comments={[]}
                tw={width}
            />
            <ActivityIndicator />
            <ThemedText content={'FETCHING COMMENTS'} />
            <ThreadInfo />
        </ScrollView>;
    }

    return <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
        <CommentList
            autoRefreshSec={autoRefreshSec}
            comments={comments} setComments={setComments}
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
            isFetchingComments={isFetchingComments} setIsFetchingComments={setIsFetchingComments}
        />
        <RepliesModal
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            comments={comments}
            setSelectedComment={setSelectedComment}
        />
        <CommentMenu comments={comments}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
        />

        {createComment ?
            (thread.max_replies > comments.length ?
                <CreateCommentForm setCreateComment={setCreateComment} setComments={setComments} form={form} setForm={setForm} setIsFetchingComments={setIsFetchingComments} /> :
                <ModalAlert
                    msg={'The thread is full! You can no longer comment.'}
                    visible={createComment}
                    onClose={() => { setCreateComment(false) }}
                    right={'Ok'}
                    onPressRight={() => { setCreateComment(false) }}
                />) :
            <Fab onPress={() => { setCreateComment(true) }} />}
    </View>;
};

const RepliesModal = ({ repliesStack, setRepliesStack, comments, setSelectedComment }) => {
    const { config } = React.useContext(Ctx);
    const currReplies = repliesStack.at(-1);
    const theme = useTheme();
    const width = useWindowDimensions().width - 50;
    const btnOuterStyle = {
        margin: 5,
        borderRadius: config.borderRadius,
        overflow: 'hidden',
        flex: 1,
    };
    const btnStyle = {
        padding: 15,
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    };

    return <ModalView
        visible={repliesStack.length > 0}
        onClose={() => setRepliesStack(repliesStack.slice(0, -1))}
        content={<View>
            <FlatList
                data={currReplies}
                windowSize={10}
                initialNumToRender={10}
                maxToRenderPerBatch={50}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <CommentTile
                                comment={item}
                                tw={width}
                                comments={comments}
                                repliesStack={repliesStack} setRepliesStack={setRepliesStack}
                                setSelectedComment={setSelectedComment} />
                        </View>
                    </View>;
                }}
            />

            <View style={{ flexDirection: 'row', borderRadius: config.borderRadius, }}>
                {repliesStack.length > 1 &&
                    <View style={btnOuterStyle}>
                        <TouchableNativeFeedback onPress={() => setRepliesStack(repliesStack.slice(0, -1))}>
                            <View style={btnStyle}>
                                <ThemedText content={`Back (${repliesStack.length - 1})`} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                }
                <View style={btnOuterStyle}>
                    <TouchableNativeFeedback
                        onPress={() => setRepliesStack([])}>
                        <View style={btnStyle}>
                            <ThemedText content='Close' />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>}
    />;
};
const NoComments = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const tw = useWindowDimensions().width;

    return <View>
        <CommentTile comments={[]} comment={thread} tw={tw} />
        <ThemedText content={'TODO: THERE ARE NO COMMENTS'} />
    </View>;
};
const CommentList = ({ autoRefreshSec, comments, setComments, selectedComment, setSelectedComment, isFetchingComments, setIsFetchingComments, repliesStack, setRepliesStack }) => {
    const { state, config, temp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const thread = state.history.at(-1).thread;

    const renderItem = useCallback(({ item }) => (
        <CommentTile
            comment={item}
            comments={comments}
            repliesStack={repliesStack}
            setRepliesStack={setRepliesStack}
            selectedComment={selectedComment}
            setSelectedComment={setSelectedComment}
            tw={width}
        />
    ), [comments, repliesStack, setRepliesStack, selectedComment, setSelectedComment, width]);

    const EmptyComponent = useCallback(() => <NoComments />, []);
    const keyExtractor = useCallback((item) => String(item.id), []);

    const FooterComponent = useCallback(() => (
        <ThreadInfo autoRefreshSec={autoRefreshSec} />
    ), [autoRefreshSec]);
    const handleRefresh = useCallback(async () => {
        await loadComments(setComments, setIsFetchingComments, thread, true);
    }, [setComments, setIsFetchingComments, thread]);

    return <FlatList
        ref={temp.threadReflist}
        data={comments}
        keyExtractor={keyExtractor}
        windowSize={10}
        initialNumToRender={config.loadFaster ? 10 : comments.length}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        ItemSeparatorComponent={ListSeparator}
        ListFooterComponent={FooterComponent}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={isFetchingComments}
        ListEmptyComponent={EmptyComponent} />;
};
const CommentTile = React.memo(({ comment, selectedComment, setSelectedComment, comments, tw, repliesStack, setRepliesStack }) => {
    const { state, config } = React.useContext(Ctx);
    const theme = useTheme();
    const thumbWidth = tw / 4;
    const replies = getRepliesTo(comments, comment);
    const isMine = state.myComments.includes(comment.id);
    const isQuotingMe = quotes(comments).some(id => state.myComments.includes(id));
    const img = Repo.media.from(comment);
    const reply = replies.length === 1 ? 'reply' : 'replies';
    const alias = comment.alias || config.alias || 'Anonymous';

    let style = {
        backgroundColor: theme.colors.background,
        flexDirection: 'column',
    };
    if (selectedComment && comment.id === selectedComment.id) {
        style = {
            ...style,
            backgroundColor: theme.colors.highlight,
        };
    }
    if (isMine) {
        style = {
            ...style,
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.primary
        };
    }
    if (isQuotingMe) {
        style = {
            ...style,
            backgroundColor: 'rgba(255, 0, 0, 0.5)'
        };
    }

    return <View style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        margin: 5,
    }}>
        <View style={style}>
            <TouchableNativeFeedback onLongPress={() => { setSelectedComment(comment); }}>
                <View style={{ padding: 8 }}>
                    <View style={{ flexDirection: 'row' }}>
                        {img &&
                            <TouchableNativeFeedback underlayColor='#fff'>
                                <Image src={img} style={{ borderRadius: config.borderRadius, width: thumbWidth, height: thumbWidth, marginRight: 8 }} />
                            </TouchableNativeFeedback>
                        }
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

                    {comment.com &&
                        <View style={{ marginTop: 8 }}>
                            <HtmlText value={`<com>${comment.com}</com>`} onLinkPress={(url) => {
                                if (url.startsWith('#')) { url = url.slice(2); }
                                const quoted = comments.find(c => c.id === Number(url));
                                if (quoted) {
                                    setRepliesStack([...repliesStack, [quoted]]);
                                } else {
                                    Linking.openURL(url);
                                }
                            }} />
                        </View>}
                </View>
            </TouchableNativeFeedback>

            {replies.length > 0 &&
                <View style={{ flexDirection: 'row' }}>
                    <View style={{
                        flex: 1,
                        borderColor: 'red',
                        overflow: 'hidden',
                        flexDirection: 'row'
                    }}>
                        <TouchableNativeFeedback
                            onPress={() => setRepliesStack([...repliesStack, replies])}>
                            <View style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                padding: 6,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <HtmlText value={`<replies>View ${replies.length} ${reply}</replies>`} />
                                <ThemedIcon name='chevron-down-outline' size={20} color={theme.colors.text} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>}
        </View>
    </View>;
}, (prevProps, nextProps) => {
    return prevProps.selectedComment?.id === nextProps.selectedComment?.id &&
        prevProps.comment.id === nextProps.comment.id &&
        prevProps.tw === nextProps.tw &&
        prevProps.repliesStack?.length === nextProps.repliesStack?.length;
});
const CreateCommentForm = ({ setCreateComment, setComments, form, setForm, setIsFetchingComments }) => {
    const { state, setState, config } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const theme = useTheme();
    // const [mediaTypeError, setMediaTypeError] = React.useState(false);

    return <View style={{
        borderTopWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        maxHeight: '50%',
    }}>
        {form.media &&
            <View style={{
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
            }}>
                <View style={{ flexDirection: 'row' }}>

                    <TouchableHighlight onPress={() => { }}>
                        <Image src={form.media.path} style={{ width: 100, height: 100, borderRadius: config.borderRadius, }} />
                    </TouchableHighlight>

                    <View style={{ flex: 1, paddingLeft: 10, justifyContent: 'space-between' }}>
                        <View>
                            <ThemedText content={`Name: ${form.media.path.split('/').pop()}`} />
                            <ThemedText content={`Size: ${form.media.size}kb`} />
                            <ThemedText content={`Type: ${form.media.mime}`} />
                        </View>
                        <TouchableNativeFeedback onPress={() => {
                            setForm({ ...form, media: null });
                        }}>
                            <View style={{ padding: 10, width: '30%', alignItems: 'center', backgroundColor: 'rgba(255, 0,0, 0.2)', borderRadius: config.borderRadius }}>
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
                borderRadius: config.borderRadius,
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
                borderRadius: config.borderRadius,
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
                        await loadComments(setComments, setIsFetchingComments, thread, true);
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
const ThreadInfo = ({ autoRefreshSec, isAutoUpdating }) => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <View style={{ padding: 15 }}>
        <ThemedText content={`Replies: ${thread.replies}`} />
        <ThemedText content={`Images: ${thread.images}`} />
        {isAutoUpdating ?
            <ThemedText content={`Refreshing the thread...`} /> :
            <ThemedText content={`Refreshing the thread in ${autoRefreshSec}s`} />
        }

    </View>;
};
const CommentMenu = ({ selectedComment, setSelectedComment, comments }) => {
    const { state, setState, temp, config } = React.useContext(Ctx);
    const items = [
        ['Mark as yours', () => {
            setState({ ...state, myComments: [...state.myComments, selectedComment.id] })
            setSelectedComment(null)
        }],
        ['Quote', () => {
            //   setQuoteList([...quoteList, selectedComment.id])
            setSelectedComment(null)
        }],
        ['Quote whole comment', () => {
            //  setQuoteList([...quoteList, selectedComment.id])
            setSelectedComment(null)
        }],
        ['Copy', () => {
            // todo
            setSelectedComment(null)
        }],
    ];

    if (!config.loadFaster) {
        items.push(['Jump to comment', () => {
            const index = comments.findIndex(item => item.id === selectedComment.id);
            if (index >= 0) {
                temp.threadReflist.current?.scrollToIndex({ animated: true, index: 0 });
            }
            setSelectedComment(null)
        }]);
    }

    return <ModalMenu
        visible={selectedComment !== null}
        onClose={() => { setSelectedComment(null); }}
        items={items} />
};

// --- functions

const loadComments = async (setComments, setIsFetchingComments, thread, refresh) => {
    setIsFetchingComments(true);
    const comments = refresh ?
        await Repo.comments.getRemote(thread.board, thread.id) :
        await Repo.comments.getLocalOrRemote(thread.board, thread.id);
    setComments(comments);
    setIsFetchingComments(false);
};

const autoUpdateComments = async (setComments, setIsAutoUpdating, thread, refresh) => {
    setIsAutoUpdating(true);
    const comments = refresh ?
        await Repo.comments.getRemote(thread.board, thread.id) :
        await Repo.comments.getLocalOrRemote(thread.board, thread.id);
    setComments(comments);
    setIsAutoUpdating(false);
};

