/* eslint-disable react/react-in-jsx-scope */
import { useNavigation, useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { ScrollView, TouchableNativeFeedback, View } from 'react-native';

import { Ctx } from '../../app';
import { ThemedIcon, ThemedText } from '../../components';
import { ABOUT_KEY } from './about';
import { ACCESSIBILITY_KEY } from './accessibility';
import { ADVANCED_KEY } from './advanced';
import { APPEARANCE_KEY } from './appearance';
import { BEHAVIOUR_KEY } from './behaviour';

export const MENU_KEY = 'SettingsMenu';

export const Menu = () => {
    const { config } = useContext(Ctx);
    const theme = useTheme();
    const sailor = useNavigation();
    const style = {
        flexDirection: 'row',
        padding: 15,
        gap: 20,
        alignItems: 'center',
    };
    const textStyle = {
        fontSize: 16,
        fontWeight: 'bold',
    };
    const outerStyle = {
        overflow: 'hidden',
        marginTop: 10,
        borderRadius: config.borderRadius,
        backgroundColor: theme.colors.card,
    };


    return <ScrollView style={{ marginLeft: 10, marginRight: 10 }}>
        <View style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(APPEARANCE_KEY); }}>
                <View style={style}>
                    <ThemedIcon accent={true} name={'color-palette'} />
                    <ThemedText content={APPEARANCE_KEY} style={textStyle} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ACCESSIBILITY_KEY); }}>
                <View style={style}>
                    <ThemedIcon accent={true} name={'accessibility'} />
                    <ThemedText content={ACCESSIBILITY_KEY} style={textStyle} />
                </View>
            </TouchableNativeFeedback>

        </View>
        <View style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(BEHAVIOUR_KEY); }}>
                <View style={style}>
                    <ThemedIcon accent={true} name={'build'} />
                    <ThemedText content={BEHAVIOUR_KEY} style={textStyle} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ADVANCED_KEY); }}>
                <View style={style}>
                    <ThemedIcon accent={true} name={'code'} />
                    <ThemedText content={ADVANCED_KEY} style={textStyle} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ABOUT_KEY); }}>
                <View style={style}>
                    <ThemedIcon accent={true} name={'information-circle'} />
                    <ThemedText content={ABOUT_KEY} style={textStyle} />
                </View>
            </TouchableNativeFeedback>
        </View>
    </ScrollView>;
};

