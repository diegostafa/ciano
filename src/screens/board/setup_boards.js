import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { FlatList, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx } from "../../app";
import { loadBoards } from "../../context/state";
import { arraysDiffer, HeaderButton, ModalAlert, ThemedText } from "../../utils";


export const SETUP_BOARDS_KEY = 'SetupBoards';

export const SetupBoardsHeaderTitle = () => {
    return <View>
        <ThemedText content={`Tap to enable a board`} />
    </View>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, setTemp } = React.useContext(Ctx);

    return <View style={{ flexDirection: 'row' }}>
        <HeaderButton
            isActive={state.activeBoards.length > 0}
            onPress={() => { loadBoards(state, setState, setTemp, true); }}
            child={<ThemedText content={'Done'} />}
        />

        {/* {temp.setupBoardsFilter !== null ?
            <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: null }); }} /> :
            <HeaderIcon name={'search'} onPress={() => { setTemp({ ...temp, setupBoardsFilter: '' }); }} />
        } */}
    </View>;
};
export const SetupBoards = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);
    const sailor = useNavigation();
    const [activeBoards, setActiveBoards] = React.useState(state.activeBoards);
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (temp.setupBoardsFilter !== null) {
                setTemp({ ...temp, setupBoardsFilter: null });
                e.preventDefault();
                return;
            }
            if (arraysDiffer(activeBoards, state.activeBoards)) {
                setIsDirty(true);
                e.preventDefault();
                return;
            }

        });
        return unsubscribe;

    }, [sailor, isDirty, temp, activeBoards, state.activeBoards, setTemp]);


    return <View style={{ flex: 1 }}>
        {temp.setupBoardsFilter !== null &&
            <View style={{ padding: 5, borderWidth: 1, backgroundColor: '#333333', }}>
                <TextInput onChangeText={text => setTemp({ ...temp, setupBoardsFilter: text })} />
            </View>
        }

        <FlatList
            data={state.boards.filter(item => item.name.toLowerCase().includes((temp.setupBoardsFilter || '').toLowerCase()))}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} activeBoards={activeBoards} setActiveBoards={setActiveBoards} />}
            ListEmptyComponent={<ThemedText content={'No boards found'} />}
        />

        {isDirty &&
            <ModalAlert
                msg={'You are about to go back, but there are unsaved changes'}
                left={'discard'}
                right={'save'}
                visible={isDirty}
                onClose={() => setIsDirty(false)}
                onPressLeft={() => {
                    setIsDirty(false);
                    sailor.goBack();
                }}
                onPressRight={() => {
                    setIsDirty(false);
                    setState({ ...state, activeBoards: activeBoards });
                    sailor.goBack();
                }}
            />
        }
    </View>;
};
const BoardItem = ({ item, activeBoards, setActiveBoards }) => {
    const theme = useTheme();

    const style = {
        borderRadius: 10,
        padding: 10,
        backgroundColor: theme.colors.highlight,
        borderWidth: 1,
        flexDirection: 'row', justifyContent: 'space-between'
    };
    const selectedStyle = {
        ...style,
        backgroundColor: 'darkgreen'
    };

    return <View style={{ margin: 5 }}>
        <TouchableNativeFeedback onPress={() => {
            setActiveBoards(prev => {
                const index = prev.indexOf(item.code);
                return index > -1 ?
                    [...prev.slice(0, index), ...prev.slice(index + 1)] :
                    [...prev, item.code];
            });
        }}>
            <View style={activeBoards.includes(item.code) ? selectedStyle : style} >
                <ThemedText content={`/${item.code}/ - ${item.name}`} />
            </View>
        </TouchableNativeFeedback>
    </View>;
};
