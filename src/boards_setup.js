import { useTheme } from "@react-navigation/native";
import React from "react";
import { FlatList, TouchableHighlight, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx } from "./app";
import { Repo } from "./repo";
import { HeaderIcon, ThemedIcon, ThemedText } from "./utils";

export const SetupBoardsHeaderTitle = () => {
    return <View>
        <ThemedText content={`Select your favorite boards`} />
    </View>;
};
export const SetupBoardsHeaderRight = () => {
    const { state, setState } = React.useContext(Ctx);

    return <View style={{ flexDirection: 'row' }}>
        <HeaderIcon name={'refresh'} onPress={() => setBoards(state, setState)} />
        <HeaderIcon name={'search'} />
        <HeaderIcon name={'check'} />
    </View>;
};
export const SetupBoards = () => {
    const { state } = React.useContext(Ctx);
    const [selectedBoards, setSelectedBoards] = React.useState(state.selectedBoards);
    const [filterText, setFilterText] = React.useState('');
    const [dirty, setDirty] = React.useState(false);
    const theme = useTheme();
    console.log(state);

    return <View style={{ flex: 1 }}>
        <View style={{ margin: 5, padding: 10, borderRadius: 10, borderWidth: 1, backgroundColor: '#333333', }}>

            <TextInput onChangeText={text => setFilterText(text)} />
        </View>
        <FlatList
            data={state.boards.filter(item => item.name.includes(filterText))}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <BoardItem item={item} selectedBoards={selectedBoards} setSelectedBoards={setSelectedBoards} />}
            ListEmptyComponent={<ThemedText content={'No boards found'} />}
        />
    </View>;
};


const BoardItem = ({ item, selectedBoards, setSelectedBoards }) => {
    const theme = useTheme();

    const style = { padding: 15, margin: 5, borderRadius: 10, backgroundColor: theme.colors.card };
    const selectedStyle = {
        ...style,
        backgroundColor: theme.colors.highlight

    };

    console.log(selectedBoards);
    return <TouchableHighlight onPress={() => {
        if (selectedBoards.includes(item.code)) {
            setSelectedBoards(selectedBoards.filter(code => code !== item.code));
        } else {
            setSelectedBoards([...selectedBoards, item.code]);
        }
    }}>
        <View style={selectedBoards.includes(item.code) ? selectedStyle : style}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText content={`/${item.code}/ - ${item.name}`} />
                <ThemedIcon name={'go-down'} />
            </View>
        </View>
    </TouchableHighlight>;
};

const setBoards = async (state, setState) => {
    const boards = await Repo.boards.getRemote();
    setState({ ...state, boards });
};