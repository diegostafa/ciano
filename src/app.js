import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/Ionicons';

import { Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog';
import { Config } from './config';
import { History } from './history';
import { About, Accessibility, Appearance, Downloads, SettingsMenu } from './settings';
import { State } from './state';
import { Thread, ThreadHeaderLeft, ThreadHeaderRight, ThreadHeaderTitle } from './thread';

enableScreens();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Ctx = React.createContext();
const Drawer = createDrawerNavigator();

const App = () => {
    const [state, setState] = React.useState(null);
    const [config, setConfig] = React.useState(null);
    const Theme = useColorScheme();

    async function restoreState() { setState(await State.restore()) }
    async function restoreConfig() { setConfig(await Config.restore()) }

    React.useEffect(() => { if (!state) restoreState() }, [state]);
    React.useEffect(() => { if (!config) restoreConfig() }, [config]);

    if (!state || !config) { return <View><ActivityIndicator /></View>; }

    return <Ctx.Provider value={{ state, setState, config, setConfig }}>
        <NavigationContainer theme={Theme === 'dark' ? DefaultTheme : DefaultTheme} >
            <Drawer.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="BottomTab"
                drawerContent={History} >
                <Drawer.Screen name="BottomTab" component={BottomTab} />
            </Drawer.Navigator>
        </NavigationContainer></Ctx.Provider>;
};
const currRoute = (state) => {
    const tabRoute = state.routes.find(r => r.name === 'Board');
    const stackState = tabRoute?.state;
    const currentRoute = stackState?.routes?.[stackState.index]?.name;
    return currentRoute || 'Catalog';
};
const BoardHeaderLeft = () => {
    if (useNavigationState(currRoute) === 'Catalog') {
        return <CatalogHeaderLeft />;
    }
    return <ThreadHeaderLeft />;

};
const BoardHeaderTitle = () => {
    if (useNavigationState(currRoute) === 'Catalog') {
        return <CatalogHeaderTitle />;
    }
    return <ThreadHeaderTitle />;
};
const BoardHeaderRight = () => {
    if (useNavigationState(currRoute) === 'Catalog') {
        return <CatalogHeaderRight />;
    }
    return <ThreadHeaderRight />;
};
const BoardIcon = ({ color }) => {
    return <Icon name="home" size={24} color={color} />;
};
const SettingsIcon = ({ color }) => {
    return <Icon name="settings" size={24} color={color} />;
};
const BottomTab = () => {
    return <Tab.Navigator screenOptions={{
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
    }}>
        <Tab.Screen
            name="Board"
            component={Board}
            options={{
                tabBarIcon: BoardIcon,
                headerLeft: BoardHeaderLeft,
                headerTitle: BoardHeaderTitle,
                headerRight: BoardHeaderRight,
                headerStyle: { height: 48 },

            }}
            listeners={({ navigation, route }) => ({
                tabPress: e => {
                    const isBoardFocused = navigation.isFocused();
                    if (isBoardFocused) {
                        const stackKey = route?.state?.routes?.[route.state.index]?.name;
                        if (stackKey === 'Thread') {
                            e.preventDefault();
                        }
                    }
                },
            })}
        />
        <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
                headerShown: false,
                tabBarIcon: SettingsIcon,
            }}
        />
    </Tab.Navigator>;
};
const Board = () => {
    return <Stack.Navigator>
        <Stack.Screen
            name="Catalog"
            component={Catalog}
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="Thread"
            component={Thread}
            options={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        />
    </Stack.Navigator>;
};
const Settings = () => {
    return <Stack.Navigator>
        <Stack.Screen
            name="SettingsMenu"
            component={SettingsMenu}
            options={{
                headerStyle: { height: 48 },
            }}
        />
        <Stack.Screen
            name="Appearance"
            component={Appearance}
            options={{
                headerStyle: { height: 48 },
            }} />
        <Stack.Screen
            name="Accessibility"
            component={Accessibility}
            options={{
                headerStyle: { height: 48 },
            }} />
        <Stack.Screen
            name="Downloads"
            component={Downloads}
            options={{
                headerStyle: { height: 48 },
            }} />
        <Stack.Screen
            name="About"
            component={About}
            options={{
                headerStyle: { height: 48 },
            }} />
    </Stack.Navigator>;
};

export { App, Ctx };

