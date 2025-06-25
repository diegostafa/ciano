/* eslint-disable react/react-in-jsx-scope */

import { useTheme } from '@react-navigation/native';

import { HEADER_HEIGHT, Stack } from '../../app.js';
import { CATALOG_KEY, Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog.js';
import { CREATE_THREAD_KEY, CreateThread, CreateThreadHeaderRight, CreateThreadHeaderTitle } from './create_thread.js';
import { SETUP_BOARDS_KEY, SetupBoards, SetupBoardsHeaderRight, SetupBoardsHeaderTitle } from './setup_boards.js';
import { THREAD_KEY, Thread, ThreadHeaderRight, ThreadHeaderTitle } from './thread.js';

export const BOARD_TAB_KEY = 'BoardTab';

export const BoardTab = () => {
    const theme = useTheme();
    const options = {
        headerStyle: {
            height: HEADER_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
    }

    return <Stack.Navigator>
        <Stack.Screen
            name={CATALOG_KEY}
            component={Catalog}
            options={{
                ...options,
                headerLeft: CatalogHeaderLeft,
                headerTitle: CatalogHeaderTitle,
                headerRight: CatalogHeaderRight,
            }}
        />
        <Stack.Screen
            name={THREAD_KEY}
            component={Thread}
            options={{
                ...options,
                headerTitle: ThreadHeaderTitle,
                headerRight: ThreadHeaderRight,
                animation: 'slide_from_right',
            }}
        />
        <Stack.Screen
            name={CREATE_THREAD_KEY}
            component={CreateThread}
            options={{
                ...options,
                animation: 'slide_from_bottom',
                headerTitle: CreateThreadHeaderTitle,
                headerRight: CreateThreadHeaderRight,
            }}
        />
        <Stack.Screen
            name={SETUP_BOARDS_KEY}
            component={SetupBoards}
            options={{
                ...options,
                animation: 'slide_from_bottom',
                headerTitle: SetupBoardsHeaderTitle,
                headerRight: SetupBoardsHeaderRight,
            }}
        />
    </Stack.Navigator>;
};
