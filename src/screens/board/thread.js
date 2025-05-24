/* eslint-disable react/display-name */
import { Marquee } from '@animatereactnative/marquee';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { filesize } from 'filesize';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, Linking, ScrollView, TextInput, TouchableHighlight, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { State } from 'react-native-gesture-handler';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx } from '../../app';
import { threadSorts } from '../../context/state';
import { loadComments } from '../../context/temp';
import { Repo } from '../../data/repo';
import { Fab, getCurrBoard, getRepliesTo, HeaderIcon, HtmlHeader, HtmlText, ModalAlert, ModalGallery, ModalMenu, ModalView, quotes, relativeTime, ThemedIcon, ThemedText } from '../../utils';
export const THREAD_KEY = 'Thread';

export const ThreadHeaderTitle = () => {
    const { state, config } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <Marquee
        speed={config.disableMovingElements ? 0 : 0.3}
        spacing={100}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        <HtmlHeader value={`/${thread.board}/ - ${thread.sub || thread.com}`} />
    </Marquee>;
};
export const ThreadHeaderRight = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    const theme = useTheme();
    const [threadActions, setThreadActions] = React.useState(false);
    const [sortActions, setSortActions] = React.useState(false);
    const isWatching = state.threadWatcher.includes(thread.id);

    const items = [
        [isWatching ? 'Unwatch' : 'Watch', isWatching ? 'eye-off' : 'eye', () => {
            setThreadActions(false);
            if (isWatching) {
                setState({ ...state, threadWatcher: state.threadWatcher.filter(item => item !== thread.id) });
            }
            else {
                setState({ ...state, threadWatcher: [...state.threadWatcher, thread.id] });
            }
        }],
        ['Sort...', 'options', () => {
            setThreadActions(false);
            setSortActions(true);
        }],
        ['reverse...', 'reverse', () => {
            setThreadActions(false);
            setState({ ...state, threadRev: !state.threadRev });
            setTemp({ ...temp, comments: temp.comments.reverse() });
        }],
        ['Refresh', 'refresh', () => {
            setThreadActions(false);
            temp.threadReflist.current?.refresh();
        }],
        ['Stats', 'stats-chart', () => { setThreadActions(false); }],
        ['Go top', 'arrow-up', () => {
            setThreadActions(false);
            temp.threadReflist.current?.scrollToIndex({ animated: true, index: 0 });
        }],
    ];
    if (!config.loadFaster) {
        items.push(['Go Bottom', 'arrow-down', () => {
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
            />}

        {sortActions &&
            <ModalMenu
                visible={sortActions}
                onClose={() => setSortActions(false)}
                items={threadSorts.map(({ name, sort, icon }, index) => {
                    return [name, icon, async () => {
                        setSortActions(false);
                        setState({ ...state, threadSort: index });
                        setTemp({ ...temp, comments: temp.comments.sort(sort({ state: state, comments: temp.comments })) });
                        await State.set('catalogSort', index);
                    }]
                })}
            />}
    </View>;
};
export const Thread = () => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const theme = useTheme();
    const thread = state.history.at(-1).thread;
    const reflist = useRef(null);
    const [selectedComment, setSelectedComment] = React.useState(null);
    const [repliesStack, setRepliesStack] = React.useState([]);
    const [createComment, setCreateComment] = React.useState(false);
    const [form, setForm] = React.useState({
        data: {
            alias: config.alias,
            com: null,
            op: thread.id,
            board: thread.board,
        },
        media: null,
    });
    const board = getCurrBoard(state);

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
        if (!temp.comments && !temp.isFetchingComments || (temp.commentsBoard !== thread.id && !temp.isFetchingComments)) {
            console.log('loading comments');
            loadComments(state, setTemp, false);
        }
    }, [temp.comments, setTemp, state, temp.isFetchingComments, temp, thread.id])

    if (temp.isFetchingComments || !temp.comments) {
        return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.card }}>
            <CommentTile
                comment={thread}
                setSelectedComment={setSelectedComment}
                index={0}
                tw={width}
            />
            <ActivityIndicator />
            <ThemedText content={'FETCHING COMMENTS'} />
            <ThreadInfo />

            <ModalGallery
                visible={temp.selectedImgIdx !== null}
                onClose={() => setTemp({ ...temp, selectedImgIdx: null })}
                initialIndex={temp.selectedImgIdx}
                data={[thread]}
            />
        </ScrollView>;
    }

    return <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
        <CommentList
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
        />

        <ModalGallery
            visible={temp.selectedImgIdx !== null}
            onClose={() => setTemp({ ...temp, selectedImgIdx: null })}
            initialIndex={temp.selectedImgIdx}
            data={temp.comments}
        />

        <RepliesModal
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            setSelectedComment={setSelectedComment}
        />
        {selectedComment && <CommentMenu
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
        />}


        {createComment ?
            (board.max_replies && thread.replies >= board.max_replies ?
                <ModalAlert
                    msg={'The thread is full! :( \nYou can no longer comment.'}
                    visible={createComment}
                    onClose={() => { setCreateComment(false) }}
                    right={'Ok'}
                    onPressRight={() => { setCreateComment(false) }}
                /> :
                <CreateCommentForm setCreateComment={setCreateComment} form={form} setForm={setForm} />
            ) :
            <Fab onPress={() => { setCreateComment(true) }} />}


    </View>;
};

const RepliesModal = ({ repliesStack, setRepliesStack, setSelectedComment }) => {
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
            <View style={{ maxHeight: '90%', }} >
                <FlatList
                    data={currReplies}
                    windowSize={10}
                    initialNumToRender={10}
                    maxToRenderPerBatch={50}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => {
                        return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <CommentTile
                                    index={index}
                                    comment={item}
                                    tw={width}
                                    repliesStack={repliesStack} setRepliesStack={setRepliesStack}
                                    setSelectedComment={setSelectedComment} />
                            </View>
                        </View>;
                    }}
                />
            </View>
            <View style={{ position: 'relative', bottom: 0, flexDirection: 'row', borderRadius: config.borderRadius, }}>
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
    const { state, temp, setTemp } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;
    const tw = useWindowDimensions().width;

    return <View>
        <CommentTile comment={thread} tw={tw} index={0} />
        <ThemedText content={'TODO: THERE ARE NO COMMENTS'} />
        <ModalGallery
            visible={temp.selectedImgIdx !== null}
            onClose={() => setTemp({ ...temp, selectedImgIdx: null })}
            initialIndex={temp.selectedImgIdx}
            data={[thread]}
        />
    </View>;
};
const CommentList = ({ selectedComment, setSelectedComment, isAutoUpdating, repliesStack, setRepliesStack }) => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();

    const renderItem = useCallback(({ item, index }) => (
        <CommentTile
            comment={item}
            index={index}
            repliesStack={repliesStack}
            setRepliesStack={setRepliesStack}
            selectedComment={selectedComment}
            setSelectedComment={setSelectedComment}
            tw={width}
        />
    ), [repliesStack, selectedComment, setRepliesStack, setSelectedComment, width]);

    const EmptyComponent = useCallback(() => <NoComments />, []);
    const keyExtractor = useCallback((item) => String(item.id), []);

    const handleRefresh = useCallback(async () => {
        await loadComments(state, setTemp, true);
    }, [setTemp, state]);

    return <FlatList
        ref={temp.threadReflist}
        data={temp.comments}
        keyExtractor={keyExtractor}
        windowSize={10}
        initialNumToRender={config.loadFaster ? 10 : temp.comments.length}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        // ItemSeparatorComponent={ListSeparator}
        ListFooterComponent={<ThreadInfo />}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={temp.isFetchingComments}
        ListEmptyComponent={EmptyComponent} />;
};
const CommentTile = React.memo(({ comment, index, selectedComment, setSelectedComment, tw, repliesStack, setRepliesStack }) => {
    const { state, config, temp, setTemp, } = React.useContext(Ctx);
    const comments = temp.comments || [];
    const theme = useTheme();
    const thumbWidth = tw / 4;
    const replies = getRepliesTo(comments, comment);
    const isMine = state.myComments.includes(comment.id);
    const isQuotingMe = quotes(comment).some(id => state.myComments.includes(id));
    const img = Repo.media.thumb(comment);
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
            borderLeftWidth: 2,
            borderLeftColor: 'rgba(255, 251, 0, 0.5)'
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
                            <TouchableNativeFeedback
                                onPress={() => { setTemp(prev => ({ ...prev, selectedImgIdx: index })); }}>
                                <Image src={img} resizeMode="contain" style={{ borderRadius: config.borderRadius, width: thumbWidth, height: thumbWidth, marginRight: 8 }} />
                            </TouchableNativeFeedback>}

                        <View style={{ flex: 1 }}>
                            {comment.sub && <HtmlText value={`<sub>${comment.sub}</sub>`} />}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <HtmlText value={`<name>${alias}</name><info>, ${comment.created_at ? relativeTime(comment.created_at) : ''}</info>`} />
                                <HtmlText value={`<info>ID: ${comment.id}</info>`} />
                            </View>

                            {img &&
                                <View>
                                    <HtmlText value={`<info>File: ${comment.media_name}.${comment.media_ext}</info>`} />
                                    {comment.media_size && <HtmlText value={`<info>Size: ${filesize(comment.media_size)} </info>`} />}
                                </View>}
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
    return prevProps.index === nextProps.index;
});
const CreateCommentForm = ({ setCreateComment, form, setForm }) => {
    const { state, setState, setTemp, config } = React.useContext(Ctx);
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
            <View style={{ marginTop: 10, marginLeft: 10, marginRight: 10, }}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableHighlight onPress={() => { }}>
                        <Image src={form.media.path} resizeMode="contain" style={{ width: 100, height: 100, borderRadius: config.borderRadius, }} />
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
                        if (config.autoWatchThreads) {
                            setState({ ...state, threadWatcher: [...state.threadWatcher, thread.id] })
                        }
                        setCreateComment(false);
                        await loadComments(state, setTemp, true);
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
const ThreadInfo = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1).thread;

    return <View style={{ padding: 15 }}>
        <ThemedText content={`Replies: ${thread.replies}`} />
        <ThemedText content={`Images: ${thread.images}`} />
    </View>;
};
const CommentMenu = ({ selectedComment, setSelectedComment }) => {
    const { state, setState, temp, config } = React.useContext(Ctx);
    const isMine = state.myComments.includes(selectedComment.id);
    const items = [
        [isMine ? 'Unmark as yours' : 'Mark as yours', isMine ? 'arrow-undo' : 'checkmark', () => {
            setState({ ...state, myComments: [...state.myComments, selectedComment.id] })
            setSelectedComment(null)
        }],
        ['Quote', 'comment-text', () => {
            //   setQuoteList([...quoteList, selectedComment.id])
            setSelectedComment(null)
        }],
        ['Quote whole comment', 'comment-text-multiple', () => {
            //  setQuoteList([...quoteList, selectedComment.id])
            setSelectedComment(null)
        }],
        ['Copy', 'copy', () => {
            // todo
            setSelectedComment(null)
        }],
    ];

    if (!config.loadFaster) {
        items.push(['Jump to comment', 'arrow-right', () => {
            const index = temp.comments.findIndex(item => item.id === selectedComment.id);
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