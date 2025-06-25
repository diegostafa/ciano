
import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { FlatList, Image, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { BOTTOM_NAV_KEY, Ctx } from '../app';
import { Col, HtmlText, ListSeparator, Row, ThemedAsset, ThemedButton, ThemedText } from '../components';
import { setStateAndSave } from '../context/state';
import { Repo } from '../data/repo';
import { updateWatcher } from '../data/utils';
import { getThreadSignature, historyAdd } from '../helpers';
import { BOARD_TAB_KEY } from './board/tab';
import { THREAD_KEY } from './board/thread';

export const WATCHER_TAB_KEY = 'WatcherTab';

export const Watcher = () => {
    const { state, setState, temp, setTemp } = useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (temp.watcherMultiSelection.size > 0) {
                setTemp({ ...temp, watcherMultiSelection: new Set() });
                e.preventDefault();
                return;
            }
            return;

        });
        return unsubscribe;

    }, [sailor, setTemp, temp]);

    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        <FlatList
            onRefresh={async () => {
                setIsRefreshing(true);
                await updateWatcher(state, setState);
                setIsRefreshing(false);
            }}
            refreshing={isRefreshing}
            keyExtractor={(item) => String(item.thread.id)}
            data={state.watching}
            renderItem={({ item }) => <WatcherItem item={item} />}
            ListEmptyComponent={<NoWatchedThreads />}
            ItemSeparatorComponent={<ListSeparator />}
            contentContainerStyle={state.watching ? { flexGrow: 1 } : undefined}
        />
    </Col>;
};
const NoWatchedThreads = () => {
    return <ThemedAsset msg={'You are not following any thread'} name={'error'} />;
};
const WatcherItem = ({ item }) => {
    const { state, setState, setTemp } = useContext(Ctx);
    const sailor = useNavigation();
    const theme = useTheme();
    const thumb = Repo(state.api).media.thumb(item.thread);
    const sign = getThreadSignature(item.thread);
    const badgeStyle = {
        borderRadius: 100,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        width: 25,
        height: 25,
        backgroundColor: theme.colors.highlight,
    };
    const youBadgeStyle = {
        ...badgeStyle,
        backgroundColor: theme.colors.primary,
    }
    const containerStyle = {
        backgroundColor: theme.colors.background,
    };


    return <Swipeable
        leftThreshold={50}
    >
        <Col style={containerStyle}>
            <ThemedButton
                onLongPress={() => {
                    setTemp(prev => {
                        const updated = new Set(prev.watcherMultiSelection);
                        updated.add(item.thread.id);
                        return { ...prev, watcherMultiSelection: updated };
                    });

                }}
                onPress={async () => {
                    await historyAdd(state, setState, item.thread)
                    await setStateAndSave(setState, 'board', item.thread.board);
                    setTemp(prev => ({ ...prev, thread: item.thread }));

                    sailor.navigate(BOTTOM_NAV_KEY, {
                        screen: BOARD_TAB_KEY,
                        params: { screen: THREAD_KEY },
                    });
                }}>
                <Row style={{ padding: 15, justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                    <Row style={{ alignItems: 'center', gap: 20 }}>
                        <Image src={thumb} style={{ borderRadius: 100 }} width={50} height={50} />
                        <HtmlText value={sign} />
                    </Row>
                    <Col style={{ gap: 5, justifyContent: 'space-between', alignItems: 'center' }}>
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
            </ThemedButton>
        </Col>
    </Swipeable>;
};