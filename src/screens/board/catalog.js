import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useRef } from 'react';
import { FlatList, Image, ScrollView, TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { SearchBar } from 'react-native-screens';

import { BAR_HEIGHT, BAR_WIDTH, Ctx } from '../../app';
import { BoardInfo, Col, Fab, HeaderIcon, HeaderThemedText, HtmlText, ModalAlert, ModalMediaPreview, ModalMenu, ModalView, Row, ThemedAsset, ThemedIcon, ThemedText, UpdateGap } from '../../components';
import { catalogModes, catalogSorts, State } from '../../context/state';
import { hasBoardsErrors, hasThreadsErrors, isOnline } from '../../context/temp';
import { Repo } from '../../data/repo';
import { loadBoards, loadThreads } from '../../data/utils';
import { getCurrFullBoard, historyAdd, threadContains } from '../../helpers';
import { CREATE_THREAD_KEY } from './create_thread';
import { SETUP_BOARDS_KEY } from './setup_boards';
import { THREAD_KEY } from './thread';

export const CATALOG_KEY = 'Catalog';

export const CatalogHeaderLeft = () => {
    const navigation = useNavigation();
    return <HeaderIcon name='menu' onPress={() => navigation.openDrawer()} />;
};
export const CatalogHeaderTitle = () => {
    const { state, setState, setTemp, config } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
    const sailor = useNavigation();
    const [selectBoard, setSelectBoard] = React.useState(false);
    const [showBoardInfo, setShowBoardInfo] = React.useState(false);
    const theme = useTheme();
    const [filter, setFilter] = React.useState('');

    if (state.activeBoards.length === 0) {
        return <Col style={{ flex: 1 }}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(SETUP_BOARDS_KEY) }}>
                <Col style={{ flex: 1 }}>
                    <HeaderThemedText content={'Setup boards'} />
                    <ThemedText content={'Tap here'} />
                </Col>
            </TouchableNativeFeedback></Col>;
    }

    if (!state.board) {
        return undefined;
    }

    const board = getCurrFullBoard(state);
    const activeBoards = state.activeBoards.map(boardId => state.boards.find(item => item.code === boardId));
    const inputStyle = {
        flex: 1,
        padding: 10,
        fontSize: 16 * config.uiFontScale,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
    };

    const iconsWidth = (26 + 20) * 3;
    return <Row style={{ width: width - iconsWidth, margin: 0, overflow: 'hidden' }}>
        <TouchableNativeFeedback
            onLongPress={() => { setShowBoardInfo(true) }}
            onPress={() => setSelectBoard(true)}>
            <Col style={{ flex: 1 }}>
                <HeaderThemedText style={{ textAlign: 'center' }} content={`/${board.code}/`} />
                <ThemedText style={{ textAlign: 'center' }} content={`${board.name}`} />
            </Col>
        </TouchableNativeFeedback>

        <ModalView
            visible={showBoardInfo}
            onClose={() => setShowBoardInfo(false)}
            content={
                <ScrollView>
                    <BoardInfo board={board} />
                </ScrollView>
            } />

        <ModalView
            visible={selectBoard}
            onClose={() => setSelectBoard(false)}
            content={
                <Col>
                    <Row style={{ justifyContent: 'space-between' }} >
                        <Col style={{ flex: 1, }}>
                            <TextInput
                                onChangeText={text => setFilter(text)}
                                value={filter}
                                placeholder='Search for an active board...'
                                style={inputStyle} />
                        </Col>
                        <TouchableNativeFeedback onPress={() => {
                            setSelectBoard(false);
                            sailor.navigate(SETUP_BOARDS_KEY);
                        }}>
                            <Col style={{ padding: 10 }}>
                                <ThemedIcon name={'settings'} />
                            </Col>
                        </TouchableNativeFeedback>
                    </Row>
                    <FlatList
                        ListEmptyComponent={<Col style={{ padding: 10 }}>
                            <ThemedText content={'No boards found'} />
                        </Col>}
                        keyExtractor={item => item.code}
                        data={activeBoards.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => a.code.localeCompare(b.code))}
                        renderItem={({ item }) => {

                            return <TouchableNativeFeedback onPress={async () => {
                                const newState = { ...state, board: item.code };
                                setState(newState);
                                setSelectBoard(false);
                                await loadThreads(newState, setTemp, true);
                            }}>
                                <Col style={{ padding: 15, backgroundColor: item.code === state.board ? theme.colors.highlight : undefined }}>
                                    <ThemedText content={`/${item.code}/ - ${item.name}`} />
                                </Col>
                            </TouchableNativeFeedback>
                        }}
                    />
                </Col>} />
    </Row >;
};
export const CatalogHeaderRight = () => {
    const { state, setState, temp, setTemp, } = React.useContext(Ctx);
    const [catalogActions, setCatalogActions] = React.useState(false);
    const [sortActions, setSortActions] = React.useState(false);

    if (!state.board) { return undefined; }

    const nextCatalogMode = (state.catalogViewMode + 1) % 2;
    return <Row >
        {temp.catalogFilter === null && <HeaderIcon name={'search'} onPress={() => setTemp(prev => ({ ...prev, catalogFilter: '' }))} />}
        <HeaderIcon name='ellipsis-vertical' onPress={() => setCatalogActions(true)} />

        <ModalMenu
            visible={catalogActions}
            onClose={() => setCatalogActions(false)}
            items={[
                ['Refresh', 'refresh', async () => {
                    setCatalogActions(false);
                    await loadThreads(state, setTemp, true);
                },],
                ['Sort...', "options", () => {
                    setCatalogActions(false);
                    setSortActions(true);
                }],
                [state.catalogRev ? 'reverse (currently on)' : 'reverse', 'swap-vertical', () => {
                    setCatalogActions(false);
                    setTemp(prev => ({ ...prev, isComputingThreads: true }));
                    async function defer() {
                        setState({ ...state, catalogRev: !state.catalogRev });
                        setTemp(prev => ({ ...prev, threads: [...prev.threads].reverse(), isComputingThreads: false }));
                    }
                    defer()
                }],
                [`View as ${catalogModes[nextCatalogMode]}`, catalogModes[nextCatalogMode], async () => {
                    setCatalogActions(false);
                    setState({ ...state, catalogViewMode: nextCatalogMode });
                    await State.set('catalogViewMode', nextCatalogMode);
                }],
                ['Go top', 'arrow-up', async () => {
                    setCatalogActions(false);
                    temp.catalogReflist.current?.scrollToIndex({ animated: true, index: 0 });
                }],
                ['Go bottom', 'arrow-down', async () => {
                    setCatalogActions(false);
                    temp.catalogReflist.current?.scrollToEnd({ animated: true });
                }],
            ]} />

        <ModalMenu
            visible={sortActions}
            onClose={() => setSortActions(false)}
            items={catalogSorts.map(({ name, sort, icon }, index) => {
                return [name, icon, async () => {
                    setSortActions(false);
                    setTemp(prev => ({ ...prev, isComputingThreads: true }));
                    async function defer() {
                        setState({ ...state, catalogSort: index });
                        setTemp(prev => ({ ...prev, threads: [...prev.threads].sort(sort), isComputingThreads: false }));
                        await State.set('catalogSort', index);
                    }
                    defer()

                }, state.catalogSort === index]
            })}
        />
    </Row>;
};
export const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState, temp, config, setTemp, } = React.useContext(Ctx);
    const [noConnectionModal, setNoConnectionModal] = React.useState(true);
    const [selectedThread, setSelectedThread] = React.useState(null);
    const sailor = useNavigation();
    const theme = useTheme();
    const listref = useRef();
    const gridref = useRef();

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (temp.catalogFilter !== null) {
                setTemp(prev => ({ ...prev, catalogFilter: null }));
                e.preventDefault();
                return;
            }
            return;

        });
        return unsubscribe;

    }, [sailor, setTemp, temp.catalogFilter]);

    React.useEffect(() => {
        setTemp(prev => ({
            ...prev,
            catalogReflist: state.catalogViewMode === 0 ? listref : gridref
        }))
    }, [state.catalogViewMode, setTemp]);

    React.useEffect(() => {
        if (hasBoardsErrors(temp) || hasThreadsErrors(temp)) {
            return;
        }
        if (temp.isFetchingBoards) {
            return;
        }
        if (!state.boards) {
            loadBoards(state, setState, setTemp, true);
            return;
        }
        if (!state.board) {
            if (state.activeBoards.length > 0) {
                setState({ ...state, board: state.activeBoards[0] });
            }
            return;
        }
        if (temp.isFetchingThreads) {
            return;
        }
        if (!temp.threads) {
            loadThreads(state, setTemp, true);
            return;
        }
    }, [state, setState, setTemp, temp.threads, temp, config]);

    if (!isOnline(temp) && noConnectionModal && state.showNoConnectionNotice) {
        return <ModalAlert
            msg={'It looks like you are offline :(\nYou can still use the app, but with limited functionalities'}
            noBackdrop
            visible={noConnectionModal && state.showNoConnectionNotice}
            onClose={() => { setNoConnectionModal(false); }}
            left={'Ok, remember this'}
            right={'Ok'}
            onPressLeft={async () => {
                setNoConnectionModal(false);
                const newState = { ...state, showNoConnectionNotice: false };
                setState(newState);
                await State.save(newState);
            }}
            onPressRight={() => { setNoConnectionModal(false); }}
        />
    }
    if (temp.boardsFetchErrorTimeout !== null) {
        return <ThemedAsset
            msg={'The server is unreachable'}
            name={"error"}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }}
        />;
    }
    if (temp.boardsFetchErrorRequest !== null) {
        return <ThemedAsset
            msg={'Malformed request'}
            name={"error"}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }}
        />;
    }
    if (temp.boardsFetchErrorResponse !== null) {
        return <ThemedAsset
            msg={'The server returned an error'}
            name={"error"}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }}
        />;
    }
    if (temp.boardsFetchErrorUnknown !== null) {
        return <ThemedAsset
            msg={'Unknown error'}
            name={"error"}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }}
        />;
    }
    if (temp.threadsFetchErrorTimeout !== null) {
        return <ThemedAsset
            msg={'The server is unreachable'}
            name={"error"}
            retry={async () => { await loadThreads(state, setTemp, true); }}
        />;
    }
    if (temp.threadsFetchErrorRequest !== null) {
        return <ThemedAsset
            msg={'Malformed request'}
            name={"error"}
            retry={async () => { await loadThreads(state, setTemp, true); }}
        />;
    }
    if (temp.threadsFetchErrorResponse !== null) {
        return <ThemedAsset
            msg={'The server returned an error'}
            name={"error"}
            retry={async () => { await loadThreads(state, setTemp, true); }}
        />;
    }
    if (temp.threadsFetchErrorUnknown !== null) {
        return <ThemedAsset
            msg={'The server returned an unknown error'}
            name={"error"}
            retry={async () => { await loadThreads(state, setTemp, true); }}
        />;
    }
    if (temp.isComputingThreads) {
        return <ThemedAsset name={"placeholder"} msg={"Sorting in your threads"} />;
    }
    if (temp.isFetchingBoards) {
        return <ThemedAsset name={"placeholder"} msg={"Loading your boards"} loading />;
    }
    if (temp.isFetchingThreads) {
        return <ThemedAsset name={"placeholder"} msg={"Loading your threads!\nThis might take a bit of time"} loading />;
    }
    if (state.activeBoards.length === 0) {
        return <ThemedAsset name={"placeholder"} msg={"It is rather empty in here...\nYou should try to enable at least one board!"} />;
    }
    if (temp.threads === null) {
        return <UpdateGap />;
    }

    const isWatching = selectedThread !== null && state.watching.some(item => item.thread.id === selectedThread.id);
    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {temp.catalogFilter !== null && <SearchBar
            placeholder='Search for a thread...'
            value={temp.catalogFilter}
            onChangeText={text => setTemp(prev => ({ ...prev, catalogFilter: text }))}
            onClose={() => { setTemp(prev => ({ ...prev, catalogFilter: null })); }}
        />}

        <ModalMenu
            visible={selectedThread !== null}
            onClose={() => { setSelectedThread(null); }}
            items={[
                (isWatching ?
                    ["Unwatch", "eye-off", () => {
                        setState(prev => ({ ...prev, watching: prev.watching.filter(item => item.thread.id !== selectedThread.id) }));
                        setSelectedThread(null);
                    }] :
                    ["watch", "eye", () => {
                        setState(prev => ({
                            ...prev, watching: [...prev.watching, {
                                thread: selectedThread,
                                last: selectedThread.replies,
                                new: 0,
                                you: 0,
                            }]
                        }));
                        setSelectedThread(null);
                    }
                    ])
            ]}
        />
        {catalogModes[state.catalogViewMode] === 'list' ?
            <ListCatalog width={width} height={height} setSelectedThread={setSelectedThread} /> :
            <GridCatalog width={width} height={height} setSelectedThread={setSelectedThread} />}

        {state.api.name === 'ciano' && <Fab onPress={() => { sailor.navigate(CREATE_THREAD_KEY); }} />}
        <ModalMediaPreview />
    </Col>;
};
const NoThreads = () => {
    const { temp } = React.useContext(Ctx);

    if (temp.catalogFilter === null) {
        return <Col style={{ flex: 1 }}>
            <ThemedText content={'There are no threads here, be the first one to post!'} />
        </Col>;
    }
    return <Col style={{ flex: 1 }}>
        <ThemedText content={'No threads found'} />
    </Col>;

};
const GridCatalog = ({ width, height, setSelectedThread }) => {
    const { state, temp, setTemp, config } = React.useContext(Ctx);
    const isVertical = width < height;
    let tw;
    let th;

    let threads = temp.threads;
    if (temp.catalogFilter !== null) {
        threads = threads.filter(thread => threadContains(thread, temp.catalogFilter));
    }

    if (isVertical) {
        tw = width / config.catalogGridCols;
        th = (height - (BAR_HEIGHT * 2)) / config.catalogGridRows;
    } else {
        tw = (width - BAR_WIDTH) / config.catalogGridColsLandscape;
        th = (height - BAR_HEIGHT) / config.catalogGridRowsLandscape;
    }

    if (isVertical) {
        return <FlatList
            key={0}
            ref={temp.catalogReflist}
            windowSize={10}
            initialNumToRender={10}
            maxToRenderPerBatch={50}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            numColumns={config.catalogGridCols}
            data={threads}
            renderItem={({ item }) => <GridTile thread={item} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
            keyExtractor={(item) => String(item.id)}
            onRefresh={async () => await loadThreads(state, setTemp, true)}
            refreshing={temp.isFetchingThreads}
            ListEmptyComponent={<NoThreads />}
            ListFooterComponent={CatalogFooter}
        />;
    }

    return <FlatList
        key={2}
        ref={temp.catalogReflist}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        numColumns={config.catalogGridColsLandscape}
        data={threads}
        renderItem={({ item, index }) => <GridTile thread={item} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={async () => await loadThreads(state, setTemp, true)}
        refreshing={temp.isFetchingThreads}
        ListEmptyComponent={<NoThreads />}
        ListFooterComponent={CatalogFooter}
    />;
}
const ListCatalog = ({ width, height, setSelectedThread }) => {
    const { state, temp, setTemp, config } = React.useContext(Ctx);
    const isVertical = width < height;
    let tw;
    let th;

    let threads = temp.threads;
    if (temp.catalogFilter !== null) {
        threads = threads.filter(thread => threadContains(thread, temp.catalogFilter));
    }

    if (isVertical) {
        tw = width;
        th = (height - (BAR_HEIGHT * 2)) / config.catalogListRows;
    } else {
        tw = (width - BAR_WIDTH);
        th = (height - BAR_HEIGHT) / config.catalogListRowsLandscape;
    }

    return <FlatList
        key={1}
        ref={temp.catalogReflist}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        data={threads}
        renderItem={({ item, index }) => <ListTile thread={item} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={async () => await loadThreads(state, setTemp, true)}
        refreshing={temp.isFetchingThreads}
        // ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<NoThreads />}
        ListFooterComponent={CatalogFooter}
    />;
};
const GridTile = ({ thread, tw, th, setSelectedThread }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const img = Repo(state.api).media.thumb(thread);
    const lastThread = state.history.at(-1);
    const isWatched = state.watching.some(item => item.thread.id === thread.id);


    return <Col style={{
        width: tw,
        height: th,
        padding: 3,
        overflow: 'hidden',
    }}>
        {config.showCatalogThumbnails &&
            <TouchableNativeFeedback
                onPress={() => { setTemp({ ...temp, selectedMediaComment: thread }); }}>
                <Image src={img}
                    style={{
                        width: '100%',
                        height: th / 3,
                        borderTopLeftRadius: config.borderRadius,
                        borderTopRightRadius: config.borderRadius,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    }} />
            </TouchableNativeFeedback>
        }

        <TouchableNativeFeedback
            onLongPress={() => { setSelectedThread(thread); }}
            onPress={async () => {
                historyAdd(state, setState, thread)
                sailor.navigate(THREAD_KEY);
            }}>
            <Col style={{
                flex: 1,
                justifyContent: 'space-between',
                backgroundColor: lastThread && lastThread.id === thread.id ? theme.colors.lastVisited : theme.colors.background,
                padding: 5,
                borderTopLeftRadius: config.showCatalogThumbnails ? 0 : config.borderRadius,
                borderTopRightRadius: config.showCatalogThumbnails ? 0 : config.borderRadius,
                borderBottomLeftRadius: config.borderRadius,
                borderBottomRightRadius: config.borderRadius,
            }}>
                <Col style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HtmlText value={`<sub>${thread.sub}</sub>`} />}
                    {thread.com && <HtmlText value={`<com>${thread.com}</com>`} />}
                </Col>

                <Row style={{ marginTop: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                    <HtmlText value={`<info>${thread.replies}R, ${thread.images}I</info>`} />
                    {isWatched && <Col><ThemedIcon name={"eye"} size={14} accent /></Col>}
                </Row>
            </Col>
        </TouchableNativeFeedback>
    </Col>;
};
const ListTile = ({ thread, th, setSelectedThread }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = Repo(state.api).media.thumb(thread);
    const theme = useTheme();
    const lastThread = state.history.at(-1);
    const imgH = th - 10;
    const isWatched = state.watching.some(item => item.thread.id === thread.id);

    return <Row style={{
        flex: 1,
        height: th,
        paddingBottom: 10,
        paddingLeft: 5,
        paddingRight: 5,
    }}>
        {config.showCatalogThumbnails &&
            <TouchableNativeFeedback
                onPress={() => { setTemp({ ...temp, selectedMediaComment: thread }); }}>
                <Image src={img}
                    style={{ borderRadius: config.borderRadius, width: imgH, height: imgH }} />
            </TouchableNativeFeedback>
        }

        <Col style={{
            overflow: 'hidden',
            borderRadius: config.borderRadius,
            flex: 1,
            marginLeft: 5,
        }}>
            <TouchableNativeFeedback
                onLongPress={() => { setSelectedThread(thread); }}
                onPress={async () => {
                    historyAdd(state, setState, thread);
                    sailor.navigate(THREAD_KEY);
                }}>
                <Col style={{
                    flex: 1,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 8,
                    paddingRight: 8,
                    justifyContent: 'space-between',
                    backgroundColor: lastThread && lastThread.id === thread.id ? theme.colors.lastVisited : theme.colors.background,
                }}>
                    <Col style={{ flexShrink: 1, overflow: 'hidden' }}>
                        {thread.sub && <HtmlText value={`<sub>${thread.sub}</sub>`} />}
                        {thread.com && <HtmlText value={`<com>${thread.com}</com>`} />}
                    </Col>
                    <Row style={{ marginTop: 7, justifyContent: 'space-between', alignItems: 'center' }}>
                        <HtmlText value={`<info>${thread.replies} ${thread.replies === 1 ? 'Reply' : 'Replies'}, ${thread.images} ${thread.images === 1 ? 'Image' : 'Images'}</info>`} />
                        {isWatched && <Col><ThemedIcon name={"eye"} size={14} accent /></Col>}
                    </Row>
                </Col>
            </TouchableNativeFeedback>
        </Col>
    </Row>;
};
const CatalogFooter = () => {
    const { temp, config } = React.useContext(Ctx);
    const theme = useTheme();
    return <Col style={{
        flex: 1,
        height: 150,
        padding: 10,
        borderRadius: config.borderRadius,
        backgroundColor: theme.colors.card
    }}>
        <ThemedText content={`${temp.threads.length} Threads`} />
    </Col>;
}