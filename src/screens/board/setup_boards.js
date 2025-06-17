import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, Button, FlatList, TouchableNativeFeedback } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { BAR_HEIGHT, Ctx } from "../../app";
import { BoardInfo, Col, HeaderIcon, ModalView, Row, ThemedText } from "../../components";
import { hasBoardsErrors } from "../../context/temp";
import { loadBoards } from "../../data/utils";

export const SETUP_BOARDS_KEY = 'SetupBoards';

export const SetupBoardsHeaderTitle = () => {
    return <Col>
        <ThemedText content={`Tap to enable a board`} />
    </Col>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);

    return <Row>
        {temp.setupBoardsFilter !== null ?
            <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: null }); }} /> :
            <Row>
                <HeaderIcon name={'reload'} onPress={async () => {
                    await loadBoards(state, setState, setTemp, true);
                }} />
                <HeaderIcon name={'search'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: '' }); }} />
            </Row>
        }
    </Row>;
};
export const SetupBoards = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const [activeBoards, setActiveBoards] = React.useState(state.activeBoards);
    const [showInfo, setShowInfo] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (temp.setupBoardsFilter !== null) {
                setTemp({ ...temp, setupBoardsFilter: null });
                e.preventDefault();
                return;
            }
            setState(prev => ({ ...prev, activeBoards: activeBoards.sort((a, b) => a.code > b.code) }));
            return;

        });
        return unsubscribe;

    }, [activeBoards, sailor, setState, setTemp, temp]);


    React.useEffect(() => {
        if (hasBoardsErrors(temp)) {
            return;
        }
        if (state.isFetchingBoards) {
            return;
        }
        if (!state.boards) {
            loadBoards(state, setState, setTemp, true);
            return;
        }
    }, [config, setState, setTemp, state, temp]);

    if (hasBoardsErrors(temp)) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            {temp.boardsFetchErrorTimeout !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server is unreachable'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorRequest !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'Malformed request'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorResponse !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </Col>
            }
            {temp.boardsFetchErrorUnknown !== null &&
                <Col>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an unknown error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </Col>
            }
        </Col>;
    }
    if (temp.isFetchingBoards) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ThemedText content={'TODO: COOL IMAGE'} />
            <ActivityIndicator />
        </Col>;
    }
    if (state.boards === null) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
        </Col>;
    }
    if (state.boards.length === 0) {
        return <Col style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'This server has no boards'} />
            <ThemedText content={'TODO: SAD IMAGE'} />
        </Col>;
    }

    return <Col style={{ flex: 1 }}>
        {temp.setupBoardsFilter !== null &&
            <Row style={{ height: BAR_HEIGHT, borderWidth: 1, backgroundColor: theme.colors.card, justifyContent: 'space-between' }}>
                <Row style={{ flex: 1, padding: 5, itemsAlign: 'center' }}>
                    <TextInput placeholder="Search..." onChangeText={text => setTemp({ ...temp, setupBoardsFilter: text })} />
                </Row>
                <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: null }); }} />
            </Row>}

        <FlatList
            data={state.boards.filter(item => item.name.toLowerCase().includes((temp.setupBoardsFilter || '').toLowerCase())).sort((a, b) => a.code > b.code)}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} setShowInfo={setShowInfo} activeBoards={activeBoards} setActiveBoards={setActiveBoards} />}
            ListEmptyComponent={<NoBoardsFound />}
            ListFooterComponent={<Col style={{ padding: 10, gap: 10, }}>
                <ThemedText content={'Selected boards: ' + activeBoards.length} />
                <ThemedText content={'Total boards: ' + state.boards.length} />
            </Col>}
        />

        {showInfo &&
            <ModalView
                visible={showInfo !== null}
                onClose={() => { setShowInfo(null) }}
                content={<BoardInfo board={showInfo} />}
            />
        }
    </Col>;
};
const BoardItem = ({ item, activeBoards, setActiveBoards, setShowInfo }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);
    const style = {
        padding: 10,
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.card,
        flex: 1,
    };
    const selectedStyle = {
        ...style,
        backgroundColor: 'darkgreen'
    };

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
            <Row style={activeBoards.includes(item.code) ? selectedStyle : style} >
                <ThemedText content={`/${item.code}/ - ${item.name}`} />
            </Row>
        </TouchableNativeFeedback>
    </Row>;
};

const NoBoardsFound = () => {
    return <Col>
        <ThemedText content={'No boards found'} />
    </Col>;
};