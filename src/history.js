/* eslint-disable react-native/no-inline-styles */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, TouchableHighlight, useWindowDimensions, View } from 'react-native';
import HTMLView from 'react-native-htmlview';
import { Ctx } from './app';
import { historyAdd, imgFromComment } from './utils';

const HistoryTile = ({ item, tw, th }) => {
    const sailor = useNavigation();
    const { state, setState } = React.useContext(Ctx);
    const board = item.board;
    const thread = item.thread;
    const img = imgFromComment(board, thread.tim);

    return <TouchableHighlight
        onPress={async () => {
            setState({ ...state, history: await historyAdd(state, thread) });
            sailor.navigate('Thread');
        }}>
        <View
            style={{
                height: th,
                flexDirection: 'row',
                margin: 10,
                overflow: 'hidden',

            }} >
            <Image src={img} style={{
                borderRadius: th / 2,
                width: th,
                height: th,
                overflow: 'hidden',
            }} />
            <HTMLView value={`/${board}/ - ${thread.sub || thread.com}`} />
        </View>
    </TouchableHighlight>;
};

const History = () => {
    const { state } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const tw = width;
    const th = height / 16;

    return <View>
        <FlatList
            data={state.history}
            renderItem={({ item }) => <HistoryTile item={item} tw={tw} th={th} />}
            keyExtractor={(item) => item.thread.no}
            inverted
        />
    </View>;
};

export { History };

