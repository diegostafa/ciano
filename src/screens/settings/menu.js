/* eslint-disable react/react-in-jsx-scope */
import { useNavigation } from '@react-navigation/native';
import { TouchableNativeFeedback, View } from 'react-native';

import { ThemedText } from '../../utils';
import { ABOUT_KEY } from './about';
import { ACCESSIBILITY_KEY } from './accessibility';
import { APPEARANCE_KEY } from './appearance';
import { BEHAVIOUR_KEY } from './behaviour';
import { MEDIA_KEY } from './media';

export const MENU_KEY = 'SettingsMenu';

export const Menu = () => {
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
        <TouchableNativeFeedback onPress={() => { sailor.navigate(MEDIA_KEY); }}>
            <View style={style}>
                <ThemedText content={MEDIA_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(BEHAVIOUR_KEY); }}>
            <View style={style}>
                <ThemedText content={BEHAVIOUR_KEY} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => { sailor.navigate(ABOUT_KEY); }}>
            <View style={style}>
                <ThemedText content={ABOUT_KEY} />
            </View>
        </TouchableNativeFeedback>
    </View>;
};

