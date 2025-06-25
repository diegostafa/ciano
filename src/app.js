import { addEventListener } from '@react-native-community/netinfo';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppState, Platform, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { Col, TabIcon } from './components.js';
import { Config, themeModes } from './context/config.js';
import { State } from './context/state.js';
import { Temp } from './context/temp.js';
import { updateWatcher } from './data/utils.js';
import { BOARD_TAB_KEY, BoardTab } from './screens/board/tab.js';
import { THREAD_KEY } from './screens/board/thread.js';
import { History } from './screens/history.js';
import { SETTINGS_TAB_KEY, SettingsTab } from './screens/settings/tab.js';
import { Watcher, WATCHER_TAB_KEY, WatcherHeaderRight } from './screens/watcher.js';
import { DarkTheme, DarkThemeHighContrast, LightTheme, LightThemeHighContrast } from './theme.js';
enableScreens();

export const Tab = createBottomTabNavigator();
export const Stack = createStackNavigator();
export const Ctx = React.createContext();
export const Drawer = createDrawerNavigator();
export const HEADER_HEIGHT = 48;
export const NAVBAR_WIDTH = 128;
export const DRAWER_WIDTH = 300;
export const BOTTOM_NAV_KEY = 'BottomNav';
export const isIos = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';

export const App = () => {
    const colorscheme = useColorScheme();
    const appState = React.useRef(AppState.currentState);
    const [state, setState] = React.useState(null);
    const [config, setConfig] = React.useState(null);
    const [temp, setTemp] = React.useState(Temp.default());
    const [watcherTask, setWatchertask] = React.useState(null);

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

    React.useEffect(() => {
        const unsubscribe = addEventListener(ctx => {
            setTemp(prev => ({ ...prev, connType: ctx.type }));
        });
        return () => { unsubscribe(); };
    }, [config, state]);

    React.useEffect(() => {
        if (state && config) {
            if (config.enableWatcher) {
                const task = setInterval(async () => {
                    await updateWatcher(state, setState);
                    setWatchertask(task);
                }, config.watcherUpdateSecs * 1000)
            }
            else {
                if (watcherTask) {
                    clearInterval(watcherTask);
                    setWatchertask(null);
                }
            }
        }
    }, [config, state, watcherTask]);

    if (!state || !config) {
        return <Col style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
    }

    const themeMode = themeModes[config.themeMode] === 'auto' ? colorscheme : themeModes[config.themeMode];
    const theme = themeMode === 'dark' ?
        config.highContrast ? DarkThemeHighContrast : DarkTheme :
        config.highContrast ? LightThemeHighContrast : LightTheme;

    return <Ctx.Provider value={{ state, setState, config, setConfig, temp, setTemp }}>
        <NavigationContainer theme={theme} >
            <Drawer.Navigator
                keyboardShouldPersistTaps='handled'
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        width: DRAWER_WIDTH,
                    },
                }}
                initialRouteName={BOTTOM_NAV_KEY}
                drawerContent={History} >
                <Drawer.Screen name={BOTTOM_NAV_KEY} component={BottomNav} />
            </Drawer.Navigator>
        </NavigationContainer>
    </Ctx.Provider>;
};
const BottomNav = () => {
    const { width, height } = useWindowDimensions();
    const isVertical = width < height;

    return <SafeAreaView style={{ flex: 1 }}>
        <Tab.Navigator
            initialRouteName={BOARD_TAB_KEY}
            screenOptions={{
                tabBarVariant: isAndroid() && !isVertical ? 'material' : undefined,
                height: HEADER_HEIGHT,
                tabBarPosition: isVertical ? 'bottom' : 'left',
                tabBarHideOnKeyboard: true,
                tabBarLabelPosition: !isVertical ? 'below-icon' : undefined,
                tabBarStyle: { width: !isVertical ? NAVBAR_WIDTH : undefined },
            }}>

            <Tab.Screen
                name={WATCHER_TAB_KEY}
                component={Watcher}
                options={{
                    headerRight: WatcherHeaderRight,
                    tabBarIcon: TabIcon('notifications'),
                    headerStyle: { height: HEADER_HEIGHT },
                    title: 'Watcher'
                }}
            />
            <Tab.Screen
                name={BOARD_TAB_KEY}
                component={BoardTab}
                options={{
                    tabBarIcon: TabIcon('home'),
                    headerShown: false,
                    title: 'Boards',

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
                component={SettingsTab}
                options={{
                    headerShown: false,
                    tabBarIcon: TabIcon('settings'),
                    title: 'Settings',
                }}
            />
        </Tab.Navigator>
    </SafeAreaView>;
};
