import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { FlatList, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx } from "./app";
import { loadBoards } from "./state";
import { arraysDiffer, HeaderIcon, ModalAlert, ThemedText } from "./utils";

export const SetupBoardsHeaderTitle = () => {
    return <View>
        <ThemedText content={`Tap to enable a board`} />
    </View>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState, flags, setFlags } = React.useContext(Ctx);

    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name={'refresh'} onPress={() => loadBoards(state, setState, true)} />

        {flags.boardsSetupSearch ?
            <HeaderIcon name={'close'} onPress={() => {
                setFlags({ ...flags, boardsSetupSearch: false })
            }
            } /> :
            <HeaderIcon name={'search'} onPress={() => {
                setFlags({ ...flags, boardsSetupSearch: true });
            }} />

        }
    </View>;
};
export const SetupBoards = () => {
    const { state, setState, flags, setFlags } = React.useContext(Ctx);
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
            if (flags.boardsSetupSearch) {
                setFlags({ ...flags, boardsSetupSearch: false });
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

    }, [sailor, isDirty, filterText, flags, activeBoards, state.activeBoards, setFlags]);


    return <View style={{ flex: 1 }}>
        {flags.boardsSetupSearch &&
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
                cancel={'DISCARD'}
                confirm={'SAVE'}
                visible={isDirty}
                onClose={() => setIsDirty(false)}
                onCancel={() => {
                    setIsDirty(false);
                    sailor.goBack();
                }}
                onConfirm={() => {
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
