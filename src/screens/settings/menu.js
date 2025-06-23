/* eslint-disable react/react-in-jsx-scope */
import { useNavigation, useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { ScrollView, TouchableNativeFeedback } from 'react-native';

import { Ctx } from '../../app';
import { Col, Row, ThemedIcon, ThemedText } from '../../components';
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
        padding: 15,
        gap: 20,
        alignItems: 'center',
    };
    const textStyle = {
        fontSize: 16 * config.uiFontScale,
        fontWeight: 'bold',
    };
    const outerStyle = {
        overflow: 'hidden',
        marginTop: 10,
        borderRadius: config.borderRadius,
        backgroundColor: theme.colors.background
    };

    return <ScrollView style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: theme.colors.card }}>
        <Col style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(APPEARANCE_KEY); }}>
                <Row style={style}>
                    <ThemedIcon accent name={'color-palette'} />
                    <Col>
                        <ThemedText content={APPEARANCE_KEY} style={textStyle} />
                        <ThemedText line content={'Theme, borders, date format and more'} />
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
        <Col style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ACCESSIBILITY_KEY); }}>
                <Row style={style}>
                    <ThemedIcon accent name={'accessibility'} />
                    <Col>
                        <ThemedText content={ACCESSIBILITY_KEY} style={textStyle} />
                        <ThemedText line content={'Fonts, high contrast, visual noise and more'} />
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
        <Col style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(BEHAVIOUR_KEY); }}>
                <Row style={style}>
                    <ThemedIcon accent name={'build'} />
                    <Col>
                        <ThemedText content={BEHAVIOUR_KEY} style={textStyle} />
                        <ThemedText line content={'Timers, notifications, tweaks and more'} />
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
        <Col style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ADVANCED_KEY); }}>
                <Row style={style}>
                    <ThemedIcon accent name={'code'} />
                    <Col>
                        <ThemedText content={ADVANCED_KEY} style={textStyle} />
                        <ThemedText line content={'Experimental features'} />
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
        <Col style={outerStyle}>
            <TouchableNativeFeedback onPress={() => { sailor.navigate(ABOUT_KEY); }}>
                <Row style={style}>
                    <ThemedIcon accent name={'information-circle'} />
                    <Col>
                        <ThemedText content={ABOUT_KEY} style={textStyle} />
                        <ThemedText line content={'Contacts, license and bug reporting'} />
                    </Col>
                </Row>
            </TouchableNativeFeedback>
        </Col>
    </ScrollView>;
};

