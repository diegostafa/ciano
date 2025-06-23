/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { Linking, ScrollView, TouchableNativeFeedback, useWindowDimensions } from 'react-native';

import { Ctx } from '../../app';
import { Col, Row, ThemedAsset, ThemedIcon, ThemedText } from '../../components';

export const ABOUT_KEY = 'About';

export const About = () => {
    const theme = useTheme();
    const { config } = useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    return <ScrollView style={{ padding: 20, flex: 1, gap: 20 }}>
        <ThemedText content={'Ciano'} style={{ fontSize: 24 * config.uiFontScale, fontWeight: 'bold', textAlign: 'center' }} />
        <ThemedText content={'Version: 1.0.0'} style={{ textAlign: 'center' }} />
        <Col style={{ flex: 1, marginTop: 20, gap: 20, }}>
            <Col style={{
                flexDirection: isLandscape ? 'row' : 'column',
                gap: isLandscape ? 20 : 0,
            }}>

                <Col style={{ overflow: 'hidden', borderRadius: config.borderRadius }}>
                    <TouchableNativeFeedback
                        accessibilityHint='This button will open an external browser and redirect you to our GitHub page'
                        onPress={() => {
                            const url = 'https://github.com/diegostaga/ciano';
                            Linking.canOpenURL(url).then(() => {
                                Linking.openURL(url);
                            });
                        }}>
                        <Row style={{ padding: 15, alignItems: 'center', gap: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'logo-github'} />
                            <ThemedText content={'Find us on GitHub!'} />
                        </Row>
                    </TouchableNativeFeedback>
                </Col>

                <Col style={{ overflow: 'hidden', borderRadius: config.borderRadius, marginTop: isLandscape ? 0 : 20 }}>
                    <TouchableNativeFeedback
                        accessibilityHint='This button will open an external browser and redirect you to our GitHub page to submit and issue'
                        onPress={() => {
                            const url = 'https://github.com/diegostaga/ciano/issues/new';
                            Linking.canOpenURL(url).then(() => {
                                Linking.openURL(url);
                            });
                        }}>
                        <Row style={{ padding: 15, alignItems: 'center', gap: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'logo-github'} />
                            <ThemedText content={'Report an issue!'} />
                        </Row>
                    </TouchableNativeFeedback>
                </Col>
            </Col>

            <Col style={{ flex: 1, marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedAsset name={'fullLogo'} />
            </Col>
        </Col>
    </ScrollView>;
};
