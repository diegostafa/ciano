import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, Text, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';

import { BOARD_TAB_KEY, BOTTOM_NAV_KEY, Ctx, THREAD_KEY } from '../app';
import { getThreadSignature, HeaderIcon, historyAdd, HtmlText, ThemedText } from '../utils';
import { api } from './api';

export const History = () => {
    const { state } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const tw = width;
    const th = height / 16;

    return <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText content={'History'} />
            <HeaderIcon name='circle' />
        </View>
        <View style={{ flex: 1 }}>
            <FlatList
                data={state.history}
                inverted
                renderItem={({ item }) => <HistoryTile item={item} tw={tw} th={th} />}
                keyExtractor={(item) => item.thread.id}
                ListEmptyComponent={<NoHistory />}
            />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <HeaderIcon name='search' />
        </View>
    </View>;
};
const HistoryTile = ({ item, tw, th }) => {
    const sailor = useNavigation();
    const { state, setState } = React.useContext(Ctx);
    const thread = item.thread;
    const img = api.blu.thumb(thread);

    return <TouchableNativeFeedback
        onPress={async () => {
            setState({ ...state, history: await historyAdd(state, thread) });
            sailor.navigate(BOTTOM_NAV_KEY, {
                screen: BOARD_TAB_KEY,
                params: { screen: THREAD_KEY },
            });
        }}>
        <View
            style={{
                height: th,
                flexDirection: 'row',
                overflow: 'hidden',
            }} >
            <Image src={img} style={{
                padding: 0,
                margin: 0,
                top: 0,
                borderRadius: th / 2,
                width: th,
                height: th,
                overflow: 'hidden',
            }} />
            <View style={{ padding: 10 }}>
                <HtmlText
                    value={getThreadSignature(thread)}
                    renderNode={(node, index, siblings, parent, defaultRenderer) => {
                        if (node.name === 'br') { return null; }
                    }}
                />

            </View>
        </View>
    </TouchableNativeFeedback>;
};
const NoHistory = () => {
    return <View style={{ flex: 1 }}>
        <Text>NO HISTORY</Text>
    </View>;
};


