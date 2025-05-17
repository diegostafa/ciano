import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { FlatList, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx } from "./app";
import { loadBoards } from "./state";
import { arraysDiffer, HeaderButton, HeaderIcon, ModalAlert, ThemedText } from "./utils";

export const SetupBoardsHeaderTitle = () => {
    return <View>
        <ThemedText content={`Tap to enable a board`} />
    </View>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);

    return <View style={{ flexDirection: 'row' }}>
        <HeaderButton
            isActive={state.activeBoards.length > 0}
            onPress={() => { loadBoards(state, setState, setTemp, true); }}
            child={<ThemedText content={'Done'} />}
        />

        {temp.boardsSetupSearch ?
            <HeaderIcon name={'close'} onPress={() => { setTemp({ ...temp, boardsSetupSearch: false }); }} /> :
            <HeaderIcon name={'search'} onPress={() => { setTemp({ ...temp, boardsSetupSearch: true }); }} />
        }
    </View>;
};
export const SetupBoards = () => {
    const { state, setState, temp, setTemp } = React.useContext(Ctx);
    const sailor = useNavigation();
    const [activeBoards, setActiveBoards] = React.useState(state.activeBoards);
    const [filterText, setFilterText] = React.useState('');
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = sailor.addListener('beforeRemove', (e) => {
            if (filterText !== '') {
                setFilterText('');
                e.preventDefault();
                return;
            }
            if (temp.boardsSetupSearch) {
                setTemp({ ...temp, boardsSetupSearch: false });
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

    }, [sailor, isDirty, filterText, temp, activeBoards, state.activeBoards, setTemp]);


    return <View style={{ flex: 1 }}>
        {temp.boardsSetupSearch &&
            <View style={{ padding: 5, borderWidth: 1, backgroundColor: '#333333', }}>
                <TextInput onChangeText={text => setFilterText(text)} />
            </View>
        }

        <FlatList
            data={state.boards.filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()))}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} activeBoards={activeBoards} setActiveBoards={setActiveBoards} />}
            ListEmptyComponent={<ThemedText content={'No boards found'} />}
        />

        {isDirty &&
            <ModalAlert
                msg={'You are about to go back, but there are unsaved changes'}
                left={'DISCARD'}
                right={'SAVE'}
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
