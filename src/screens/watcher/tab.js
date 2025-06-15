/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react';
import { FlatList, View } from 'react-native';

import { Ctx } from '../../app';
import { ThemedText } from '../../components';

export const WATCHER_TAB_KEY = 'WatcherTab';

const WatcherItem = ({ item }) => {
    return <View>
        <ThemedText content={item} />
    </View>
};


export const WatcherTab = () => {
    const { state } = useContext(Ctx);

    return <FlatList
        data={state.watching}
        renderItem={({ item }) => <WatcherItem item={item} />}
    />
};