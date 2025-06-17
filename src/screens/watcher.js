/* eslint-disable react/react-in-jsx-scope */
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import { BackHandler, FlatList, Image, Text, TouchableNativeFeedback } from 'react-native';

import { BOTTOM_NAV_KEY, Ctx } from '../app';
import { Col, HeaderIcon, HtmlText, ListSeparator, ModalAlert, Row, ThemedAsset, ThemedText } from '../components';
import { Repo } from '../data/repo';
import { updateWatcher } from '../data/utils';
import { getThreadSignature, historyAdd } from '../helpers';
import { BOARD_TAB_KEY } from './board/tab';
import { THREAD_KEY } from './board/thread';

export const WATCHER_TAB_KEY = 'WatcherTab';

export const WatcherHeaderRight = () => {
    const { setState, temp, setTemp } = useContext(Ctx);
    const [confirm, setConfirm] = useState(false);

    if (temp.watcherMultiSelection.size === 0) {
        return undefined;
    }

    return <Row>
        <ModalAlert
            visible={confirm}
            msg={'Are you sure you want to unfollow these threads?'}
            left={'No'}
            right={'Yes'}
            onClose={() => { setConfirm(false); }}
            onPressLeft={() => { setConfirm(false); }}
            onPressRight={() => {
                setConfirm(false);
                setState(prev => ({ ...prev, watching: prev.watching.filter(item => !temp.watcherMultiSelection.has(item.thread.id)) }));
                setTemp(prev => ({ ...prev, watcherMultiSelection: new Set() }));
            }}
        />
        <HeaderIcon name={'eye-off'} onPress={() => {
            setConfirm(true);
        }} />
        <HeaderIcon name={'cancel'} onPress={() => {
            setTemp(prev => ({ ...prev, watcherMultiSelection: new Set() }));
        }} />
    </Row>
}

export const Watcher = () => {
    const { state, setState, temp, setTemp } = useContext(Ctx);
    const theme = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (temp.watcherMultiSelection.size > 0) {
                    setTemp({ ...temp, watcherMultiSelection: new Set() });
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [temp, setTemp])
    );

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
    const { state, setState, temp, setTemp } = useContext(Ctx);
    const sailor = useNavigation();
    const theme = useTheme();
    const thumb = Repo(state.api).media.thumb(item.thread);
    const sign = getThreadSignature(item.thread);
    const badgeStyle = {
        borderRadius: 15,
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
    const containerStyle = {
        backgroundColor: theme.colors.background,
    };
    const selectedStyle = {
        ...containerStyle,
        backgroundColor: 'red'
    }
    const isSelected = temp.watcherMultiSelection.has(item.thread.id);
    const isSelecting = temp.watcherMultiSelection.size > 0;

    return <Col style={isSelected ? selectedStyle : containerStyle}>
        <TouchableNativeFeedback
            onLongPress={() => {
                if (isSelecting) { return; }
                setTemp(prev => {
                    const updated = new Set(prev.watcherMultiSelection);
                    updated.add(item.thread.id);
                    return { ...prev, watcherMultiSelection: updated };
                });

            }}
            onPress={() => {
                if (isSelecting) {
                    setTemp(prev => {
                        const updated = new Set(prev.watcherMultiSelection);
                        if (isSelected) {
                            updated.delete(item.thread.id);
                        }
                        else {
                            updated.add(item.thread.id);
                        }
                        return { ...prev, watcherMultiSelection: updated };
                    });
                    return;
                }

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
    </Col>;
};