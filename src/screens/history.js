import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Image, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { BAR_HEIGHT, BOARD_TAB_KEY, BOTTOM_NAV_KEY, Ctx, THREAD_KEY } from '../app';
import { Repo } from '../data/repo';
import { getThreadSignature, historyAdd, HtmlText, ModalAlert, ThemedAsset, ThemedText } from '../utils';


export const History = () => {
    const { state } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const th = height / (isLandscape ? 6 : 16);
    const [filter, setFilter] = React.useState('');
    const [forget, setForget] = useState(null);
    const theme = useTheme();
    const topPad = BAR_HEIGHT;
    const bottomPad = 60;
    const history = state.history.filter(item => getThreadSignature(item.thread).includes(filter.toLowerCase()))

    return <View style={{ flex: 1 }}>
        <ModalAlert
            visible={forget !== null}
            onClose={() => { setForget(null); }}
            msg={'Remove from the list?'}
            left={'No'}
            right={'Yes'}
            onPressLeft={() => { setForget(null); }}
            onPressRight={() => {
                setForget(null);
            }}
        />

        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, height: topPad, }}>
            <ThemedText content={'History'} style={{ fontSize: 20, fontWeight: 'bold' }} />
        </View>
        <View style={{ height: height - bottomPad - topPad }}>
            {history.length === 0 ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ThemedAsset name={"error"} width={200} height={200} />
                    <ThemedText content={'There is no history to show'} />
                </View> :
                <FlatList
                    inverted
                    data={history}
                    renderItem={({ item }) => <HistoryTile item={item} th={th} setForget={setForget} />}
                    keyExtractor={(item) => item.thread.id}
                />
            }

        </View>
        <View style={{ bottom: 0, height: bottomPad }}>
            <TextInput
                onChangeText={text => setFilter(text)}
                value={filter}
                placeholder='Type to filter...'
                style={{
                    flex: 1,
                    height: bottomPad,
                    padding: 10,
                    fontSize: 16,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                }} />
        </View>
    </View>;
};

const HistoryTile = ({ item, th, setForget }) => {
    const sailor = useNavigation();
    const theme = useTheme();
    const { state, setState } = React.useContext(Ctx);
    const thread = item.thread;
    const img = Repo(state.api).media.thumb(thread);
    const margin = 4;
    const padding = 10;
    const imgSz = th - padding * 2 - margin;
    const sign = getThreadSignature(thread);

    return <View style={{ overflow: 'hidden', marginBottom: margin, backgroundColor: theme.colors.highlight }}>
        <TouchableNativeFeedback
            onLongPress={() => { setForget(item); }}
            onPress={() => {
                historyAdd(state, setState, thread)
                sailor.navigate(BOTTOM_NAV_KEY, {
                    screen: BOARD_TAB_KEY,
                    params: { screen: THREAD_KEY },
                });
            }}>
            <View style={{ alignItems: 'center', padding, height: th, flexDirection: 'row', gap: 15 }} >
                <Image src={img} style={{
                    top: 0,
                    borderRadius: th / 2,
                    width: imgSz,
                    height: imgSz,
                }} />
                <View>
                    <HtmlText value={sign} />
                </View>
            </View>
        </TouchableNativeFeedback>
    </View>;
};