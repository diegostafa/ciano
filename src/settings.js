/* eslint-disable react/react-in-jsx-scope */
import { useNavigation, useTheme } from '@react-navigation/native';
import { Button, TouchableNativeFeedback, View } from 'react-native';

import { Repo } from './repo';
import { ThemedText } from './utils';

export const SETTINGS_MENU_KEY = 'SettingsMenu';
export const APPEARANCE_KEY = 'Appearance';
export const ACCESSIBILITY_KEY = 'Accessibility';
export const DOWNLOADS_KEY = 'Downloads';
export const ADVANCED_KEY = 'Advanced';
export const ABOUT_KEY = 'About';

export const SettingsMenu = () => {
    const sailor = useNavigation();
    const style = {
        padding: 20
    };

    return <View>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(APPEARANCE_KEY); }}>
            <View style={style}>
                <ThemedText content={APPEARANCE_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ACCESSIBILITY_KEY); }}>
            <View style={style}>
                <ThemedText content={ACCESSIBILITY_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(DOWNLOADS_KEY); }}>
            <View style={style}>
                <ThemedText content={DOWNLOADS_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ADVANCED_KEY); }}>
            <View style={style}>
                <ThemedText content={ADVANCED_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ABOUT_KEY); }}>
            <View style={style}>
                <ThemedText content={ABOUT_KEY} />
            </View>
        </TouchableNativeFeedback>
    </View>;
};
export const Appearance = () => {
    return <View>
        <ThemedText content={'todo: Appearance'} />
    </View>;
};
export const Accessibility = () => {
    return <View>
        <ThemedText content={'todo: Accessibility'} />
    </View>;
};
export const Downloads = () => {
    return <View>
        <ThemedText content={'todo: Downloads'} />
    </View>;
};
export const Advanced = () => {
    return <View>
        <Button title={'Clear cache'} onPress={async () => {
            await Repo.clear();
        }} />
        <ThemedText content={'todo: Advanced'} />
    </View>;
};
export const About = () => {
    const theme = useTheme();
    return <View style={{ padding: 20, flex: 1 }}>
        <ThemedText content={'Ciano'} style={{
            fontSize: 20
        }} />
        <ThemedText content={'Version: 0.0.1'} />

        <View>
            <TouchableNativeFeedback onPress={() => { }}>
                <View style={{ padding: 20, backgroundColor: theme.colors.highlight, borderRadius: 20 }}>
                    <ThemedText content={'Find us on GitHub!'} />
                </View>
            </TouchableNativeFeedback>

            <TouchableNativeFeedback onPress={() => { }}>
                <View style={{ padding: 20, backgroundColor: theme.colors.highlight, borderRadius: 20 }}>
                    <ThemedText content={'Report an issue!'} />
                </View>
            </TouchableNativeFeedback>
        </View>
    </View>;
};
