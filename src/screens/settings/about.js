/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { Linking, ScrollView, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';

import { Ctx } from '../../app';
import { ThemedAsset, ThemedIcon, ThemedText } from '../../components';

export const ABOUT_KEY = 'About';

export const About = () => {
    const theme = useTheme();
    const { config } = useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    return <ScrollView style={{ padding: 20, flex: 1, gap: 20 }}>
        <ThemedText content={'Ciano'} style={{ fontSize: 20, textAlign: 'center' }} />
        <ThemedText content={'Version: 1.0.0'} style={{ textAlign: 'center' }} />

        <View style={{ flex: 1, marginTop: 20, gap: 20, }}>
            <View style={{
                flexDirection: isLandscape ? 'row' : 'column',
                gap: isLandscape ? 20 : 0,
            }}>

                <View style={{ overflow: 'hidden', borderRadius: config.borderRadius }}>
                    <TouchableNativeFeedback
                        accessibilityHint="This button will open an external browser and redirect you to our GitHub page"
                        onPress={() => {
                            const url = 'https://github.com/diegostaga/ciano';
                            Linking.canOpenURL(url).then(() => {
                                Linking.openURL(url);
                            });
                        }}>
                        <View style={{ padding: 15, alignItems: 'center', flexDirection: 'row', gap: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'logo-github'} />
                            <ThemedText content={'Find us on GitHub!'} />
                        </View>
                    </TouchableNativeFeedback>
                </View>

                <View style={{ overflow: 'hidden', borderRadius: config.borderRadius, marginTop: isLandscape ? 0 : 20 }}>
                    <TouchableNativeFeedback
                        accessibilityHint="This button will open an external browser and redirect you to our GitHub page to submit and issue"
                        onPress={() => {
                            const url = 'https://github.com/diegostaga/ciano/issues/new';
                            Linking.canOpenURL(url).then(() => {
                                Linking.openURL(url);
                            });
                        }}>
                        <View style={{ padding: 15, alignItems: 'center', flexDirection: 'row', gap: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'logo-github'} />
                            <ThemedText content={'Report an issue!'} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>

            <View style={{ flex: 1, marginTop: 30, alignContent: 'center', alignItems: 'center' }}>
                <ThemedAsset name={'fullLogo'} width={200} height={200} />
            </View>
        </View>
    </ScrollView>;
};
