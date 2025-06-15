import React from 'react';

import { BAR_HEIGHT, Ctx, Stack } from '../../app.js';
import { CATALOG_KEY, Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog.js';
import { CREATE_THREAD_KEY, CreateThread, CreateThreadHeaderRight, CreateThreadHeaderTitle } from './create_thread.js';
import { SETUP_BOARDS_KEY, SetupBoards, SetupBoardsHeaderRight, SetupBoardsHeaderTitle } from './setup_boards.js';
import { THREAD_KEY, Thread, ThreadHeaderRight, ThreadHeaderTitle } from './thread.js';

export const BOARD_TAB_KEY = 'BoardTab';

export const BoardTab = () => {
    const { temp } = React.useContext(Ctx);
    return <Stack.Navigator>
        <Stack.Screen
            name={CATALOG_KEY}
            component={Catalog}
            options={{
                headerLeft: CatalogHeaderLeft,
                headerTitle: CatalogHeaderTitle,
                headerRight: CatalogHeaderRight,
                headerStyle: { height: BAR_HEIGHT },
                headerShown: temp.catalogFilter === null,
                headerTitleContainerStyle: { margin: 0, padding: 0, flex: 1, width: '100% ' },
            }}
        />
        <Stack.Screen
            name={THREAD_KEY}
            component={Thread}
            options={{
                headerTitle: ThreadHeaderTitle,
                headerRight: ThreadHeaderRight,
                headerStyle: { height: BAR_HEIGHT },
                animation: 'slide_from_right',
            }}
        />
        <Stack.Screen
            name={CREATE_THREAD_KEY}
            component={CreateThread}
            options={{
                animation: 'slide_from_bottom',
                headerStyle: { height: BAR_HEIGHT },
                headerTitle: CreateThreadHeaderTitle,
                headerRight: CreateThreadHeaderRight,
            }}
        />
        <Stack.Screen
            name={SETUP_BOARDS_KEY}
            component={SetupBoards}
            options={{
                animation: 'slide_from_bottom',
                headerStyle: { height: BAR_HEIGHT },
                headerTitle: SetupBoardsHeaderTitle,
                headerRight: SetupBoardsHeaderRight,
                headerShown: temp.setupBoardsFilter === null,
            }}
        />
    </Stack.Navigator>;
};
