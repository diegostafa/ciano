/* eslint-disable react/react-in-jsx-scope */
import { useNavigation, useTheme } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { FlatList, Image, Text, TouchableNativeFeedback } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { BOTTOM_NAV_KEY, Ctx } from '../../app';
import { Col, HtmlText, ListSeparator, Row, ThemedAsset, ThemedIcon, ThemedText } from '../../components';
import { Repo } from '../../data/repo';
import { getThreadSignature, historyAdd } from '../../helpers';
import { BOARD_TAB_KEY } from '../board/tab';
import { THREAD_KEY } from '../board/thread';

export const WATCHER_TAB_KEY = 'WatcherTab';

export const WatcherHeaderRight = () => {
    return <Row>
        <ThemedIcon />
    </Row>
}

export const WatcherTab = () => {
    const { state } = useContext(Ctx);
    const theme = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);

    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        <FlatList
            onRefresh={() => {
                setIsRefreshing(true);
                // todo rest
                setIsRefreshing(false);
            }}
            refreshing={isRefreshing}
            keyExtractor={(item) => String(item.thread.id)}
            data={state.watching}
            renderItem={({ item }) => <WatcherItem item={item} />}
            ListEmptyComponent={<NoWatchedThreads />}
            ItemSeparatorComponent={<ListSeparator />}
        />
    </Col>;
};

const NoWatchedThreads = () => {
    return <Col style={{ gap: 10 }}>
        <ThemedText content={'You are not following any thread'} />
        <ThemedAsset name={'empty'} width={200} height={200} />
    </Col>
};

const WatcherItem = ({ item }) => {
    const { state, setState, setTemp } = useContext(Ctx);
    const sailor = useNavigation();
    const theme = useTheme();
    const thumb = Repo(state.api).media.thumb(item.thread);
    const sign = getThreadSignature(item.thread);
    const badgeStyle = {
        borderRadius: '50%',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        backgroundColor: theme.colors.highlight,
    };
    const youBadgeStyle = {
        ...badgeStyle,
        backgroundColor: theme.colors.primary,
    }

    return <Swipeable
        friction={2}
        leftThreshold={50}
        renderLeftActions={() => {
            return <Col />
        }}
        onSwipeableOpen={() => {

        }} >
        <Col style={{ backgroundColor: theme.colors.background, }}>
            <TouchableNativeFeedback
                onPress={() => {
                    historyAdd(state, setState, item.thread)
                    setState(prev => ({ ...prev, board: item.thread.board }));
                    setTemp(prev => ({ ...prev, thread: item.thread }));

                    sailor.navigate(BOTTOM_NAV_KEY, {
                        screen: BOARD_TAB_KEY,
                        params: { screen: THREAD_KEY },
                    });
                }}>
                <Row style={{ padding: 15 }}>
                    <Image source={{ uri: thumb }} />
                    <HtmlText value={sign} />
                    <Col style={{ gap: 5 }}>
                        {item.new > 0 &&
                            <Col style={badgeStyle}>
                                <ThemedText content={item.new} />
                            </Col>}

                        {item.you > 0 &&
                            <Col style={youBadgeStyle}>
                                <Text>{item.you}</Text>
                            </Col>}
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
    </Swipeable>;
};