/* eslint-disable react-native/no-inline-styles */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableHighlight, useWindowDimensions, View } from 'react-native';
import HTMLView from 'react-native-htmlview';

import { Ctx } from './app';
import { Repo } from './data';
import { historyAdd, imgFromComment } from './utils';

const CatalogHeader = () => {
    const { state } = React.useContext(Ctx);
    return <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
        }} >
        <Text>Board: {state.board}</Text>
    </View>;
};
const Catalog = () => {
    const { state, setState } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    React.useEffect(() => {
        if (!state.board) { return; }
        if (!state.boards[state.board]) { refreshBoard(state, setState); }
    }, [state, setState]);

    if (!state.boards) {
        return <View><Text>TODO: FETCH BOARDS LOADER</Text></View>;
    }
    if (!state.board) {
        return <View><Text>SELECT A BOARD TO GET STARTED</Text></View>;
    }
    if (!state.boards[state.board]) {
        return <View><ActivityIndicator /></View>;
    }
    if (state.catalogMode === 'grid') {
        const tw = width / 3;
        const th = height / 4;
        return <View>
            <FlatList
                data={state.boards[state.board].flatMap(page => page.threads)}
                renderItem={({ item }) => <CatalogTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
                keyExtractor={(item) => item.no}
                onRefresh={() => refreshBoard(state, setState)}
                refreshing={!state.boards[state.board]}
            />
        </View>;
    }
    if (state.catalogMode === 'list') {
        const tw = width;
        const th = height / 8;
        return <View>
            <FlatList
                data={state.boards[state.board].flatMap(page => page.threads)}
                renderItem={({ item }) => <ListTile state={state} setState={setState} thread={item} tw={tw} th={th} />}
                keyExtractor={(item) => item.no}
                onRefresh={() => refreshBoard(state, setState)}
                refreshing={!state.boards[state.board]}
            />
        </View>;
    }
    if (state.viewMode === 'page') {
        return <View><Text>TODO: catalog pagination</Text></View>;
    }
    return <View><Text>Unreachable</Text></View>;
};

const CatalogTile = ({ state, setState, thread, tw, th }) => {
    const sailor = useNavigation();
    const img = imgFromComment(state.board, thread.tim);
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.no === thread.no ? '#FFDDDD' : '#ddd',
        flexDirection: 'row',
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
    const img = imgFromComment(state.board, thread.tim);
    const lastThread = state.history.at(-1);
    const threadTileStyle = {
        width: tw - 4,
        height: th,
        margin: 2,
        backgroundColor: lastThread && lastThread.board === state.board && lastThread.thread.no === thread.no ? '#FFDDDD' : '#ddd',
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
                    <Text>{thread.replies}R, {thread.images}I</Text>
                </View>
            </View>
        </View>
    </TouchableHighlight>;
};

const refreshBoard = async (state, setState) => {
    console.log('fetching board', state.board);
    const board = await Repo.board.getRemote(state.board);
    setState({ ...state, boards: { ...state.boards, [state.board]: board } });
};
const CatalogImageGallery = ({ state, setState }) => {
    if (state.selectedImgIdx === null) {
        return null;
    }
    const threads = state.boards[state.board].flatMap(page => page.threads);
    const thread = threads[state.selectedImgIdx];
    return <View><Text>TODO: IMAGE GALLERY</Text></View>;
};

export { Catalog, CatalogHeader };
