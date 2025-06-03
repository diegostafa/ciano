/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react';
import { FlatList } from 'react-native';

import { Ctx } from '../../app';

export const WATCHER_TAB_KEY = 'WatcherTab';

export const WatcherTab = () => {
    const { state } = useContext(Ctx);

    return <FlatList
        data={state.watching}
        renderItem={({ item }) => item}
    />
};