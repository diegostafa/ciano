import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { api } from './api';
import { CREATE_THREAD_KEY, Ctx, SETUP_BOARDS_KEY, THREAD_KEY } from './app';
import { Config, numToMode, numToSort } from './config';
import { loadBoards, loadThreads } from './state';
import { Fab, HeaderIcon, historyAdd, HtmlText, ModalMenu, ModalView, sortThreads, ThemedIcon, ThemedText } from './utils';

// --- public

export const CatalogHeaderLeft = () => {
    const navigation = useNavigation();
    return <HeaderIcon name='menu' onPress={() => navigation.openDrawer()} />;
};
export const CatalogHeaderTitle = () => {
    const { state, setState, setFlags } = React.useContext(Ctx);
    const sailor = useNavigation();
    const [selectBoard, setSelectBoard] = React.useState(false);
    const theme = useTheme();
    const [filter, setFilter] = React.useState('');

    if (state.activeBoards.length === 0) {
        return <TouchableNativeFeedback onPress={() => { sailor.navigate(SETUP_BOARDS_KEY) }}>
            <View style={{ flex: 1 }}>
                <ThemedText content={'Setup boards'} />
                <ThemedText content={'Tap here'} />
            </View>
        </TouchableNativeFeedback>;
    }
    if (!state.board) {
        return <View />;
    }

    const board = state.boards.find(item => item.code === state.board);
    const activeBoards = state.activeBoards.map(boardId => state.boards.find(item => item.code === boardId));
    const inputStyle = {
        flex: 1,
        padding: 10,
        fontSize: 16,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
    };

    return <View style={{ flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: 'green', overflow: 'hidden' }}>
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
                                setSelectBoard(false);
                                await loadThreads(newState, setState, setFlags);
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
    const { state, setState, flags, setFlags, config, setConfig } = React.useContext(Ctx);
    const [threadsActions, setThreadsActions] = React.useState(false);
    const [sortActions, setSortActions] = React.useState(false);

    if (!state.board) { return <View />; }

    const nextCatalogMode = (config.catalogMode + 1) % 2;
    return <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: 'white' }}>
        <HeaderIcon name={'search'} onPress={() => setFlags({ ...flags, catalogSearch: true })} />
        <HeaderIcon name='ellipsis-vertical' onPress={() => setThreadsActions(true)} />

        {threadsActions &&
            <ModalMenu
                visible={threadsActions}
                onClose={() => setThreadsActions(false)}
                items={[
                    ['Refresh', async () => {
                        setThreadsActions(false);
                        await loadThreads(state, setState, setFlags, true);
                    }],
                    ['Sort...', () => {
                        setThreadsActions(false);
                        setSortActions(true);
                    }],
                    [`View as ${numToMode[nextCatalogMode]}`, async () => {
                        setThreadsActions(false);
                        setConfig({ ...config, catalogMode: nextCatalogMode });
                        await Config.set('catalogMode', nextCatalogMode);
                    }],
                    ['Go top', async () => {
                        // todo
                    }],
                    ['Go bottom', async () => {
                        // todo
                    }],
                ]} />}

        {sortActions &&
            <ModalMenu
                visible={sortActions}
                onClose={() => setSortActions(false)}
                items={
                    [0, 1, 2].map(sortId => {
                        const sortName = numToSort[sortId];
                        return [sortName, async () => {
                            setSortActions(false);
                            setConfig({ ...config, catalogSort: sortId });
                            await Config.set('catalogSort', sortId);
                        }];
                    })} />}
    </View>;
};
export const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState, flags, setFlags, config } = React.useContext(Ctx);
    const sailor = useNavigation();
    const theme = useTheme();

    React.useEffect(() => {
        if (!state.boards) {
            console.log('loading boards');
            loadBoards(state, setState, setFlags, true);
            return;
        }
        if (!state.board) {
            if (state.activeBoards.length > 0) {
                console.log('selecting first board');
                setState({ ...state, board: state.activeBoards[0] });
            }
            return;
        }
        if (!state.threads) {
            console.log('loading threads');
            loadThreads(state, setState, setFlags, true);
            return;
        }

    }, [state, setState, setFlags]);



    if (flags.isFetchingBoards || !state.boards) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ActivityIndicator />
        </View>;
    }
    if (state.activeBoards.length === 0) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'Nothing to see here...'} />
            <ThemedText content={'Add a board to get started'} />
        </View>
    }
    if (flags.threadsFetchError) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'TODO: FETCH ERROR'} />
            <Button title={'Retry'} onPress={async () => {
                await loadThreads(state, setState, setFlags, true);
            }} />
        </View>;
    }
    if (flags.isFetchingThreads || !state.threads) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'FETCHING THREADS'} />
            <ActivityIndicator />
        </View>;
    }
    return <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {numToMode[config.catalogMode] === 'list' ?
            <ListCatalog width={width} height={height} /> :
            <GridCatalog width={width} height={height} />}

        <Fab onPress={() => { sailor.navigate(CREATE_THREAD_KEY); }} />
    </View>;
};

// --- sub components

const NoThreads = () => {
    return <View style={{ flex: 1 }}>
        <ThemedText content={'This is rather empty, there are no threads in this board, did you filter them out?'} />
    </View>;
};
const GridCatalog = ({ width, height }) => {
    const { state, setState, flags, setFlags, config } = React.useContext(Ctx);
    const tw = width / 3;
    const th = height / 3;
    return <FlatList
        key={0}
        numColumns={3}
        data={sortThreads(state.threads, config.sortMode, config.reverse)}
        renderItem={({ item }) => <GridTile thread={item} tw={tw} th={th} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => await loadThreads(state, setState, setFlags, true)}
        refreshing={flags.isFetchingThreads}
        ListEmptyComponent={<NoThreads />}
    />;
}
const ListCatalog = ({ width, height }) => {
    const { state, setState, flags, setFlags, config } = React.useContext(Ctx);
    const tw = width;
    const th = height / 8;
    return <FlatList
        key={1}
        data={sortThreads(state.threads, config.sortMode, config.reverse)}
        renderItem={({ item }) => <ListTile thread={item} tw={tw} th={th} />}
        keyExtractor={(item) => item.id}
        onRefresh={async () => await loadThreads(state, setState, setFlags, true)}
        refreshing={flags.isFetchingThreads}
        ListEmptyComponent={<NoThreads />}
    />;
};
const GridTile = ({ thread, tw, th }) => {
    const { state, setState } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const img = api.blu.media(thread);
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 8,
        height: th,
        margin: 4,
        backgroundColor: lastThread && lastThread.thread.id === thread.id ? theme.colors.highlight : theme.colors.card,
        overflow: 'hidden',
    };

    return <View style={threadTileStyle}>
        <TouchableNativeFeedback
            onPress={() => {
                console.log('todo: open gallery');
            }}>
            <Image src={img} style={{
                width: '100%',
                height: th / 3,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            }} />
        </TouchableNativeFeedback>

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
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
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
const ListTile = ({ thread, tw, th }) => {
    const { state, setState } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = api.blu.media(thread);
    const theme = useTheme();
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        flex: 1,
        flexDirection: 'row',
        height: th,
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 5,
    };

    return <View style={threadTileStyle}>
        <TouchableNativeFeedback
            underlayColor='white'
            onPress={() => { }}>
            <Image src={img} style={{
                borderRadius: 10,
                width: th,
                height: th,
            }} />
        </TouchableNativeFeedback>

        <View style={{
            overflow: 'hidden',
            borderRadius: 10,
            flex: 1,
            marginLeft: 10,

        }}>

            <TouchableNativeFeedback
                onPress={async () => {
                    setState({ ...state, history: await historyAdd(state, thread) });
                    sailor.navigate(THREAD_KEY);
                }}>
                <View style={{
                    flex: 1,
                    padding: 10,
                    justifyContent: 'space-between',
                    backgroundColor: lastThread && lastThread.thread.id === thread.id ? theme.colors.highlight : theme.colors.background,
                }}>
                    <View style={{
                        flexShrink: 1,
                        overflow: 'hidden',

                    }}>
                        {thread.sub && <HtmlText value={`<sub>${thread.sub}</sub>`} />}
                        {thread.com && <HtmlText value={`<com>${thread.com}</com>`} />}
                    </View>

                    <View style={{
                        marginTop: 8,
                        justifyContent: 'flex-end',
                    }}>
                        <HtmlText value={`<info>${thread.replies} Replies, ${thread.images} Images</info>`} />
                    </View>
                </View>

            </TouchableNativeFeedback>
        </View>
    </View>;
};
