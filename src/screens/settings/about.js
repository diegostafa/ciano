/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { Linking, TouchableNativeFeedback, View } from 'react-native';

import { Ctx } from '../../app';
import { ThemedIcon, ThemedText } from '../../utils';

export const ABOUT_KEY = 'About';

export const About = () => {
    const theme = useTheme();
    const { config } = useContext(Ctx);
    return <View style={{ padding: 20, flex: 1 }}>
        <ThemedText content={'Ciano'} style={{
            fontSize: 20
        }} />
        <ThemedText content={'Version: 1.0.0'} />

        <View style={{ flexDirection: 'row', marginTop: 20, gap: 20, }}>
            <View style={{ overflow: 'hidden', borderRadius: config.borderRadius }}>
                <TouchableNativeFeedback
                    accessibilityHint="This button will open an external browser and redirect you to our GitHub page"
                    onPress={() => {
                        const url = 'https://github.com/diegostaga/ciano';
                        Linking.canOpenURL(url).then(() => {
                            Linking.openURL(url);
                        });
                    }}>
                    <View style={{ padding: 15, flexDirection: 'row', gap: 10, backgroundColor: theme.colors.highlight }}>
                        <ThemedText content={'Find us on GitHub!'} />
                        <ThemedIcon name={'logo-github'} />
                    </View>
                </TouchableNativeFeedback>
            </View>

            <View style={{ overflow: 'hidden', borderRadius: config.borderRadius }}>
                <TouchableNativeFeedback
                    accessibilityHint="This button will open an external browser and redirect you to our GitHub page to submit and issue"
                    onPress={() => {
                        const url = 'https://github.com/diegostaga/ciano/issues/new';
                        Linking.canOpenURL(url).then(() => {
                            Linking.openURL(url);
                        });
                    }}>
                    <View style={{ padding: 15, flexDirection: 'row', gap: 10, backgroundColor: theme.colors.highlight }}>
                        <ThemedText content={'Report an issue!'} />
                        <ThemedIcon name={'logo-github'} />
                    </View>
                </TouchableNativeFeedback>
            </View>
        </View>
    </View>;
};
