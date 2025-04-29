import { DefaultTheme, DarkTheme as DT } from '@react-navigation/native';
import { StyleSheet } from 'react-native';


const LightTheme = DefaultTheme;
const DarkTheme = {
    dark: true,
    colors: {
        primary: '#458588',
        secondary: '#458588',
        background: '#1d2021',
        card: 'rgb(18, 18, 18)',
        text: 'rgb(229, 229, 231)',
        border: 'rgb(39, 39, 41)',
        notification: 'rgb(255, 69, 58)',
    },
    fonts: DT.fonts,
};

const DarkHtmlTheme = StyleSheet.create({
    // subject
    b: {
        color: '#b294bb',
    },

    // comment
    p: {
        color: DarkTheme.colors.text,
    },

    // quote
    span: {
        color: '#98971a',
    },

    // link
    a: {
        color: DarkTheme.colors.secondary,
    },
    info: {
        color: 'gray',
        fontSize: 13,
        fontStyle: 'monospace',
    },
    name: {
        fontStyle: 'italic',
        fontSize: 13,
        color: 'gray',
    },
    replies: {
        color: 'gray',
    }
});

const LightHtmlTheme = StyleSheet.create({
    p: {
        color: 'black',
    },
});




export { DarkHtmlTheme, DarkTheme, LightHtmlTheme, LightTheme };

