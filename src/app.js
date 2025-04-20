import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

import { Catalog, CatalogHeaderLeft, CatalogHeaderRight, CatalogHeaderTitle } from './catalog';
import { Prefs } from './data';
import { History } from './history';
import { Settings } from './settings';
import { Thread, ThreadHeaderLeft, ThreadHeaderRight, ThreadHeaderTitle } from './thread';

enableScreens();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Ctx = React.createContext();
const Drawer = createDrawerNavigator();

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

const BottomTab = () => {
    return <Tab.Navigator>
        <Tab.Screen
            name="Board"
            component={Board}
            options={{
                headerLeft: BoardHeaderLeft,
                headerTitle: BoardHeaderTitle,
                headerRight: BoardHeaderRight,

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
        />
    </Tab.Navigator>;
};

const App = () => {
    const [state, setState] = React.useState(null);
    const Theme = useColorScheme();

    React.useEffect(() => {
        if (!state) {
            async function fetch() { setState(await Prefs.restore()); }
            fetch();
        }
    }, [state]);

    if (!state) {
        return <View><ActivityIndicator /></View>;
    }

    return <Ctx.Provider value={{ state, setState }}>
        <NavigationContainer theme={Theme === 'dark' ? DefaultTheme : DefaultTheme} >
            <Drawer.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="BottomTab"
                drawerContent={History} >
                <Drawer.Screen name="BottomTab" component={BottomTab} />
            </Drawer.Navigator>
        </NavigationContainer></Ctx.Provider>;
};

const Board = () => {
    return <Stack.Navigator>
        <Stack.Screen
            name="Catalog"
            component={Catalog}
            options={{ headerShown: false }}
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

export { App, Ctx };

