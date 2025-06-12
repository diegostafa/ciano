import { DarkTheme as DefaultDark, DefaultTheme as DefaultLight } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// todo: tweak colors:
export const LightTheme = {
    dark: false,
    colors: {
        primary: 'rgb(0, 122, 255)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(216, 216, 216)',
        notification: 'rgb(255, 59, 48)',
        highlight: 'rgba(0, 0, 0, 0.1)',
        formBg: 'rgb(57, 60, 66)'
    },
    fonts: DefaultLight.fonts,
};

export const DarkTheme = {
    dark: true,
    colors: {
        primary: 'rgb(165, 221, 255)',
        background: '#1d2021',
        card: 'rgb(18, 18, 18)',
        text: 'rgb(229, 229, 231)',
        border: 'rgb(39, 39, 41)',
        notification: 'rgb(255, 69, 58)',
        highlight: 'rgba(255, 255, 255, 0.1)',
        formBg: 'rgb(50, 50, 55)',
        overlayBg: 'rgba(0, 0, 0, 0.5)'
    },
    fonts: DefaultDark.fonts,
};

export const LightThemeHighContrast = {
    dark: false,
    colors: {
        primary: 'rgb(0, 122, 255)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(216, 216, 216)',
        notification: 'rgb(255, 59, 48)',
        highlight: 'rgba(0, 0, 0, 0.1)',
        formBg: 'rgb(57, 60, 66)'
    },
    fonts: DefaultLight.fonts,
};

export const DarkThemeHighContrast = {
    dark: true,
    colors: {
        primary: '#b294bb',
        background: '#1d2021',
        card: 'rgb(18, 18, 18)',
        text: 'rgb(229, 229, 231)',
        border: 'rgb(39, 39, 41)',
        notification: 'rgb(255, 69, 58)',
        highlight: 'rgba(255, 255, 255, 0.1)',
        formBg: 'rgb(50, 50, 55)',
        overlayBg: 'rgba(0, 0, 0, 0.5)'
    },
    fonts: DefaultDark.fonts,
};

export const DarkHtmlTheme = (config) => StyleSheet.create({
    // quote
    span: {
        color: '#98971a',
    },
    // link
    a: {
        color: DarkTheme.colors.primary,
        textDecorationLine: 'underline',
    },
    sub: {
        color: '#b294bb',
        fontWeight: 'bold',
        fontSize: 14 * config.htmlFontScale,
    },
    com: {
        color: DarkTheme.colors.text,
        fontSize: 14 * config.htmlFontScale,
    },
    info: {
        color: '#a0a0a0',
        fontSize: 13 * config.htmlFontScale,
    },
    name: {
        fontStyle: 'italic',
        fontSize: 13 * config.htmlFontScale,
        color: '#a0a0a0',
    },
    replies: {
        color: '#a0a0a0',
    }
});
export const LightHtmlTheme = (config) => StyleSheet.create({
    sub: {
        fontSize: 14 * config.htmlFontScale,
    },
    com: {
        fontSize: 14 * config.htmlFontScale,
    },
    info: {
        fontSize: 13 * config.htmlFontScale,
    },
    name: {
        fontSize: 13 * config.htmlFontScale,
    },
    p: {
        color: 'black',
    },
});
export const DarkHtmlHeaderTheme = (config) => StyleSheet.create({
    header: {
        fontWeight: 'bold',
        fontSize: 18 * config.htmlFontScale,
        color: DarkTheme.colors.text,
    },
});
export const LightHtmlHeaderTheme = (config) => StyleSheet.create({
    header: {
        fontWeight: 'bold',
        fontSize: 18 * config.htmlFontScale,
        color: DarkTheme.colors.text,
    },
});