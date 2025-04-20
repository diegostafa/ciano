/* eslint-disable react-native/no-inline-styles */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Text, TextInput, TouchableHighlight, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import HTMLView from 'react-native-htmlview';

import { Ctx } from './app';
import { Prefs, Repo } from './data';
import { historyAdd, imgFromComment } from './utils';

const CatalogHeaderLeft = () => {
    return <View>
        <TouchableOpacity onPress={() => { }}>
            <Text>TODO: HISTORY</Text>
        </TouchableOpacity>
    </View>;
};
const CatalogHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <View>
        <TouchableOpacity>
            <Text>Board: {state.board}</Text>
        </TouchableOpacity>
    </View>;
};
const CatalogHeaderRight = () => {
    const { state, setState } = React.useContext(Ctx);
    return <View>
        <TouchableOpacity onPress={async () => {
            if (state.catalogMode === 'list') {
                setState({ ...state, catalogMode: 'grid' });
                await Prefs.set('catalogMode', 'grid');
            } else {
                setState({ ...state, catalogMode: 'list' });
                await Prefs.set('catalogMode', 'list');
            }
        }} >
            <Text>{state.catalogMode === 'list' ? 'Switch to grid' : 'Switch to list'}</Text>
        </TouchableOpacity>
    </View>;
};
const Catalog = () => {
    const { width, height } = useWindowDimensions();
    const { state, setState } = React.useContext(Ctx);
    const [createThread, setCreateThread] = React.useState(false);
    const [formData, setFormData] = React.useState(null);
    const [fetchError, setFetchError] = React.useState(false);

    React.useEffect(() => {
        if (!state.board) { return; }
        if (!state.boards[state.board]) { refreshBoard(state, setState, setFetchError); }
    }, [state, setState]);

    if (!state.boards) {
        return <View style={{ flex: 1 }}><Text>TODO: FETCH BOARDS LOADER</Text></View>;
    }
    if (!state.board) {
        return <View style={{ flex: 1 }}><Text>SELECT A BOARD TO GET STARTED</Text></View>;
    }
    if (fetchError) {
        return <View style={{ flex: 1 }}>
            <Text>TODO: FETCH ERROR</Text>
            <Button title={'Retry'} onPress={() => {
                setFetchError(false);
                refreshBoard(state, setState, setFetchError);
            }} />
        </View>;
    }
    if (!state.boards[state.board]) {
        return <View style={{ flex: 1 }}>
            <Text>FETCHING BOARD</Text>
            <ActivityIndicator /></View>;
    }
    if (state.boards[state.board].length === 0) {
        return <View style={{ flex: 1 }}>
            <FlatList
                data={[null]}
                renderItem={() => <Text>NO THREADS</Text>}
                onRefresh={() => refreshBoard(state, setState, setFetchError)}
                refreshing={!state.boards[state.board]}
            />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        <Threads state={state} setState={setState} setFetchError={setFetchError} width={width} height={height} />
        <CreateThreadButton createThread={createThread} setCreateThread={setCreateThread} />
        <Modal visible={createThread} onRequestClose={() => { setCreateThread(false); }}>
            <CreateThreadForm setCreateThread={setCreateThread} formData={formData} setFormData={setFormData} />
        </Modal>
    </View>;
};

const GridTile = ({ state, setState, thread, tw, th }) => {
    const sailor = useNavigation();
    const img = imgFromComment(thread);
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.id === thread.id ? '#FFDDDD' : '#ddd',
        overflow: 'hidden',
    };
    return <TouchableHighlight
        underlayColor="white"
        onPress={async () => {
            setState({ ...state, history: await historyAdd(state, thread) });
            sailor.navigate('Thread');
        }}>
        <View style={threadTileStyle}>
            <TouchableHighlight
                underlayColor="white"
                onPress={() => { }}>
                <Image src={img} style={{ width: '100%', height: th / 2 }} />
            </TouchableHighlight>

            <View style={{
                padding: 2,
                justifyContent: 'space-between',
            }}>
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HTMLView value={`<b>${thread.sub}</b>`} />}
                    {thread.com && <HTMLView value={thread.com} />}
                </View>

                <View style={{ marginTop: 2 }}>
                    <Text>{thread.replies}R, {thread.images}I</Text>
                </View>
            </View>
        </View>
    </TouchableHighlight>;
};
const ListTile = ({ state, setState, thread, tw, th }) => {
    const sailor = useNavigation();
    const img = imgFromComment(thread);
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.id === thread.id ? '#FFDDDD' : '#ddd',
        flexDirection: 'row',
    };

    return <TouchableHighlight
        underlayColor="white"
        onPress={async () => {
            setState({ ...state, history: await historyAdd(state, thread) });
            sailor.navigate('Thread');
        }}>
        <View style={threadTileStyle}>
            <TouchableHighlight
                underlayColor="white"
                onPress={() => { }}>
                <Image src={img} style={{
                    borderRadius: 4,
                    width: th,
                    height: th,
                }} />
            </TouchableHighlight>

            <View style={{
                flex: 1,
                padding: 2,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                    {thread.sub && <HTMLView value={`<b>${thread.sub}</b>`} />}
                    {thread.com && <HTMLView value={thread.com} />}
                </View>

                <View style={{ marginTop: 2 }}>
                    <Text>{thread.replies} Replies, {thread.images} Images</Text>
                </View>
            </View>
        </View>
    </TouchableHighlight>;
};

const Threads = ({ state, setState, setFetchError, width, height }) => {
    if (state.catalogMode === 'list') {
        const tw = width;
        const th = height / 8;
        return <FlatList
            data={state.boards[state.board]}
            renderItem={({ item }) => <ListTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
            keyExtractor={(item) => item.id}
            onRefresh={() => refreshBoard(state, setState, setFetchError)}
            refreshing={!state.boards[state.board]}
        />;
    }
    if (state.catalogMode === 'grid') {
        const tw = width / 3;
        const th = height / 4;
        return <FlatList
            data={state.boards[state.board]}
            renderItem={({ item }) => <GridTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
            keyExtractor={(item) => item.id}
            onRefresh={() => refreshBoard(state, setState, setFetchError)}
            refreshing={!state.boards[state.board]}
        />;
    }
};

const CreateThreadButton = ({ createThread, setCreateThread }) => {
    return <FloatingAction
        showBackground={false}
        visible={!createThread}
        onPressMain={() => { setCreateThread(true); }}
    />;
};

const CreateThreadForm = ({ setCreateThread, formData, setFormData }) => {
    return <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}>
        <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
        }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Create a Thread</Text>

            <TextInput
                placeholder="Title"
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
                    console.log('sending thread', formData);
                }} />
            </View>
        </View>
    </View>
        ;
};

const refreshBoard = async (state, setState, setFetchError) => {
    const board = await Repo.threads.getRemote(state.board);
    if (!board) {
        setFetchError(true);
    }
    else {
        setState({ ...state, boards: { ...state.boards, [state.board]: board } });
    }
};
// const CatalogImageGallery = ({ state, setState }) => {
//     if (state.selectedImgIdx === null) {
//         return null;
//     }
//     const threads = state.boards[state.board];
//     const thread = threads[state.selectedImgIdx];
//     return <View><Text>TODO: IMAGE GALLERY</Text></View>;
// };

export { Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle };

