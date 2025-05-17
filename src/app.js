import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, AppState, Keyboard, useColorScheme, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

import { SetupBoards, SetupBoardsHeaderRight, SetupBoardsHeaderTitle } from './boards_setup';
import { Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog';
import { Config } from './config';
import { CreateThread, CreateThreadHeaderRight, CreateThreadHeaderTitle } from './create_thread';
import { Notifications } from './notifications';
import { About, ABOUT_KEY, Accessibility, ACCESSIBILITY_KEY, Advanced, ADVANCED_KEY, Appearance, APPEARANCE_KEY, Downloads, DOWNLOADS_KEY, SETTINGS_MENU_KEY, SettingsMenu } from './settings';
import { State } from './state';
import { Temp } from './temp.js';
import { DarkTheme, LightTheme } from './theme';
import { Thread, ThreadHeaderRight, ThreadHeaderTitle } from './thread';
import { TabIcon } from './utils';

enableScreens();

export const Tab = createBottomTabNavigator();
export const Stack = createStackNavigator();
export const Ctx = React.createContext();
export const Drawer = createDrawerNavigator();

export const BAR_HEIGHT = 48;

export const BOTTOM_NAV_KEY = 'BottomNav';
export const BOARD_TAB_KEY = 'Board';
export const SETTINGS_TAB_KEY = 'Settings';
export const THREAD_KEY = 'Thread';
export const CATALOG_KEY = 'Catalog';
export const CREATE_THREAD_KEY = 'CreateThread';
export const NOTIFICATIONS_TAB_KEY = 'Notifications';
export const SETUP_BOARDS_KEY = 'SetupBoards';

export const App = () => {
    const theme = useColorScheme();
    const appState = React.useRef(AppState.currentState);
    const [state, setState] = React.useState(null);
    const [config, setConfig] = React.useState(null);
    const [temp, setTemp] = React.useState(Temp.default());

    async function restoreState() { setState(await State.restore()) }
    async function restoreConfig() { setConfig(await Config.restore()) }

    React.useEffect(() => { if (!state) restoreState() }, [state]);
    React.useEffect(() => { if (!config) restoreConfig() }, [config]);

    React.useEffect(() => {
        const handleAppStateChange = async (nextAppState) => {
            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                await State.save(state);
                await Config.save(config);
            }
            appState.current = nextAppState;
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => { subscription.remove(); };
    }, [config, state]);

    if (!state || !config) { return <View><ActivityIndicator /></View>; }

    return <Ctx.Provider value={{ state, setState, config, setConfig, temp, setTemp }}>
        <NavigationContainer theme={theme === 'dark' ? DarkTheme : LightTheme} >
            <Drawer.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={BOTTOM_NAV_KEY}
                drawerContent={DrawerScreen} >
                <Drawer.Screen name={BOTTOM_NAV_KEY} component={BottomTab} />
            </Drawer.Navigator>
        </NavigationContainer></Ctx.Provider>;
};
const DrawerScreen = () => {
    return <View />;
}
const BottomTab = () => {
    const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);


    return <Tab.Navigator
        initialRouteName={BOARD_TAB_KEY}
        screenOptions={{
            height: BAR_HEIGHT,
            tabBarStyle: { display: isKeyboardVisible ? 'none' : 'flex' }
        }}>

        <Tab.Screen
            name={NOTIFICATIONS_TAB_KEY}
            component={Notifications}
            options={{
                tabBarIcon: TabIcon('notifications'),
                headerStyle: { height: BAR_HEIGHT },

            }}
        />
        <Tab.Screen
            name={BOARD_TAB_KEY}
            component={Board}
            options={{
                tabBarIcon: TabIcon('home'),
                headerShown: false
            }}
            listeners={({ navigation, route }) => ({
                tabPress: e => {
                    const isBoardFocused = navigation.isFocused();
                    if (isBoardFocused) {
                        const stackKey = route?.state?.routes?.[route.state.index]?.name;
                        if (stackKey === THREAD_KEY) {
                            e.preventDefault();
                        }
                    }
                },
            })}
        />
        <Tab.Screen
            name={SETTINGS_TAB_KEY}
            component={Settings}
            options={{
                headerShown: false,
                tabBarIcon: TabIcon('settings'),
            }}
        />
    </Tab.Navigator>;
};
const Board = () => {
    return <Stack.Navigator>
        <Stack.Screen
            name={CATALOG_KEY}
            component={Catalog}
            options={{
                headerLeft: CatalogHeaderLeft,
                headerTitle: CatalogHeaderTitle,
                headerRight: CatalogHeaderRight,
                headerStyle: { height: BAR_HEIGHT },
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
                headerRight: CreateThreadHeaderRight
            }}
        />
        <Stack.Screen
            name={SETUP_BOARDS_KEY}
            component={SetupBoards}
            options={{
                animation: 'slide_from_bottom',
                headerStyle: { height: BAR_HEIGHT },
                headerTitle: SetupBoardsHeaderTitle,
                headerRight: SetupBoardsHeaderRight
            }}
        />
    </Stack.Navigator>;
};
const Settings = () => {
    const style = {
        headerStyle: { height: BAR_HEIGHT },
    }
    return <Stack.Navigator>
        <Stack.Screen
            name={SETTINGS_MENU_KEY}
            component={SettingsMenu}
            options={{
                ...style,
                headerTitle: 'Settings',
            }}
        />
        <Stack.Screen
            name={APPEARANCE_KEY}
            component={Appearance}
            options={style} />
        <Stack.Screen
            name={ACCESSIBILITY_KEY}
            component={Accessibility}
            options={style} />
        <Stack.Screen
            name={DOWNLOADS_KEY}
            component={Downloads}
            options={style} />
        <Stack.Screen
            name={ADVANCED_KEY}
            component={Advanced}
            options={style} />
        <Stack.Screen
            name={ABOUT_KEY}
            component={About}
            options={style} />
    </Stack.Navigator>;
};