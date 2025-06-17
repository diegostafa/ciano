import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, BackHandler, Button, FlatList, Image, ScrollView, TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { BAR_HEIGHT, BAR_WIDTH, Ctx } from '../../app';
import { BoardInfo, Col, Fab, HeaderIcon, HtmlText, ModalAlert, ModalMediaPreview, ModalMenu, ModalView, Row, ThemedIcon, ThemedText } from '../../components';
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
    const { state, setState, setTemp } = React.useContext(Ctx);
    const sailor = useNavigation();
    const [selectBoard, setSelectBoard] = React.useState(false);
    const [showBoardInfo, setShowBoardInfo] = React.useState(false);
    const theme = useTheme();
    const [filter, setFilter] = React.useState('');

    if (state.activeBoards.length === 0) {
        return <Col style={{ flex: 1 }}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(SETUP_BOARDS_KEY) }}>
                <Col style={{ flex: 1 }}>
                    <ThemedText content={'Setup boards\nTap here'} />
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
        fontSize: 16,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
    };

    return <Row style={{ flex: 1, width: '100%', margin: 0, overflow: 'hidden' }}>
        <TouchableNativeFeedback
            onLongPress={() => { setShowBoardInfo(true) }}
            onPress={() => setSelectBoard(true)}>
            <Col style={{ flex: 1 }}>
                <ThemedText content={`/${board.code}/`} />
                <ThemedText content={`${board.name}`} />
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
        <HeaderIcon name={'search'} onPress={() => setTemp(prev => ({ ...prev, catalogFilter: '' }))} />
        <HeaderIcon name='ellipsis-vertical' onPress={() => setCatalogActions(true)} />

        {catalogActions &&
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
                    ['reverse', 'swap-vertical', () => {
                        setCatalogActions(false);
                        setTemp(prev => ({ ...prev, isComputingThreads: true }));
                        async function defer() {
                            setState({ ...state, catalogRev: !state.catalogRev });
                            setTemp(prev => ({ ...prev, threads: prev.threads.reverse(), isComputingThreads: false }));
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
                        temp.catalogReflist.current?.scrollToEnd({ animated: true, index: temp.threads.length - 1 });
                    }],
                ]} />}

        {sortActions &&
            <ModalMenu
                visible={sortActions}
                onClose={() => setSortActions(false)}
                items={catalogSorts.map(({ name, sort, icon }, index) => {
                    return [name, icon, async () => {
                        setSortActions(false);
                        setTemp(prev => ({ ...prev, isComputingThreads: true }));
                        async function defer() {
                            setState({ ...state, catalogSort: index });
                            setTemp(prev => ({ ...prev, threads: prev.threads.sort(sort), isComputingThreads: false }));
                            await State.set('catalogSort', index);
                        }
                        defer()

                    }, state.catalogSort === index]
                })}
            />}
    </Row>;
};
export const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState, temp, config, setTemp, } = React.useContext(Ctx);
    const [noConnectionModal, setNotConnectionModal] = React.useState(true);
    const [selectedThread, setSelectedThread] = React.useState(null);
    const sailor = useNavigation();
    const theme = useTheme();
    const listref = useRef();
    const gridref = useRef();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (temp.catalogFilter !== null) {
                    setTemp({ ...temp, catalogFilter: null });
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [temp, setTemp])
    );

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
            onClose={() => { setNotConnectionModal(false); }}
            left={'Ok, remember this'}
            right={'Ok'}
            onPressLeft={async () => {
                setNotConnectionModal(false);
                const newState = { ...state, showNoConnectionNotice: false };
                setState(newState);
                await State.save(newState);
            }}
            onPressRight={() => { setNotConnectionModal(false); }}
        />
    }
    if (hasBoardsErrors(temp)) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            {temp.boardsFetchErrorTimeout !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server is unreachable'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorRequest !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'Malformed request'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorResponse !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorUnknown !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an unknown error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </Col>
            }
        </Col>;
    }
    if (hasThreadsErrors(temp)) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            {temp.threadsFetchErrorTimeout !== null &&
                <Col>
                    <ThemedText content={'threadsfetcherror'} />
                    <ThemedText content={'The server is unreachable'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadThreads(state, setTemp, true); }} />
                </Col>
            }
            {temp.threadsFetchErrorRequest !== null &&
                <Col>
                    <ThemedText content={'threadsfetcherror'} />
                    <ThemedText content={'Malformed request'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadThreads(state, setTemp, true); }} />
                </Col>
            }
            {temp.threadsFetchErrorResponse !== null &&
                <Col>
                    <ThemedText content={'threadsfetcherror'} />
                    <ThemedText content={'The server returned an error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadThreads(state, setTemp, true); }} />
                </Col>
            }{
                temp.threadsFetchErrorUnknown !== null &&
                <Col>
                    <ThemedText content={'threadsfetcherror'} />
                    <ThemedText content={'The server returned an unknown error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadThreads(state, setTemp, true); }} />
                </Col>
            }
        </Col>;

    }
    if (temp.isComputingThreads) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            <ThemedText content={'sorting...'} />
        </Col>;
    }
    if (temp.isFetchingBoards) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ThemedText content={'TODO: COOL IMAGE'} />
            <ActivityIndicator />
        </Col>;
    }
    if (temp.isFetchingThreads) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            <Col>
                <ThemedText content={'Fetching your threads!'} />
                <ThemedText content={'This might take a bit of time'} />
                <ThemedText content={'TODO: COOL IMAGE'} />
            </Col>

        </Col>;
    }
    if (state.activeBoards.length === 0) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'Uhmm, it\'s rather empty in here...'} />
            <ThemedText content={'You should try to enable at least one board'} />
        </Col>
    }
    if (temp.threads === null) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
        </Col>;
    }

    const isWatching = state.watching.some(item => item.thread.id === selectedThread);


    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {temp.catalogFilter !== null &&
            <Row style={{
                backgroundColor: theme.colors.background,
                width: width,
                height: BAR_HEIGHT,
                justifyContent: 'space-between'
            }}>
                <TextInput
                    placeholder='Search in the catalog...'
                    value={temp.catalogFilter}
                    onChangeText={text => setTemp({ ...temp, catalogFilter: text })}
                    style={{
                        fontSize: 16,
                        padding: 10,
                        color: theme.colors.text,
                        flex: 1,
                    }}
                />
                <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, catalogFilter: null }); }} />
            </Row>
        }

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
            renderItem={({ item, index }) => <GridTile thread={item} index={index} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
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
        data={temp.threads}
        renderItem={({ item, index }) => <GridTile thread={item} index={index} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
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
        renderItem={({ item, index }) => <ListTile thread={item} index={index} tw={tw} th={th} setSelectedThread={setSelectedThread} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={async () => await loadThreads(state, setTemp, true)}
        refreshing={temp.isFetchingThreads}
        // ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<NoThreads />}
        ListFooterComponent={CatalogFooter}
    />;
};
const GridTile = ({ thread, index, tw, th, setSelectedThread }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const img = Repo(state.api).media.thumb(thread);
    const lastThread = state.history.at(-1);

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

                <Col style={{ marginTop: 10 }}>
                    <HtmlText value={`<info>${thread.replies}R, ${thread.images}I</info>`} />
                </Col>
            </Col>
        </TouchableNativeFeedback>
    </Col>;
};
const ListTile = ({ thread, index, tw, th, setSelectedThread }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = Repo(state.api).media.thumb(thread);
    const theme = useTheme();
    const lastThread = state.history.at(-1);
    const imgH = th - 10;

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
                    <Col style={{ marginTop: 7, justifyContent: 'flex-end' }}>
                        <HtmlText value={`<info>${thread.replies} ${thread.replies === 1 ? 'Reply' : 'Replies'}, ${thread.images} ${thread.images === 1 ? 'Image' : 'Images'}</info>`} />
                    </Col>
                </Col>
            </TouchableNativeFeedback>
        </Col>
    </Row>;
};
const CatalogFooter = () => {
    const { temp, config } = React.useContext(Ctx);
    return <Col style={{
        flex: 1,
        height: 150,
        padding: 10,
        borderRadius: config.borderRadius,
        backgroundColor: config.card
    }}>
        <ThemedText content={`${temp.threads.length} Threads`} />
    </Col>;
}