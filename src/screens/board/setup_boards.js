import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useRef } from 'react';
import { FlatList, TouchableNativeFeedback } from 'react-native';

import { Ctx } from '../../app';
import { BoardInfo, Col, HeaderIcon, HeaderThemedText, ModalMenu, ModalView, Row, SearchBar, ThemedAsset, ThemedText, UpdateGap } from '../../components';
import { hasBoardsErrors } from '../../context/temp';
import { loadBoards } from '../../data/utils';

export const SETUP_BOARDS_KEY = 'SetupBoards';

export const SetupBoardsHeaderTitle = () => {
    return <Col>
        <HeaderThemedText content={`Setup boards`} />
        <ThemedText content={`Tap to enable a board or hold for info`} />
    </Col>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);
    const [setupBoardsActions, setSetupBoardsActions] = React.useState(false);
    let items = [
        ['reload', 'reload', async () => {
            setSetupBoardsActions(false);
            await loadBoards(state, setState, setTemp, true);
        }],
    ];

    if (state.boards !== null) {
        items.push(['Go top', 'arrow-up', async () => {
            setSetupBoardsActions(false);
            temp.setupBoardsReflist.current?.scrollToIndex({ animated: true, index: 0 });
        }]);
        items.push(['Go bottom', 'arrow-down', async () => {
            setSetupBoardsActions(false);
            temp.setupBoardsReflist.current?.scrollToEnd({ animated: true });
        }]);
    }

    return <Row>
        {temp.setupBoardsFilter === null && <HeaderIcon name={'search'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: '' }); }} />}
        <HeaderIcon name={'ellipsis-vertical'} onPress={() => { setSetupBoardsActions(true); }} />

        <ModalMenu
            visible={setupBoardsActions}
            onClose={() => { setSetupBoardsActions(false) }}
            items={items}
        />
    </Row>;
};
export const SetupBoards = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const [activeBoards, setActiveBoards] = React.useState(state.activeBoards);
    const [showInfo, setShowInfo] = React.useState(null);
    const setupBoardsReflist = useRef(null);

    React.useEffect(() => {
        if (!temp.setupBoardsReflist) {
            setTemp(prev => ({ ...prev, setupBoardsReflist }));
        }
    }, [setTemp, temp.setupBoardsReflist]);

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (temp.setupBoardsFilter !== null) {
                setTemp(prev => ({ ...prev, setupBoardsFilter: null }));
                e.preventDefault();
                return;
            }
            setState(prev => ({ ...prev, activeBoards: [...activeBoards].sort() }));
            return;
        });
        return unsubscribe;
    }, [activeBoards, sailor, setState, setTemp, temp]);

    React.useEffect(() => {
        if (hasBoardsErrors(temp)) {
            return;
        }
        if (temp.isFetchingBoards) {
            return;
        }
        if (!state.boards || state.boards.length === 0) {
            loadBoards(state, setState, setTemp, true);
            return;
        }
    }, [config, setState, setTemp, state, temp]);

    if (temp.boardsFetchErrorTimeout !== null) {
        return <ThemedAsset
            msg={'The server is unreachable'}
            name={'placeholder'}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }} />;
    }
    if (temp.boardsFetchErrorRequest !== null) {
        return <ThemedAsset
            msg={'Malformed request'}
            name={'placeholder'}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }} />;
    }
    if (temp.boardsFetchErrorResponse !== null) {
        return <ThemedAsset
            msg={'The server returned an error'}
            name={'placeholder'}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }} />;
    }
    if (temp.boardsFetchErrorUnknown !== null) {
        return <ThemedAsset
            msg={'The server returned an unknown error'}
            name={'placeholder'}
            retry={async () => { await loadBoards(state, setState, setTemp, true); }} />;
    }
    if (state.boards === null) {
        return <UpdateGap />;
    }
    if (state.boards.length === 0) {
        return <ThemedAsset
            msg={'The server has no boards'}
            name={'placeholder'}
        />;
    }

    return <Col style={{ flex: 1, backgroundColor: theme.colors.card }}>
        {temp.setupBoardsFilter !== null && <SearchBar
            placeholder='Search for a board...'
            value={temp.setupBoardsFilter}
            onChangeText={text => setTemp(prev => ({ ...prev, setupBoardsFilter: text }))}
            onClose={() => { setTemp(prev => ({ ...prev, setupBoardsFilter: null })); }}
        />}
        <FlatList
            numColumns={2}
            onRefresh={async () => { await loadBoards(state, setState, setTemp, true); }}
            refreshing={temp.isFetchingBoards}
            ref={setupBoardsReflist}
            data={state.boards.filter(item => item.name.toLowerCase().includes((temp.setupBoardsFilter || '').toLowerCase())).sort((a, b) => a.code.localeCompare(b.code))}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} setShowInfo={setShowInfo} activeBoards={activeBoards} setActiveBoards={setActiveBoards} />}
            ListEmptyComponent={<NoBoardsFound />}
            ListFooterComponent={
                <Col style={{ padding: 10 }}>
                    <ThemedText style={{ textAlign: 'center' }} content={`Viewing boards from ${state.api.name}`} />
                </Col>
            }
            ListHeaderComponent={
                <Col style={{ padding: 10 }}>
                    <ThemedText style={{ textAlign: 'center' }} content={`Enabled boards: ${activeBoards.length}/${state.boards.length}`} />
                </Col>}
        />
        {showInfo && <ModalView
            visible={showInfo !== null}
            onClose={() => { setShowInfo(null) }}
            content={<BoardInfo board={showInfo} />}
        />}
    </Col>;
};
const BoardItem = ({ item, activeBoards, setActiveBoards, setShowInfo }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);
    const style = {
        padding: 10,
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        flex: 1,
    };
    const selectedStyle = {
        ...style,
        backgroundColor: theme.colors.primary,
    };
    const isSelected = activeBoards.includes(item.code);

    return <Row style={{ flex: 1, margin: 5, borderRadius: config.borderRadius, overflow: 'hidden' }}>
        <TouchableNativeFeedback
            onLongPress={() => { setShowInfo(item); }}
            onPress={() => {
                setActiveBoards(prev => {
                    const index = prev.indexOf(item.code);
                    return index > -1 ?
                        [...prev.slice(0, index), ...prev.slice(index + 1)] :
                        [...prev, item.code];
                });
            }}>
            <Row style={isSelected ? selectedStyle : style} >
                <ThemedText style={{ color: isSelected ? theme.colors.primaryInverted : theme.colors.text }} content={`/${item.code}/ - ${item.name}`} />
            </Row>
        </TouchableNativeFeedback>
    </Row>;
};
const NoBoardsFound = () => {
    return <Col>
        <ThemedText content={'No boards found'} />
    </Col>;
};