/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { TouchableNativeFeedback, View } from 'react-native';

import { ThemedText } from '../../utils';

export const ABOUT_KEY = 'About';

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
