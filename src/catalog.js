import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';

import { api } from './api';
import { CREATE_THREAD_KEY, Ctx, SETUP_BOARDS_KEY, THREAD_KEY } from './app';
import { Config } from './config';
import { Repo } from './repo';
import { Fab, HeaderIcon, historyAdd, HtmlText, ThemedText } from './utils';

// --- public

export const CatalogHeaderLeft = () => {
    const navigation = useNavigation();
    return <HeaderIcon name='menu' onPress={() => navigation.openDrawer()} />;
};
export const CatalogHeaderTitle = () => {
    const { state } = React.useContext(Ctx);

    if (!state.board) {
        return <View>
            <ThemedText content={'Catalog'} />
        </View>;
    }

    return <View>
        <TouchableNativeFeedback>
            <ThemedText content={`${state.board}`} />
        </TouchableNativeFeedback>
    </View>;
};
export const CatalogHeaderRight = () => {
    const { state, setState, config, setConfig } = React.useContext(Ctx);
    if (!state.board) { return <View />; }

    const newMode = config.catalogMode === 'list' ? 'grid' : 'list';
    const icon = newMode === 'list' ? 'list' : 'grid'; // todo: find better icons

    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name='refresh' onPress={async () => await refreshBoard(state, setState)} />
        <HeaderIcon name={icon} onPress={async () => {
            await Config.set('catalogMode', newMode);
            setConfig({ ...config, catalogMode: newMode });
        }} />
        <HeaderIcon name='ellipsis-vertical' />
    </View>;
};
export const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState } = React.useContext(Ctx);
    const [fetchError, setFetchError] = React.useState(false);
    const sailor = useNavigation();
    const theme = useTheme();

    React.useEffect(() => {
        if (!state.board) {
            setBoards(state, setState);
        }
    }, [state, setState]);
    React.useEffect(() => {
        if (state.board && !state.boards[state.board]) {
            loadBoard(state, setState, setFetchError);
        }
    }, [state, setState]);

    if (!state.boards) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ActivityIndicator />
        </View>;
    }
    if (!state.board) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'Select a board to get started'} />
            <Button title={'Select'} onPress={() => {
                sailor.navigate(SETUP_BOARDS_KEY);
            }} />
        </View>
    }
    if (fetchError) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'TODO: FETCH ERROR'} />
            <Button title={'Retry'} onPress={() => {
                setFetchError(false);
                refreshBoard(state, setState, setFetchError);
            }} />
        </View>;
    }
    if (!state.boards[state.board]) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={'FETCHING THREADS'} />
            <ActivityIndicator />
        </View>;
    }

    return <View style={{ flex: 1, backgroundColor: theme.colors.card }}>
        <Threads state={state} setState={setState} setFetchError={setFetchError} width={width} height={height} />
        <Fab onPress={() => {
            sailor.navigate(CREATE_THREAD_KEY);
        }} />
    </View>;
};

// --- sub components

const Threads = ({ setFetchError, width, height }) => {
    const { state, setState, config } = React.useContext(Ctx);

    if (config.catalogMode === 'list') {
        const tw = width;
        const th = height / 8;
        return <FlatList
            key={'a'}
            data={state.boards[state.board]}
            renderItem={({ item }) => <ListTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
            keyExtractor={(item) => item.id}
            onRefresh={() => refreshBoard(state, setState, setFetchError)}
            refreshing={!state.boards[state.board]}
            ListEmptyComponent={<NoThreads />}
        />;
    }
    if (config.catalogMode === 'grid') {
        const tw = width / 3;
        const th = height / 3;
        return <FlatList
            key={'b'}
            numColumns={3}
            data={state.boards[state.board]}
            renderItem={({ item }) => <GridTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
            keyExtractor={(item) => item.id}
            onRefresh={() => refreshBoard(state, setState, setFetchError)}
            refreshing={!state.boards[state.board]}
            ListEmptyComponent={<NoThreads />}
        />;
    }
};
const NoThreads = () => {
    return <View style={{ flex: 1 }}>
        <ThemedText content={'NO THREADSS'} />
    </View>;
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
        width: tw - 4,
        height: th,
        marginBottom: 10,
        flexDirection: 'row',
    };

    return <View style={threadTileStyle}>
        <TouchableNativeFeedback
            underlayColor='white'
            onPress={() => { }}>
            <View style={{ marginLeft: 10 }}>
                <Image src={img} style={{
                    borderRadius: 10,
                    width: th,
                    height: th,
                }} />
            </View>
        </TouchableNativeFeedback>

        <TouchableNativeFeedback
            onPress={async () => {
                setState({ ...state, history: await historyAdd(state, thread) });
                sailor.navigate(THREAD_KEY);
            }}>
            <View style={{
                flex: 1,
                padding: 10,
                marginLeft: 10,
                marginRight: 10,
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: lastThread && lastThread.thread.id === thread.id ? theme.colors.highlight : theme.colors.background,
                borderRadius: 10,
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
    </View>;
};

// --- functions

const loadBoard = async (state, setState, setFetchError) => {
    const board = await Repo.threads.getLocalOrRemote(state.board);
    if (!board) {
        setFetchError(true);
    }
    else {
        setState({ ...state, boards: { ...state.boards, [state.board]: board } });
    }
}
const refreshBoard = async (state, setState, setFetchError) => {
    const board = await Repo.threads.getRemote(state.board);
    if (!board) {
        setFetchError(true);
    }
    else {
        setState({ ...state, boards: { ...state.boards, [state.board]: board } });
    }
};
const setCurrentBoard = () => {

    // todo: let the user select the current board from
    // the list of boards
    // when selecting, set the current board on setState
    // set the value currBoard in <Thread>
    // thread will then use that value to display stuff
};

const setBoards = async (state, setState) => {
    const boards = await Repo.boards.getLocalOrRemote();
    setState({ ...state, boards });
};
