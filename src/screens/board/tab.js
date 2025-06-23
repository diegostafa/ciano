/* eslint-disable react/react-in-jsx-scope */

import { HEADER_HEIGHT, Stack } from '../../app.js';
import { CATALOG_KEY, Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog.js';
import { CREATE_THREAD_KEY, CreateThread, CreateThreadHeaderRight, CreateThreadHeaderTitle } from './create_thread.js';
import { SETUP_BOARDS_KEY, SetupBoards, SetupBoardsHeaderRight, SetupBoardsHeaderTitle } from './setup_boards.js';
import { THREAD_KEY, Thread, ThreadHeaderRight, ThreadHeaderTitle } from './thread.js';

export const BOARD_TAB_KEY = 'BoardTab';

export const BoardTab = () => {
    return <Stack.Navigator>
        <Stack.Screen
            name={CATALOG_KEY}
            component={Catalog}
            options={{
                headerLeft: CatalogHeaderLeft,
                headerTitle: CatalogHeaderTitle,
                headerRight: CatalogHeaderRight,
                headerStyle: { height: HEADER_HEIGHT },
            }}
        />
        <Stack.Screen
            name={THREAD_KEY}
            component={Thread}
            options={{
                headerTitle: ThreadHeaderTitle,
                headerRight: ThreadHeaderRight,
                headerStyle: { height: HEADER_HEIGHT },
                animation: 'slide_from_right',
            }}
        />
        <Stack.Screen
            name={CREATE_THREAD_KEY}
            component={CreateThread}
            options={{
                animation: 'slide_from_bottom',
                headerStyle: { height: HEADER_HEIGHT },
                headerTitle: CreateThreadHeaderTitle,
                headerRight: CreateThreadHeaderRight,
            }}
        />
        <Stack.Screen
            name={SETUP_BOARDS_KEY}
            component={SetupBoards}
            options={{
                animation: 'slide_from_bottom',
                headerStyle: { height: HEADER_HEIGHT },
                headerTitle: SetupBoardsHeaderTitle,
                headerRight: SetupBoardsHeaderRight,
            }}
        />
    </Stack.Navigator>;
};
