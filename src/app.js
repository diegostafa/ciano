import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

import { Catalog, CatalogHeader } from './catalog';
import { Prefs } from './data';
import { History } from './history';
import { Settings } from './settings';
import { Thread, ThreadHeader } from './thread';

enableScreens();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Ctx = React.createContext();
const Drawer = createDrawerNavigator();

const BottomTab = () => {
    return <Tab.Navigator>
        <Tab.Screen
            name="Board"
            component={Board}
            options={{ headerShown: false }}
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
            options={{ headerTitle: CatalogHeader }}
        />
        <Stack.Screen
            name="Thread"
            component={Thread}
            options={{ headerTitle: ThreadHeader }}
        />
    </Stack.Navigator>;
};

export { App, Ctx };

