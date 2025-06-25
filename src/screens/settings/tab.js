/* eslint-disable react/react-in-jsx-scope */

import { useTheme } from '@react-navigation/native';

import { HEADER_HEIGHT, Stack } from '../../app.js';
import { About, ABOUT_KEY } from './about.js';
import { Accessibility, ACCESSIBILITY_KEY } from './accessibility.js';
import { Advanced, ADVANCED_KEY } from './advanced.js';
import { Appearance, APPEARANCE_KEY } from './appearance.js';
import { Behaviour, BEHAVIOUR_KEY } from './behaviour.js';
import { Menu, MENU_KEY } from './menu.js';

export const SETTINGS_TAB_KEY = 'SettingsTab';

export const SettingsTab = () => {
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
            name={MENU_KEY}
            component={Menu}
            options={{
                ...options,
                headerTitle: 'Settings',
            }}
        />
        <Stack.Screen
            name={APPEARANCE_KEY}
            component={Appearance}
            options={options} />
        <Stack.Screen
            name={BEHAVIOUR_KEY}
            component={Behaviour}
            options={options} />
        <Stack.Screen
            name={ACCESSIBILITY_KEY}
            component={Accessibility}
            options={options} />
        <Stack.Screen
            name={ADVANCED_KEY}
            component={Advanced}
            options={options} />
        <Stack.Screen
            name={ABOUT_KEY}
            component={About}
            options={options} />
    </Stack.Navigator>;
};