import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';


const Appearance = () => {
    return <View>
        <Text>todo: Appearance</Text>
    </View>;
};
const Accessibility = () => {
    return <View>
        <Text>todo: Accessibility</Text>
    </View>;
};
const Downloads = () => {
    return <View>
        <Text>todo: Downloads</Text>
    </View>;
};
const About = () => {
    return <View>
        <Text>todo: About</Text>
    </View>;
};


const SettingsMenu = () => {
    const sailor = useNavigation();
    return (
        <View style={styles.container}>
            <Pressable onPress={() => { sailor.navigate('Appearance'); }}>
                <View style={{ padding: 20 }}>
                    <Text>Appearance</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => { sailor.navigate('Accessibility'); }}>
                <View style={{ padding: 20 }}>
                    <Text>Accessibility</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => { sailor.navigate('Downloads'); }}>
                <View style={{ padding: 20 }}>
                    <Text>Downloads</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => { sailor.navigate('About'); }}>
                <View style={{ padding: 20 }}>
                    <Text>About</Text>
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    item: {
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
    },
});


export { About, Accessibility, Appearance, Downloads, SettingsMenu };

