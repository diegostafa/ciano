import { CommonActions, DrawerActions, useNavigation, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Image, TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { BAR_HEIGHT, BOARD_TAB_KEY, BOTTOM_NAV_KEY, Ctx, THREAD_KEY } from '../app';
import { Col, HeaderIcon, HtmlText, ModalAlert, Row, ThemedAsset, ThemedText } from '../components';
import { Repo } from '../data/repo';
import { getThreadSignature, historyAdd, threadContains } from '../helpers';

export const History = () => {
    const { state, setState, config } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const th = height / (isLandscape ? 6 : 16);
    const [filter, setFilter] = React.useState('');
    const [forget, setForget] = useState(null);
    const [forgetAll, setForgetAll] = useState(false);
    const theme = useTheme();
    const headerPad = BAR_HEIGHT;
    const noHistory = state.history.length === 0;
    const searchPad = noHistory ? 0 : 40;
    const history = state.history.filter(item => threadContains(item, filter))

    return <Col style={{ flex: 1, overflow: 'hidden' }}>
        <ModalAlert
            visible={forget !== null}
            onClose={() => { setForget(null); }}
            msg={'Remove from the list?'}
            right={'No'}
            left={'Yes'}
            onPressRight={() => { setForget(null); }}
            onPressLeft={() => {
                setState({ ...state, history: state.history.filter(item => item.id !== forget.id) });
                setForget(null);
            }}
        />
        <ModalAlert
            visible={forgetAll}
            onClose={() => { setForgetAll(false); }}
            msg={'Delete all history?'}
            right={'No'}
            left={'Yes'}
            onPressRight={() => { setForgetAll(false); }}
            onPressLeft={() => {
                setState({ ...state, history: [] });
                setForgetAll(false);
            }}
        />

        {!noHistory &&
            <Col style={{ bottom: 0, height: searchPad }}>
                <TextInput
                    onChangeText={text => setFilter(text)}
                    value={filter}
                    placeholder='Search in the history...'
                    style={{
                        flex: 1,
                        height: searchPad,
                        padding: 10,
                        fontSize: 16 * config.uiFontScale,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                    }} />
            </Col>}

        <Col style={{ height: height - searchPad - headerPad, backgroundColor: theme.colors.card }}>
            {history.length === 0 ?
                <ThemedAsset msg={"'There is no history to show'"} name={"placeholder"} /> :
                <FlatList
                    data={history}
                    renderItem={({ index }) => {
                        const item = history[history.length - 1 - index];
                        return <HistoryTile item={item} th={th} setForget={setForget} />;
                    }}
                    keyExtractor={(item) => String(item.id)}
                />
            }

        </Col>
        <Row style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, height: headerPad, }}>
            {!noHistory && <Col style={{ position: 'absolute', left: 0 }}>
                <HeaderIcon name={'trash'} onPress={() => { setForgetAll(true); }} />
            </Col>}
            <ThemedText content={'History'} style={{ fontSize: 20, }} />
        </Row>
    </Col>;
};
const HistoryTile = ({ item, th, setForget }) => {
    const sailor = useNavigation();
    const theme = useTheme();
    const { state, setState, config } = React.useContext(Ctx);
    const img = Repo(state.api).media.thumb(item);
    const margin = 5;
    const padding = 10;
    const imgSz = th - padding * 2 - margin;
    const sign = getThreadSignature(item);

    return <Col style={{ marginLeft: 5, marginRight: 5, borderRadius: config.borderRadius, overflow: 'hidden', marginTop: margin, backgroundColor: theme.colors.background }}>
        <TouchableNativeFeedback
            onLongPress={() => { setForget(item); }}
            onPress={() => {
                historyAdd(state, setState, item);
                sailor.dispatch(DrawerActions.closeDrawer());
                sailor.dispatch(CommonActions.navigate({
                    name: BOTTOM_NAV_KEY,
                    params: {
                        screen: BOARD_TAB_KEY,
                        params: {
                            screen: THREAD_KEY,
                        }
                    }
                })
                );
            }}>
            <Col>
                <Row style={{ overflow: 'hidden', marginRight: 10, alignItems: 'center', padding, height: th, gap: 15 }} >
                    <Image src={img} style={{
                        top: 0,
                        borderRadius: th / 2,
                        width: imgSz,
                        height: imgSz,
                    }} />
                    <HtmlText value={sign} />
                </Row>
            </Col>
        </TouchableNativeFeedback>
    </Col>;
};