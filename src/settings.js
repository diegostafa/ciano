import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';

import { ThemedText } from './utils';

const Appearance = () => {
    return <View>
        <ThemedText content={"todo: Appearance"} />
    </View>;
};
const Accessibility = () => {
    return <View>
        <ThemedText content={"todo: Accessibility"} />
    </View>;
};
const Downloads = () => {
    return <View>
        <ThemedText content={"todo: Downloads"} />
    </View>;
};
const Advanced = () => {
    return <View>
        <ThemedText content={"todo: Advanced"} />
    </View>;
};
const About = () => {
    return <View>
        <ThemedText content={"todo: About"} />
    </View>;
};


const SettingsMenu = () => {
    const sailor = useNavigation();
    return (
        <View>
            <TouchableNativeFeedback onPress={() => { sailor.navigate('Appearance'); }}>
                <View style={{ padding: 20 }}>
                    <ThemedText content={"Appearance"} />
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => { sailor.navigate('Accessibility'); }}>
                <View style={{ padding: 20 }}>
                    <ThemedText content={"Accessibility"} />
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => { sailor.navigate('Downloads'); }}>
                <View style={{ padding: 20 }}>
                    <ThemedText content={"Downloads"} />
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => { sailor.navigate('Advanced'); }}>
                <View style={{ padding: 20 }}>
                    <ThemedText content={"Advanced"} />
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => { sailor.navigate('About'); }}>
                <View style={{ padding: 20 }}>
                    <ThemedText content={"About"} />
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};



export { About, Accessibility, Advanced, Appearance, Downloads, SettingsMenu };

