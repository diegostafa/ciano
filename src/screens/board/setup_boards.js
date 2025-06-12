import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, Button, FlatList, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { BAR_HEIGHT, Ctx } from "../../app";
import { hasBoardsErrors } from "../../context/temp";
import { loadBoards } from "../../data/utils";
import { HeaderIcon, ModalView, ThemedText } from "../../utils";


export const SETUP_BOARDS_KEY = 'SetupBoards';

export const SetupBoardsHeaderTitle = () => {
    return <View>
        <ThemedText content={`Tap to enable a board`} />
    </View>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);

    return <View style={{ flexDirection: 'row' }}>
        {temp.setupBoardsFilter !== null ?
            <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: null }); }} /> :
            <View style={{ flexDirection: 'row' }}>
                <HeaderIcon name={'reload'} onPress={async () => {
                    await loadBoards(state, setState, setTemp, true);
                }} />
                <HeaderIcon name={'search'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: '' }); }} />
            </View>
        }
    </View>;
};
export const SetupBoards = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const [activeBoards, setActiveBoards] = React.useState(state.activeBoards);
    const [showInfo, setShowInfo] = React.useState(null);
    const infoOuter = {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
    };

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
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            {temp.boardsFetchErrorTimeout !== null &&
                <View>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server is unreachable'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setState, setTemp, true); }} />
                </View>
            }
            {temp.boardsFetchErrorRequest !== null &&
                <View>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'Malformed request'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </View>
            }
            {temp.boardsFetchErrorResponse !== null &&
                <View>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </View>
            }
            {temp.boardsFetchErrorUnknown !== null &&
                <View>
                    <ThemedText content={'boardsfetcherror'} />
                    <ThemedText content={'The server returned an unknown error'} />
                    <ThemedText content={'TODO: SAD IMAGE'} />
                    <Button title={'Retry'} onPress={async () => { await loadBoards(state, setTemp, true); }} />
                </View>
            }
        </View>;
    }
    if (temp.isFetchingBoards) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'FETCHING BOARDS'} />
            <ThemedText content={'TODO: COOL IMAGE'} />
            <ActivityIndicator />
        </View>;
    }
    if (state.boards === null) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
        </View>;
    }
    if (state.boards.length === 0) {
        return <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
            <ThemedText content={'This server has no boards'} />
            <ThemedText content={'TODO: SAD IMAGE'} />
        </View>;
    }

    return <View style={{ flex: 1 }}>
        {temp.setupBoardsFilter !== null &&
            <View style={{ height: BAR_HEIGHT, borderWidth: 1, backgroundColor: theme.colors.card, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, padding: 5 }}>
                    <TextInput placeholder="Search..." onChangeText={text => setTemp({ ...temp, setupBoardsFilter: text })} />
                </View>
                <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: null }); }} />
            </View>}

        <FlatList
            data={state.boards.filter(item => item.name.toLowerCase().includes((temp.setupBoardsFilter || '').toLowerCase())).sort((a, b) => a.code > b.code)}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} setShowInfo={setShowInfo} activeBoards={activeBoards} setActiveBoards={setActiveBoards} />}
            ListEmptyComponent={<NoBoardsFound />}
            ListFooterComponent={<View style={{ padding: 10, gap: 10, }}>
                <ThemedText content={'Selected boards: ' + activeBoards.length} />
                <ThemedText content={'Total boards: ' + state.boards.length} />
            </View>}
        />

        {showInfo &&
            <ModalView
                visible={showInfo !== null}
                onClose={() => { setShowInfo(null) }}
                content={
                    <View style={{ gap: 15, paddingTop: 15, paddingBottom: 15, }}>
                        {showInfo.code &&
                            <View style={infoOuter}>
                                <ThemedText content={`Code:`} />
                                <ThemedText content={showInfo.code} />
                            </View>}
                        {showInfo.name &&
                            <View style={infoOuter}>
                                <ThemedText content={`Name:`} />
                                <ThemedText content={showInfo.name} />
                            </View>}
                        {showInfo.description &&
                            <View style={infoOuter}>
                                <ThemedText content={`Description:`} />
                                <ThemedText content={showInfo.description} />
                            </View>}
                        {showInfo.max_sub_len &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max subject length:`} />
                                <ThemedText content={showInfo.max_sub_len} />
                            </View>}
                        {showInfo.max_com_len &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max comment length:`} />
                                <ThemedText content={showInfo.max_com_len} />
                            </View>}
                        {showInfo.max_threads &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max threads:`} />
                                <ThemedText content={showInfo.max_threads} />
                            </View>}
                        {showInfo.max_replies &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max replies per thread}`} />
                                <ThemedText content={showInfo.max_replies} />
                            </View>}
                        {showInfo.max_img_replies &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max images per thread:`} />
                                <ThemedText content={showInfo.max_img_replies} />
                            </View>}
                        {showInfo.max_file_size &&
                            <View style={infoOuter}>
                                <ThemedText content={`Max media size:`} />
                                <ThemedText content={showInfo.max_file_size} /></View>}
                        {showInfo.is_nsfw &&
                            <View style={infoOuter}>
                                <ThemedText content={`Is NSFW:`} />
                                <ThemedText content={showInfo.is_nsfw ? 'yes' : 'no'} />
                            </View>}
                    </View>
                }
            />
        }

    </View>;
};
const BoardItem = ({ item, activeBoards, setActiveBoards, setShowInfo }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);
    const style = {
        padding: 10,
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.card,
        flex: 1,
    };
    const selectedStyle = {
        ...style,
        backgroundColor: 'darkgreen'
    };

    return <View style={{ flex: 1, margin: 5, borderRadius: config.borderRadius, overflow: 'hidden', flexDirection: 'row' }}>
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
            <View style={activeBoards.includes(item.code) ? selectedStyle : style} >
                <ThemedText style={{}} content={`/${item.code}/ - ${item.name}`} />
            </View>
        </TouchableNativeFeedback>

    </View>;
};

const NoBoardsFound = () => {
    return <View>
        <ThemedText content={'No boards found'} />
    </View>;
};