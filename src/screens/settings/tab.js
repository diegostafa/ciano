/* eslint-disable react/react-in-jsx-scope */

import { HEADER_HEIGHT, Stack } from '../../app.js';
import { About, ABOUT_KEY } from './about.js';
import { Accessibility, ACCESSIBILITY_KEY } from './accessibility.js';
import { Advanced, ADVANCED_KEY } from './advanced.js';
import { Appearance, APPEARANCE_KEY } from './appearance.js';
import { Behaviour, BEHAVIOUR_KEY } from './behaviour.js';
import { Media, MEDIA_KEY } from './media.js';
import { Menu, MENU_KEY } from './menu.js';

export const SETTINGS_TAB_KEY = 'SettingsTab';

export const SettingsTab = () => {
    const style = {
        headerStyle: { height: HEADER_HEIGHT },
    }
    return <Stack.Navigator>
        <Stack.Screen
            name={MENU_KEY}
            component={Menu}
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
            name={BEHAVIOUR_KEY}
            component={Behaviour}
            options={style} />
        <Stack.Screen
            name={ACCESSIBILITY_KEY}
            component={Accessibility}
            options={style} />
        <Stack.Screen
            name={MEDIA_KEY}
            component={Media}
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