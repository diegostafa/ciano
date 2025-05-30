import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, BackHandler, Button, FlatList, Image, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { BAR_HEIGHT, BAR_WIDTH, Ctx } from '../../app';
import { catalogModes, catalogSorts, loadBoards, State } from '../../context/state';
import { loadThreads } from '../../context/temp';
import { Repo } from '../../data/repo';
import { Fab, getCurrBoard, HeaderIcon, historyAdd, HtmlText, ModalAlert, ModalMediaPreview, ModalMenu, ModalView, ThemedIcon, ThemedText } from '../../utils';
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
    const theme = useTheme();
    const [filter, setFilter] = React.useState('');

    if (state.activeBoards.length === 0) {
        return <View style={{ flex: 1 }}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(SETUP_BOARDS_KEY) }}>
                <View style={{ flex: 1 }}>
                    <ThemedText content={'Setup boards\nTap here'} />
                </View>
            </TouchableNativeFeedback></View>;
    }

    if (!state.board) {
        return undefined;
    }

    const board = getCurrBoard(state);
    const activeBoards = state.activeBoards.map(boardId => state.boards.find(item => item.code === boardId));
    const inputStyle = {
        flex: 1,
        padding: 10,
        fontSize: 16,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
    };

    return <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        <TouchableNativeFeedback onPress={() => setSelectBoard(true)}>
            <View>
                <ThemedText content={`/${board.code}/`} />
                <ThemedText content={`${board.name}`} />
            </View>
        </TouchableNativeFeedback>

        <ModalView
            visible={selectBoard}
            onClose={() => setSelectBoard(false)}
            content={
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                        <View style={{ flex: 1, }}>
                            <TextInput
                                onChangeText={text => setFilter(text)}
                                value={filter}
                                placeholder='Search...'
                                style={inputStyle} />

                        </View>
                        <TouchableNativeFeedback onPress={() => {
                            setSelectBoard(false);
                            sailor.navigate(SETUP_BOARDS_KEY);
                        }}>
                            <View style={{ padding: 15 }}>
                                <ThemedIcon name={'settings'} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <FlatList
                        keyExtractor={item => item.code}
                        data={activeBoards.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))}
                        renderItem={({ item }) => {
                            return <TouchableNativeFeedback onPress={async () => {
                                const newState = { ...state, board: item.code };
                                setState(newState);
                                setSelectBoard(false);
                                await loadThreads(newState, setTemp, true);
                            }}>
                                <View style={{ padding: 15 }}>
                                    <ThemedText content={`/${item.code}/ - ${item.name}`} />
                                </View>
                            </TouchableNativeFeedback>
                        }}
                    />
                </View>} />
    </View >;
};
export const CatalogHeaderRight = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);
    const [catalogActions, setCatalogActions] = React.useState(false);
    const [sortActions, setSortActions] = React.useState(false);

    if (!state.board) { return undefined; }

    const nextCatalogMode = (state.catalogViewMode + 1) % 2;
    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name={'search'} onPress={() => setTemp({ ...temp, catalogFilter: '' })} />
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
                    ['reverse...', 'reverse', () => {
                        setCatalogActions(false);
                        setState({ ...state, catalogRev: !state.catalogRev });
                        setTemp({ ...temp, threads: temp.threads.reverse() });
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
                        setState({ ...state, catalogSort: index });
                        setTemp({ ...temp, threads: temp.threads.sort(sort) });
                        await State.set('catalogSort', index);
                    }]
                })}
            />}
    </View>;
};
export const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState, temp, setTemp, } = React.useContext(Ctx);
    const [showImageActions, setShowImageActions] = React.useState(false);
    const [noConnectionModal, setNotConnectionModal] = React.useState(false);
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
        setTemp(prev => ({ ...prev, catalogReflist: state.catalogViewMode === 0 ? listref : gridref }))
    }, [state.catalogViewMode, setTemp]);

    React.useEffect(() => {
        if (!state.boards && !temp.isFetchingBoards) {
            console.log('loading boards');
            loadBoards(state, setState, setTemp, true);
            return;
        }
        if (!state.board) {
            if (state.activeBoards.length > 0) {
                console.log('selecting first board');
                setState({ ...state, board: state.activeBoards[0] });
            }
            return;
        }

        if (!temp.threads && !temp.isFetchingThreads) {
            console.log('loading threads');
            loadThreads(state, setTemp, true);
            return;
        }
    }, [state, setState, setTemp, temp.threads, temp]);

    if (temp.isFetchingBoards) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ThemedText content={'TODO: COOL IMAGE'} />
            <ActivityIndicator />
        </View>;
    }
    if (temp.noConnection && !state.boards) {
        return <View>
            <ThemedText content={'This board doesn\'t have any cached thread, try another board'} />
        </View>
    }
    if (state.activeBoards.length === 0) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'Uhmm, it\'s rather empty in here...'} />
            <ThemedText content={'You should try to enable at least one board'} />
        </View>
    }
    if (temp.threadsFetchError) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'FETCH ERROR'} />
            <ThemedText content={'TODO: SAD IMAGE'} />
            <Button title={'Retry'} onPress={async () => { await loadThreads(state, setTemp, true); }} />
        </View>;
    }
    if (temp.isFetchingThreads || !temp.threads) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            <View>
                <ThemedText content={'Fetching your threads!'} />
                <ThemedText content={'This might take a bit of time'} />
                <ThemedText content={'TODO: COOL IMAGE'} />
            </View>

        </View>;
    }

    return <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {temp.catalogFilter !== null &&
            <View style={{ height: 30, flex: 1, borderWidth: 1, borderColor: 'red', flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                    value={temp.catalogFilter}
                    onChangeText={text => setTemp({ ...temp, catalogFilter: text })}
                    style={{
                        backgroundColor: theme.colors.highlight,
                        fontSize: 16,
                        padding: 10,
                        color: theme.colors.text,
                        flex: 1,
                    }}
                />
            </View>
        }


        {catalogModes[state.catalogViewMode] === 'list' ?
            <ListCatalog width={width} height={height} /> :
            <GridCatalog width={width} height={height} />}
        <Fab onPress={() => { sailor.navigate(CREATE_THREAD_KEY); }} />

        <ModalMediaPreview />

        <ModalMenu
            visible={showImageActions}
            onClose={() => setShowImageActions(false)}
            items={[
                ['Save...', () => { }],
                ['Download', () => { }],
                ['Download', () => { }],
                ['Download', () => { }],
            ]} />
        <ModalAlert
            msg={'It seems like there is no connection :(\n\nYou can still use the app but you won\'t be able to get or create new content.'}
            visible={noConnectionModal && state.showNoConnectionNotice}
            onClose={() => { setNotConnectionModal(false); }}
            left={'Don\'t show this again'}
            right={'Ok'}
            onPressLeft={() => {
                setNotConnectionModal(false);
                setState({ ...state, showNoConnectionNotice: false });
            }}
            onPressRight={() => { setNotConnectionModal(false); }}
        />
    </View>;
};

const NoThreads = () => {
    return <View style={{ flex: 1 }}>
        <ThemedText content={'This is rather empty, there are no threads in this board, did you filter them out?'} />
    </View>;

};
const GridCatalog = ({ width, height }) => {
    const { state, temp, setTemp, config } = React.useContext(Ctx);
    const isVertical = width < height;
    let tw;
    let th;

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
            removeClippedSubviews={true}
            numColumns={config.catalogGridCols}
            data={temp.threads}
            renderItem={({ item, index }) => <GridTile thread={item} index={index} tw={tw} th={th} />}
            keyExtractor={(item) => item.id}
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
        removeClippedSubviews={true}
        numColumns={config.catalogGridColsLandscape}
        data={temp.threads}
        renderItem={({ item, index }) => <GridTile thread={item} index={index} tw={tw} th={th} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => await loadThreads(state, setTemp, true)}
        refreshing={temp.isFetchingThreads}
        ListEmptyComponent={<NoThreads />}
        ListFooterComponent={CatalogFooter}
    />;
}
const ListCatalog = ({ width, height }) => {
    const { state, temp, setTemp, config } = React.useContext(Ctx);
    const tw = width;
    const th = (height - (BAR_HEIGHT * 2)) / config.catalogListRows;
    console.log(temp.threads);
    return <FlatList
        key={1}
        ref={temp.catalogReflist}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={50}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        data={temp.threads}
        renderItem={({ item, index }) => <ListTile thread={item} index={index} tw={tw} th={th} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => await loadThreads(state, setTemp, true)}
        refreshing={temp.isFetchingThreads}
        // ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<NoThreads />}
        ListFooterComponent={CatalogFooter}
    />;
};
const GridTile = ({ thread, index, tw, th }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const img = Repo.media.thumb(thread);
    const lastThread = state.history.at(-1);

    return <View style={{
        width: tw,
        height: th,
        padding: 3,
        overflow: 'hidden',
    }}>
        {config.showCatalogThumbnails &&
            <TouchableNativeFeedback
                onPress={() => { setTemp({ ...temp, selectedMediaComment: thread }); }}>
                <Image src={img}
                    resizeMode="contain"
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
            onPress={async () => {
                const history = await historyAdd(state, thread)
                setState({ ...state, history });
                sailor.navigate(THREAD_KEY);
            }}>
            <View style={{
                flex: 1,
                justifyContent: 'space-between',
                backgroundColor: lastThread && lastThread.thread.id === thread.id ? theme.colors.highlight : theme.colors.background,
                padding: 5,
                borderTopLeftRadius: config.showCatalogThumbnails ? 0 : config.borderRadius,
                borderTopRightRadius: config.showCatalogThumbnails ? 0 : config.borderRadius,
                borderBottomLeftRadius: config.borderRadius,
                borderBottomRightRadius: config.borderRadius,
            }}>
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HtmlText value={`<sub>${thread.sub}</sub>`} />}
                    {thread.com && <HtmlText value={`<com>${thread.com}</com>`} />}
                </View>

                <View style={{ marginTop: 10 }}>
                    <HtmlText value={`<info>${thread.replies}R, ${thread.images}I</info>`} />
                </View>
            </View>

        </TouchableNativeFeedback>

    </View>;
};
const ListTile = ({ thread, index, tw, th }) => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = Repo.media.thumb(thread);
    const theme = useTheme();
    const lastThread = state.history.at(-1);
    const imgH = th - 10;

    return <View style={{
        flex: 1,
        flexDirection: 'row',
        height: th,
        paddingBottom: 10,
        paddingLeft: 5,
        paddingRight: 5,
    }}>
        {config.showCatalogThumbnails &&
            <TouchableNativeFeedback
                onPress={() => { setTemp({ ...temp, selectedMediaComment: thread }); }}>
                <Image src={img}
                    resizeMode="contain"
                    style={{ borderRadius: config.borderRadius, width: imgH, height: imgH }} />
            </TouchableNativeFeedback>
        }

        <View style={{
            overflow: 'hidden',
            borderRadius: config.borderRadius,
            flex: 1,
            marginLeft: 5,
        }}>
            <TouchableNativeFeedback
                onPress={async () => {
                    setState({ ...state, history: await historyAdd(state, thread) });
                    sailor.navigate(THREAD_KEY);
                }}>
                <View style={{
                    flex: 1,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 8,
                    paddingRight: 8,
                    justifyContent: 'space-between',
                    backgroundColor: lastThread && lastThread.thread.id === thread.id ? theme.colors.highlight : theme.colors.background,
                }}>
                    <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                        {thread.sub && <HtmlText value={`<sub>${thread.sub}</sub>`} />}
                        {thread.com && <HtmlText value={`<com>${thread.com}</com>`} />}
                    </View>

                    <View style={{ marginTop: 7, justifyContent: 'flex-end' }}>
                        <HtmlText value={`<info>${thread.replies} Replies, ${thread.images} Images</info>`} />
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    </View>;
};
const CatalogFooter = () => {
    const { temp, config } = React.useContext(Ctx);
    return <View style={{
        flex: 1,
        height: 150,
        padding: 10,
        borderRadius: config.borderRadius,
        backgroundColor: config.card
    }}>
        <ThemedText content={`${temp.threads.length} Threads`} />
    </View>;
}