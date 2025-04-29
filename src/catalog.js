import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, TextInput, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';

import { api } from './api';
import { Ctx } from './app';
import { Config } from './config';
import { Repo } from './repo';
import { Fab, HeaderIcon, historyAdd, HtmlText, ThemedText } from './utils';

// --- main component

const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState } = React.useContext(Ctx);
    const [createThread, setCreateThread] = React.useState(false);
    const [formData, setFormData] = React.useState(null);
    const [fetchError, setFetchError] = React.useState(false);

    React.useEffect(() => {
        if (!state.board) { return; }
        if (!state.boards[state.board]) { loadBoard(state, setState, setFetchError); }
    }, [state, setState]);

    if (!state.boards) {
        return <View style={{ flex: 1 }}><ThemedText content={"TODO: FETCH BOARDS LOADER"} /></View>;
    }
    if (!state.board) {
        return <View style={{ flex: 1 }}><ThemedText content={"SELECT A BOARD TO GET STARTED"} /></View>;
    }
    if (fetchError) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={"TODO: FETCH ERROR"} />
            <Button title={'Retry'} onPress={() => {
                setFetchError(false);
                refreshBoard(state, setState, setFetchError);
            }} />
        </View>;
    }
    if (!state.boards[state.board]) {
        return <View style={{ flex: 1 }}>
            <ThemedText content={"FETCHING THREADS"} />
            <ActivityIndicator /></View>;
    }

    return <View style={{ flex: 1 }}>
        <Threads state={state} setState={setState} setFetchError={setFetchError} width={width} height={height} />
        {!createThread && <Fab onPress={() => { setCreateThread(true) }} />}
        <Modal
            animationType="fade"
            transparent
            visible={createThread}
            onRequestClose={() => { setCreateThread(false); }}>
            <CreateThreadForm setCreateThread={setCreateThread} formData={formData} setFormData={setFormData} />
        </Modal>
    </View>;
};

// --- header

const CatalogHeaderLeft = () => {
    const navigation = useNavigation();
    return <HeaderIcon name="menu" onPress={() => navigation.openDrawer()} />;
};
const CatalogHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <View>
        <TouchableNativeFeedback>
            <ThemedText content={`Board: ${state.board}`} />
        </TouchableNativeFeedback>
    </View>;
};
const CatalogHeaderRight = () => {
    const { state, setState, config, setConfig } = React.useContext(Ctx);
    const newMode = config.catalogMode === 'list' ? 'grid' : 'list';
    const icon = newMode === 'list' ? 'list' : 'grid'; // todo: find better icons

    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name="refresh" onPress={async () => await refreshBoard(state, setState)} />
        <HeaderIcon name={icon} onPress={async () => {
            await Config.set('catalogMode', newMode);
            setConfig({ ...config, catalogMode: newMode });
        }} />
        <HeaderIcon name="ellipsis-vertical" />
    </View>;
};

// --- thread list
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
        const th = height / 4;
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
        <ThemedText content={"NO THREADSS"} />
    </View>;
};
const GridTile = ({ thread, tw, th }) => {
    const { state, setState } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = api.blu.media(thread);
    // const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        //   backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.id === thread.id ? '#FFDDDD' : '#ddd',
        overflow: 'hidden',
    };

    console.log(thread.com);

    return <TouchableNativeFeedback
        onPress={async () => {
            const history = await historyAdd(state, thread)
            setState({ ...state, history });
            sailor.navigate('Thread');
        }}>
        <View style={threadTileStyle}>
            <TouchableNativeFeedback
                onPress={() => {
                    console.log('open gallery');
                }}>
                <Image src={img} style={{ width: '100%', height: th / 2 }} />
            </TouchableNativeFeedback>

            <View style={{
                padding: 2,
                flex: 1,
                justifyContent: 'space-between',
            }}>
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HtmlText value={`<b>${thread.sub}</b>`} />}
                    {thread.com && <HtmlText value={thread.com} />}
                </View>

                <View style={{ marginTop: 2 }}>
                    <ThemedText content={`${thread.replies}R, ${thread.images}I`} />
                </View>
            </View>
        </View>
    </TouchableNativeFeedback>;
};
const ListTile = ({ thread, tw, th }) => {
    const { state, setState } = React.useContext(Ctx);
    const sailor = useNavigation();
    const img = api.blu.media(thread);
    // const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        //  backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.id === thread.id ? '#FFDDDD' : '#ddd',
        flexDirection: 'row',
    };

    return <TouchableNativeFeedback
        underlayColor="white"
        onPress={async () => {
            setState({ ...state, history: await historyAdd(state, thread) });
            sailor.navigate('Thread');
        }}>
        <View style={threadTileStyle}>
            <TouchableNativeFeedback
                underlayColor="white"
                onPress={() => { }}>
                <Image src={img} style={{
                    borderRadius: 4,
                    width: th,
                    height: th,
                }} />
            </TouchableNativeFeedback>

            <View style={{
                flex: 1,
                padding: 2,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HtmlText value={`<b>${thread.sub}</b>`} />}
                    {thread.com && <HtmlText value={thread.com} />}
                </View>

                <View style={{ marginTop: 2 }}>
                    <ThemedText content={`${thread.replies} Replies, ${thread.images} Images`} />
                </View>
            </View>
        </View>
    </TouchableNativeFeedback>;
};

// --- create thread
const CreateThreadForm = ({ setCreateThread, formData, setFormData }) => {
    return <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}>
        <View style={{
            width: '90%',
            padding: 10,
            backgroundColor: 'rgb(255, 255, 255)',

        }}>
            <ThemedText content={"Create Thread"} style={{ fontSize: 18, marginBottom: 10 }} />

            <TextInput
                placeholder="Subject"
                style={{ height: 40, borderColor: '#ddd', borderWidth: 1, marginBottom: 10, paddingLeft: 10 }}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
                placeholder="Content"
                style={{ height: 80, borderColor: '#ddd', borderWidth: 1, marginBottom: 10, paddingLeft: 10, textAlignVertical: 'top' }}
                multiline
                onChangeText={(text) => setFormData({ ...formData, content: text })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => { setCreateThread(false); }} />
                <Button title="Submit" onPress={() => {
                    setCreateThread(false);
                }} />
            </View>
        </View>
    </View>
        ;
};

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

export { Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle };

