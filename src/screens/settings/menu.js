/* eslint-disable react/react-in-jsx-scope */
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableNativeFeedback, View } from 'react-native';

import { ThemedIcon, ThemedText } from '../../utils';
import { ABOUT_KEY } from './about';
import { ACCESSIBILITY_KEY } from './accessibility';
import { ADVANCED_KEY } from './advanced';
import { APPEARANCE_KEY } from './appearance';
import { BEHAVIOUR_KEY } from './behaviour';

export const MENU_KEY = 'SettingsMenu';

export const Menu = () => {
    const sailor = useNavigation();
    const style = {
        flexDirection: 'row',
        padding: 20,
        gap: 20,
        alignItems: 'center',
    };

    return <ScrollView>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(APPEARANCE_KEY); }}>
            <View style={style}>
                <ThemedIcon name={'color-palette'} />
                <ThemedText content={APPEARANCE_KEY} style={{ fontSize: 16, fontWeight: 'bold' }} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ACCESSIBILITY_KEY); }}>
            <View style={style}>
                <ThemedIcon name={'accessibility'} />
                <ThemedText content={ACCESSIBILITY_KEY} style={{ fontWeight: 'bold' }} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(BEHAVIOUR_KEY); }}>
            <View style={style}>
                <ThemedIcon name={'build'} />
                <ThemedText content={BEHAVIOUR_KEY} style={{ fontWeight: 'bold' }} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ADVANCED_KEY); }}>
            <View style={style}>
                <ThemedIcon name={'code'} />
                <ThemedText content={ADVANCED_KEY} style={{ fontWeight: 'bold' }} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ABOUT_KEY); }}>
            <View style={style}>
                <ThemedIcon name={'information-circle'} />
                <ThemedText content={ABOUT_KEY} style={{ fontWeight: 'bold' }} />
            </View>
        </TouchableNativeFeedback>
    </ScrollView>;
};

