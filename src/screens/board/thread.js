/* eslint-disable react/display-name */
import { Marquee } from '@animatereactnative/marquee';
import { useNavigation, useTheme } from '@react-navigation/native';
import { filesize } from 'filesize';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Pressable, ScrollView, TextInput, TouchableHighlight, TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx, HEADER_HEIGHT } from '../../app';
import { Col, Fab, FooterList, HeaderIcon, HtmlText, ListSeparator, ModalAlert, ModalLocalMediaPreview, ModalMediaPreview, ModalMenu, ModalView, Row, SearchBar, ThemedAsset, ThemedIcon, ThemedText, UpdateGap } from '../../components';
import { State, threadSorts } from '../../context/state';
import { hasCommentsErrors } from '../../context/temp';
import { Repo } from '../../data/repo';
import { loadComments, uploadComment } from '../../data/utils';
import { commentContains, getCurrFullBoard, getRepliesTo, getThreadHeaderSignature, quotes, relativeTime } from '../../helpers';
export const THREAD_KEY = 'Thread';

const getDefaultForm = (config, thread) => {
    return {
        data: {
            alias: config.defaultName,
            com: null,
            op: thread.id,
            board: thread.board,
        },
        media: null,
    };
};
export const ThreadHeaderTitle = () => {
    const { state, config } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const thread = state.history.at(-1);
    const titleWidth = width - 150;
    const html = getThreadHeaderSignature(thread);

    return <Marquee
        speed={config.disableMovingElements ? 0 : 0.3}
        spacing={titleWidth}
        style={{ flex: 1, width: titleWidth, height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        <HtmlText value={html} raw />
    </Marquee>;
};
export const ThreadHeaderRight = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const thread = state.history.at(-1);

    const theme = useTheme();
    const [threadActions, setThreadActions] = React.useState(false);
    const [sortActions, setSortActions] = React.useState(false);
    const isWatching = state.watching.some(item => item.thread.id === thread.id);

    const items = [
        (temp.comments !== null &&
            isWatching ?
            ['unwatch', 'eye-off', () => {
                setThreadActions(false);
                setState(prev => ({ ...prev, watching: prev.watching.filter(item => item.thread.id !== thread.id) }));
            }
            ] :
            ['watch', 'eye', () => {
                setThreadActions(false);
                setState(prev => ({
                    ...prev, watching: [...prev.watching, {
                        thread,
                        last: thread.replies,
                        new: 0,
                        you: 0,
                    }]
                }));
            }]
        ),
        ['Sort...', 'options', () => {
            setThreadActions(false);
            setSortActions(true);
        }],
        [state.threadRev ? 'reverse (currently on)' : 'reverse', 'swap-vertical', () => {
            setThreadActions(false);
            setTemp(prev => ({ ...prev, isComputingComments: true }));
            async function defer() {
                setState(prev => ({ ...prev, threadRev: !prev.threadRev }));
                // don't sort op
                if (temp.comments.length > 0) {
                    const head = temp.comments[0];
                    const tail = temp.comments.slice(1).reverse();
                    setTemp(prev => ({ ...prev, comments: [head, ...tail] }));
                }
                setTemp(prev => ({ ...prev, isComputingComments: false }));
            }
            defer()
        }],
        ['Refresh', 'refresh', () => {
            setThreadActions(false);
            temp.threadReflist.current?.refresh();
        }],
        ['Go top', 'arrow-up', () => {
            setThreadActions(false);
            temp.threadReflist.current?.scrollToIndex({ animated: true, index: 0 });
        }],
    ];
    if (!config.loadFaster) {
        items.push(['Go Bottom', 'arrow-down', () => {
            setThreadActions(false);
            temp.threadReflist.current?.scrollToEnd({ animated: true });
        }]);
    }
    return <Row style={{ backgroundColor: theme.colors.card }}>
        {temp.threadFilter === null && <HeaderIcon name={'search'} onPress={() => setTemp(prev => ({ ...prev, threadFilter: '' }))} />}
        <HeaderIcon name='ellipsis-vertical' onPress={() => { setThreadActions(true) }} />
        <ModalMenu
            visible={threadActions}
            onClose={() => { setThreadActions(false) }}
            items={items}
        />
        <ModalMenu
            visible={sortActions}
            onClose={() => setSortActions(false)}
            items={threadSorts.map(({ name, sort, icon }, index) => {
                return [name, icon, async () => {
                    setSortActions(false);
                    setTemp(prev => ({ ...prev, isComputingComments: true }));
                    async function defer() {
                        setState({ ...state, threadSort: index });
                        await State.set('catalogSort', index);
                        // don't sort op
                        if (temp.comments.length > 0) {
                            const head = temp.comments[0];
                            const tail = temp.comments.slice(1).sort(sort({ state: state, comments: temp.comments }));
                            setTemp({ ...temp, comments: [head, ...tail] });
                        }
                        setTemp(prev => ({ ...prev, isComputingComments: false }));
                    }
                    defer()
                }]
            })}
        />
    </Row>;
};
export const Thread = () => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const sailor = useNavigation();
    const theme = useTheme();
    const thread = state.history.at(-1);
    const reflist = useRef(null);
    const [selectedComment, setSelectedComment] = React.useState(null);
    const [repliesStack, setRepliesStack] = React.useState([]);
    const [createComment, setCreateComment] = React.useState(false);
    const [form, setForm] = React.useState(getDefaultForm(config, thread));
    const [once, setOnce] = React.useState(true);
    const board = getCurrFullBoard(state);
    React.useEffect(() => {
        if (once) {
            setTemp(prev => ({
                ...prev,
                formMediaError: null,
                formNameError: null,
                formSubError: null,
                formComError: null,
            }));
            setOnce(false);
        }
    }, [once, setTemp]);


    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (createComment) {
                setCreateComment(false);
                return;
            }
            if (temp.threadFilter !== null) {
                setTemp(prev => ({ ...prev, threadFilter: null }));
                e.preventDefault();
                return;
            }
            return;

        });
        return unsubscribe;

    }, [createComment, sailor, setTemp, temp.threadFilter]);

    React.useEffect(() => {
        if (hasCommentsErrors(temp)) {
            return;
        }
        if (!temp.threadReflist) {
            setTemp({ ...temp, threadReflist: reflist });
        }
        if (temp.isFetchingComments) {
            return;
        }
        if (!temp.comments || temp.commentsBoard !== thread.id) {
            loadComments(state, setTemp, false);
        }
    }, [temp.comments, setTemp, state, temp.isFetchingComments, temp, thread.id, config])

    if (temp.isFetchingComments) {
        return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.card }}>
            <CommentTile
                comment={thread}
                setSelectedComment={setSelectedComment}
                tw={width}
            />
            <ThemedAsset msg={'Loading comments...'} name={'placeholder'} loading />
            <ThreadInfo />
            <ModalMediaPreview />
        </ScrollView>;
    }
    if (temp.comments === null) {
        return <UpdateGap />;
    }
    if (temp.isComputingComments) {
        return <ThemedAsset
            msg={'Sorting comments...'}
            name={'placeholder'}
            loading
        />;
    }

    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {temp.threadFilter !== null && <SearchBar
            placeholder='Search for a comment...'
            value={temp.threadFilter}
            onChangeText={text => setTemp(prev => ({ ...prev, threadFilter: text }))}
            onClose={() => { setTemp(prev => ({ ...prev, threadFilter: null })); }}
        />}

        <CommentList
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            selectedComment={selectedComment} setSelectedComment={setSelectedComment}
        />
        <RepliesModal
            repliesStack={repliesStack} setRepliesStack={setRepliesStack}
            setSelectedComment={setSelectedComment}
        />
        <ModalMediaPreview />
        <ModalLocalMediaPreview />

        {selectedComment &&
            <CommentMenu
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
            state.api.name === 'ciano' && <Fab onPress={() => { setCreateComment(true) }} />}


    </Col>;
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
        content={<Col>
            <Col style={{ maxHeight: '90%', }} >
                <FlatList
                    data={currReplies}
                    windowSize={10}
                    initialNumToRender={10}
                    maxToRenderPerBatch={50}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => {
                        return <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Col style={{ flex: 1 }}>
                                <CommentTile
                                    comment={item}
                                    tw={width}
                                    repliesStack={repliesStack} setRepliesStack={setRepliesStack}
                                    setSelectedComment={setSelectedComment} />
                            </Col>
                        </Row>;
                    }}
                />
            </Col>
            <Row style={{ position: 'relative', bottom: 0, borderRadius: config.borderRadius, }}>
                {repliesStack.length > 1 &&
                    <Col style={btnOuterStyle}>
                        <TouchableNativeFeedback onPress={() => setRepliesStack(repliesStack.slice(0, -1))}>
                            <Col style={btnStyle}>
                                <ThemedText content={`Back (${repliesStack.length - 1})`} />
                            </Col>
                        </TouchableNativeFeedback>
                    </Col>
                }
                <Col style={btnOuterStyle}>
                    <TouchableNativeFeedback
                        onPress={() => setRepliesStack([])}>
                        <Col style={btnStyle}>
                            <ThemedText content='Close' />
                        </Col>
                    </TouchableNativeFeedback>
                </Col>
            </Row>
        </Col>}
    />;
};
const NoComments = () => {
    return <ThemedAsset name={'placeholder'} msg={`There are no comments here`} />;
};
const CommentList = ({ selectedComment, setSelectedComment, repliesStack, setRepliesStack }) => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();

    let comments = temp.comments;
    if (temp.threadFilter !== null) {
        const head = temp.comments[0];
        const tail = temp.comments.slice(1).filter(item => commentContains(item, temp.threadFilter));
        comments = [head, ...tail];
    }

    const renderItem = useCallback(({ item }) => (
        <CommentTile
            comment={item}
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
        data={comments}
        keyExtractor={keyExtractor}
        windowSize={10}
        initialNumToRender={config.loadFaster ? 10 : temp.comments.length}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ItemSeparatorComponent={config.commentSeparator ? ListSeparator : undefined}
        ListFooterComponent={<ThreadInfo />}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={temp.isFetchingComments}
        ListEmptyComponent={EmptyComponent} />;
};
const CommentTile = React.memo(({ comment, selectedComment, setSelectedComment, repliesStack, setRepliesStack }) => {
    const { state, config, temp, setTemp, } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions() || {}
    const isVertical = width < height;
    const comments = temp.comments || [];
    const theme = useTheme();
    const thumbWidth = isVertical ? width / 4 : height / 4;
    const replies = getRepliesTo(comments, comment);
    const isMine = state.myComments.includes(comment.id);
    const isQuotingMe = quotes(comment).some(id => state.myComments.includes(id));
    const img = Repo(state.api).media.thumb(comment);
    const reply = replies.length === 1 ? 'reply' : 'replies';
    const alias = config.showNames ? `<name>${comment.alias || config.alias || 'Anonymous'}</name>, ` : '';

    let style = {
        backgroundColor: theme.colors.background,
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
            borderLeftColor: theme.colors.isMine
        };
    }
    if (isQuotingMe) {
        style = {
            ...style,
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.isQuotingMe,
        };
    }

    return <Col style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        margin: 5,
    }}>
        <Col style={style}>
            <Pressable onLongPress={() => { setSelectedComment(comment); }}>
                <Col style={{ padding: 8 }}>
                    <Row>
                        {img &&
                            <TouchableNativeFeedback
                                onPress={() => { setTemp(prev => ({ ...prev, selectedMediaComment: comment })); }}>
                                <Image src={img} style={{ borderRadius: config.borderRadius, width: thumbWidth, height: thumbWidth, marginRight: 8 }} />
                            </TouchableNativeFeedback>}

                        <Col style={{ flex: 1 }}>
                            {comment.sub && <HtmlText value={`<sub>${comment.sub}</sub>`} />}

                            <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <HtmlText value={`${alias}<info>${comment.created_at ? relativeTime(comment.created_at) : ''}</info>`} />
                                <HtmlText value={`<info>ID: ${comment.id}</info>`} />
                            </Row>

                            {img &&
                                <Col>
                                    <HtmlText value={`<info>Attachment: ${comment.file_name || comment.media_name}.${comment.media_ext}</info>`} />
                                    {comment.media_size && <HtmlText value={`<info>Size: ${filesize(comment.media_size)} </info>`} />}
                                </Col>}
                        </Col>
                    </Row>

                    {comment.com &&
                        <Col style={{ marginTop: 8 }}>
                            <HtmlText value={`<com>${comment.com}</com>`} onLinkPress={(url) => {
                                if (url.startsWith('#')) { url = url.slice(2); }
                                const quoted = comments.find(c => c.id === Number(url));
                                if (quoted) {
                                    setRepliesStack([...repliesStack, [quoted]]);
                                } else {
                                    Linking.openURL(url);
                                }
                            }} />
                        </Col>}
                </Col>
            </Pressable>

            {replies.length > 0 &&
                <Row>
                    <Row style={{
                        flex: 1,
                        borderColor: 'red',
                        overflow: 'hidden',
                    }}>
                        <TouchableNativeFeedback
                            onPress={() => setRepliesStack([...repliesStack, replies])}>
                            <Row style={{
                                flex: 1,
                                backgroundColor: theme.colors.viewReplies,
                                padding: 6,
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <HtmlText value={`<replies>View ${replies.length} ${reply}</replies>`} />
                                <ThemedIcon name='chevron-down-outline' size={20} color={theme.colors.text} />
                            </Row>
                        </TouchableNativeFeedback>
                    </Row>
                </Row>}
        </Col>
    </Col>;
}, (prevProps, nextProps) => {
    return prevProps.index === nextProps.index &&
        prevProps.comment === nextProps.comment &&
        prevProps.comments === nextProps.comments &&
        prevProps.selectedComment === nextProps.selectedComment;
});
const CreateCommentForm = ({ setCreateComment, form, setForm }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const thread = state.history.at(-1);
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [viewMode, setViewMode] = React.useState(2);
    const handleSize = 32;

    if (temp.isUploadingComment) {
        return <Row style={{
            borderTopWidth: 1,
            padding: 10,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.background,
            gap: 10,
            alignItems: 'center',
        }}>
            <ActivityIndicator size='large' />
            <ThemedText content={'Uploading your comment...'} />
        </Row>
    }

    return <Col style={{
        backgroundColor: theme.colors.background,
        maxHeight: '50%',
        height: viewMode === 2 ? '50%' : undefined
    }}>
        <Col style={{
            position: 'absolute',
            borderColor: theme.colors.primary,
            borderTopWidth: 1,
            height: handleSize,
            top: -handleSize,
            width: width,
            backgroundColor: theme.colors.card, overflow: 'hidden'
        }}>
            <TouchableNativeFeedback onPress={() => {
                setViewMode(prev => (prev + 1) % 3);
            }}>
                <Col style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {viewMode === 2 ?
                        <ThemedIcon name='chevron-down-outline' size={handleSize} /> :
                        <ThemedIcon name='chevron-up-outline' size={handleSize} />
                    }
                </Col>
            </TouchableNativeFeedback>
        </Col>
        {form.media &&
            <Col style={{ marginTop: 10, marginLeft: 10, marginRight: 10, }}>
                <Row>
                    <TouchableHighlight onPress={() => {
                        setTemp(prev => ({ ...prev, selectedLocalMedia: form.media }));
                    }}>
                        <Image src={form.media.path} resizeMode='contain' style={{ width: 100, height: 100, borderRadius: config.borderRadius, }} />
                    </TouchableHighlight>
                    <Col style={{ flex: 1, paddingLeft: 10, justifyContent: 'space-between' }}>
                        <Col>
                            <ThemedText content={`Name: ${form.media.path.split('/').pop()}`} />
                            {temp.formMediaError !== null ?
                                <ThemedText style={{ color: theme.colors.danger }} content={`Size: ${filesize(form.media.size)} (${temp.formMediaError})`} /> :
                                <ThemedText content={`Size: ${filesize(form.media.size)}`} />
                            }
                            <ThemedText content={`Type: ${form.media.mime}`} />
                        </Col>
                        <TouchableNativeFeedback onPress={() => {
                            setForm({ ...form, media: null });
                        }}>
                            <Col style={{ padding: 10, width: '30%', alignItems: 'center', backgroundColor: theme.colors.danger, borderRadius: config.borderRadius }}>
                                <ThemedText content={`Remove`} />
                            </Col>
                        </TouchableNativeFeedback>
                    </Col>
                </Row>
            </Col>}

        <Col style={{ padding: 10, gap: 10, }}>
            {viewMode > 0 &&
                <Col style={{ borderRadius: config.borderRadius, overflow: 'hidden' }}>
                    <TextInput
                        value={form.data.alias || ''}
                        style={{
                            backgroundColor: theme.colors.highlight,
                            fontSize: 16 * config.uiFontScale,
                            paddingLeft: 20,
                            color: theme.colors.text
                        }}
                        placeholder='Name (Optional)'
                        onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                    />
                </Col>
            }

            <Row style={{
                borderRadius: config.borderRadius,
                overflow: 'hidden',
                backgroundColor: theme.colors.highlight
            }}>
                <Col>
                    <TouchableNativeFeedback onPress={() => {
                        ImageCropPicker.openPicker({
                            mediaType: 'any',
                            multiple: false
                        }).then((media) => {
                            const fsize = media.size;
                            const maxSize = getCurrFullBoard(state).max_file_size;
                            if (fsize > maxSize) {
                                setTemp(prev => ({ ...prev, formMediaError: `File is too big, max is ${filesize(maxSize)}` }));
                            }
                            setForm({ ...form, media });
                        });
                    }}>
                        <Col style={{ padding: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ThemedIcon name={'attach'} size={22} />
                        </Col>
                    </TouchableNativeFeedback>

                </Col>
                <TextInput
                    value={form.data.com || ''}
                    style={{
                        flex: 1,
                        padding: 10,
                        fontSize: 16 * config.uiFontScale,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.highlight
                    }}
                    placeholder='Comment (max 2000 chars)'
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
                <Col>
                    <TouchableNativeFeedback onPress={async () => {
                        const data = form;
                        setForm(getDefaultForm(config, thread))
                        await uploadComment(state, setState, setTemp, data);
                        setCreateComment(false);
                        await loadComments(state, setTemp, true);
                        if (config.autoWatchThreads) {
                            if (!state.watching.some(item => item.threadId === thread.id)) {
                                setState(prev => ({
                                    ...prev, watching: [...prev.watching, {
                                        thread,
                                        last: temp.comments.length,
                                        new: 0,
                                        you: 0
                                    }]
                                }))
                            }
                        }
                    }}>
                        <Col style={{ padding: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ThemedIcon name={'send'} size={22} />
                        </Col>
                    </TouchableNativeFeedback>
                </Col>
            </Row>
        </Col>
    </Col >;
};
const ThreadInfo = () => {
    const { state } = React.useContext(Ctx);
    const thread = state.history.at(-1);

    return <FooterList child={<Col>
        <ThemedText content={`Replies: ${thread.replies}`} />
        <ThemedText content={`Images: ${thread.images}`} />
    </Col>} />;
};
const CommentMenu = ({ selectedComment, setSelectedComment }) => {
    const { state, setState, temp, config } = React.useContext(Ctx);
    const isMine = state.myComments.includes(selectedComment.id);
    const items = [
        ['Quote', 'chatbox', () => {
            setSelectedComment(null)
        }],
        ['Quote whole comment', 'chatbox-ellipses', () => {
            setSelectedComment(null)
        }],
        ['Copy', 'copy', () => {
            // todo
            setSelectedComment(null)
        }],
        [isMine ? 'Unmark as yours' : 'Mark as yours', isMine ? 'arrow-undo' : 'checkmark', () => {
            if (isMine) {
                setState({ ...state, myComments: state.myComments.filter(item => item !== selectedComment.id) })
            }
            else {
                setState({ ...state, myComments: [...state.myComments, selectedComment.id] })
            }
            setSelectedComment(null)
        }],
    ];

    if (!config.loadFaster) {
        items.push(['Jump to comment', 'arrow-right', () => {
            const index = temp.comments.findIndex(item => item.id === selectedComment.id);
            if (index >= 0) {
                temp.threadReflist.current?.scrollToIndex({ animated: true, index });
            }
            setSelectedComment(null)
        }]);
    }

    return <ModalMenu
        visible={selectedComment !== null}
        onClose={() => { setSelectedComment(null); }}
        items={items} />
};