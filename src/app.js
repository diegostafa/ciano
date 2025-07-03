import { addEventListener } from '@react-native-community/netinfo';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppState, Platform, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { Col, WatcherBadge } from './components.js';
import { Config, layoutModes, themeModes } from './context/config.js';
import { State, totNew, totYou } from './context/state.js';
import { Temp } from './context/temp.js';
import { BOARD_TAB_KEY, BoardTab } from './screens/board/tab.js';
import { THREAD_KEY } from './screens/board/thread.js';
import { History } from './screens/history.js';
import { SETTINGS_TAB_KEY, SettingsTab } from './screens/settings/tab.js';
import { Watcher, WATCHER_TAB_KEY } from './screens/watcher.js';
import { DarkTheme, DarkThemeHighContrast, LightTheme, LightThemeHighContrast } from './theme.js';

enableScreens();

export const BotTab = createBottomTabNavigator();
export const TopTab = createMaterialTopTabNavigator();
export const Stack = createStackNavigator();
export const Ctx = React.createContext();
export const Drawer = createDrawerNavigator();
export const HEADER_HEIGHT = 48;
export const LANDSCAPE_NAV_WIDTH = 128;
export const DRAWER_WIDTH = 300;
export const NAV_KEY = 'Nav';
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

export const App = () => {
    const colorscheme = useColorScheme();
    const appState = React.useRef(AppState.currentState);
    const [state, setState] = React.useState(null);
    const [config, setConfig] = React.useState(null);
    const [temp, setTemp] = React.useState(Temp.default());

    async function restoreState() {
        const data = await State.restore();
        setState(data);
    }
    async function restoreConfig() {
        const data = await Config.restore();
        console.log(data);
        setConfig(data);
    }

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

    if (!state || !config) {
        return <Col style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
    }

    const themeMode = themeModes[config.themeMode] === 'auto' ? colorscheme : themeModes[config.themeMode];
    const theme = themeMode === 'dark' ?
        config.highContrast ? DarkThemeHighContrast : DarkTheme :
        config.highContrast ? LightThemeHighContrast : LightTheme;

    const layoutMode = layoutModes[config.layoutMode] === 'auto' ?
        layoutModes[config.layoutMode] : IS_IOS ? 'ios' : 'android';

    return <DrawerNav
        state={state}
        setState={setState}
        config={config}
        setConfig={setConfig}
        temp={temp}
        setTemp={setTemp}
        theme={theme}
        nav={layoutMode === 'ios' ? BotNav : TopNav}
    />;
};
const DrawerNav = ({ state, setState, config, setConfig, temp, setTemp, nav, theme }) => {
    return <Ctx.Provider value={{ state, setState, config, setConfig, temp, setTemp }}>
        <NavigationContainer theme={theme} >
            <Drawer.Navigator
                screenOptions={{
                    headerShown: false,
                    drawerStyle: { width: DRAWER_WIDTH },
                }}
                initialRouteName={NAV_KEY}
                drawerContent={History} >
                <Drawer.Screen name={NAV_KEY} component={nav} />
            </Drawer.Navigator>
        </NavigationContainer>
    </Ctx.Provider>;
};
const BotNav = () => {
    const { state } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const theme = useTheme();
    const isVertical = width < height;
    const totNewReplies = totNew(state);
    const totYouReplies = totYou(state);

    return <SafeAreaView style={{ flex: 1 }}>
        <BotTab.Navigator
            initialRouteName={BOARD_TAB_KEY}
            backBehavior='initialRoute'
            screenOptions={{
                tabBarVariant: IS_ANDROID && !isVertical ? 'material' : undefined,
                height: HEADER_HEIGHT,
                tabBarPosition: isVertical ? 'bottom' : 'left',
                tabBarHideOnKeyboard: true,
                tabBarLabelPosition: !isVertical ? 'below-icon' : undefined,
                tabBarStyle: { width: !isVertical ? LANDSCAPE_NAV_WIDTH : undefined },
            }}>

            <BotTab.Screen
                name={WATCHER_TAB_KEY}
                component={Watcher}
                options={{
                    tabBarBadge: totNewReplies > 0 ? totNewReplies : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: totYouReplies > 0 ? theme.colors.badgeYouBg : theme.colors.badgeNewBg,
                        color: totYouReplies > 0 ? theme.colors.badgeYouFg : theme.colors.badgeNewFg,
                    },

                    headerStyle: { height: HEADER_HEIGHT },
                    title: 'Watcher'
                }}
            />
            <BotTab.Screen
                name={BOARD_TAB_KEY}
                component={BoardTab}
                options={{
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
            <BotTab.Screen
                name={SETTINGS_TAB_KEY}
                component={SettingsTab}
                options={{
                    headerShown: false,
                    title: 'Settings',
                }}
            />
        </BotTab.Navigator>
    </SafeAreaView>;
};
const TopNav = () => {
    return <SafeAreaView style={{ flex: 1 }}>
        <TopTab.Navigator
            initialRouteName={BOARD_TAB_KEY}
            backBehavior='initialRoute'
            screenOptions={{
                height: HEADER_HEIGHT,
                tabBarHideOnKeyboard: true,
            }}>
            <TopTab.Screen
                name={WATCHER_TAB_KEY}
                component={Watcher}
                options={{
                    tabBarLabel: 'Watcher',
                    tabBarBadge: WatcherBadge,
                }}
            />
            <TopTab.Screen
                name={BOARD_TAB_KEY}
                component={BoardTab}
                options={{
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
            <TopTab.Screen
                name={SETTINGS_TAB_KEY}
                component={SettingsTab}
                options={{
                    headerShown: false,
                    title: 'Settings',
                }}
            />
        </TopTab.Navigator>
    </SafeAreaView>;
};
