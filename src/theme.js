import { DarkTheme as DefaultDark, DefaultTheme as DefaultLight } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

export const DarkTheme = {
    dark: true,
    colors: {
        primary: 'rgb(165, 221, 255)',
        primaryInverted: 'rgb(0, 0, 0)',
        background: 'rgba(29, 32, 33, 1)',
        card: 'rgb(18, 18, 18)',
        highlight: 'rgba(255, 255, 255, 0.1)',
        text: 'rgb(229, 229, 231)',
        placeholder: 'rgba(255, 255, 255, 0.5)',
        border: 'rgb(39, 39, 41)',
        err: 'rgb(255, 123, 123)',
        lastVisited: 'rgba(7, 8, 8, 0.2)',
        danger: 'rgba(255, 0,0, 0.1)',
        safe: 'rgba(0, 0, 0, 0)',
        overlay: 'rgba(0, 0, 0, 0.8)',
        isQuotingMe: 'rgba(255, 251, 0, 0.5)',
        isMine: 'rgb(165, 221, 255)',
        viewReplies: 'rgba(255, 255, 255, 0.05)',
        badgeNewBg: 'rgb(176, 176, 176)',
        badgeNewFg: 'rgb(0, 0, 0)',
        badgeYouBg: 'rgb(234, 232, 105)',
        badgeYouFg: 'rgb(0, 0, 0)',
    },
    fonts: DefaultDark.fonts,
};

export const LightTheme = {
    dark: false,
    colors: {
        primary: 'rgb(0, 130, 220)', // Deeper, slightly muted blue
        primaryInverted: 'rgb(255, 255, 255)',
        background: 'rgba(235, 238, 240, 1)', // Slightly darker, warmer light grey-blue
        card: 'rgb(248, 248, 248)', // Soft off-white for cards
        highlight: 'rgba(0, 0, 0, 0.07)', // Slightly more visible highlight
        text: 'rgb(40, 40, 40)', // Darker grey for text, better contrast
        border: 'rgb(200, 205, 210)', // Slightly darker, cooler border
        err: 'rgb(200, 40, 40)', // Deeper, less vibrant red
        lastVisited: 'rgba(0, 0, 0, 0.07)',
        danger: 'rgba(200, 40, 40, 0.1)', // Deeper red with transparency
        safe: 'rgba(40, 160, 40, 0.1)', // Deeper green with transparency
        overlay: 'rgba(0, 0, 0, 0.4)', // Slightly darker overlay
        isQuotingMe: 'rgba(230, 210, 0, 0.4)', // Muted yellow with transparency
        isMine: 'rgb(60, 160, 230)', // Deeper, slightly muted blue
        viewReplies: 'rgba(0, 0, 0, 0.05)', // Slightly more visible view replies
        badgeNewBg: 'rgb(160, 160, 160)', // Slightly darker grey
        badgeNewFg: 'rgb(255, 255, 255)', // White
        badgeYouBg: 'rgb(230, 190, 60)', // More golden, less saturated yellow
        badgeYouFg: 'rgb(0, 0, 0)', // Black
    },
    fonts: DefaultLight.fonts,
};

export const DarkThemeHighContrast = {
    dark: true,
    colors: {
        primary: 'rgb(255, 255, 255)',
        primaryInverted: 'rgb(0, 0, 0)',
        background: 'rgba(0, 0, 0, 1)',
        card: 'rgb(0, 0, 0)',
        highlight: 'rgba(255, 255, 255, 0.2)',
        text: 'rgb(255, 255, 255)',
        border: 'rgb(255, 255, 255)',
        err: 'rgb(255, 0, 0)',
        lastVisited: 'rgba(255, 255, 255, 0.1)',
        danger: 'rgba(255, 0, 0, 0.2)',
        safe: 'rgba(0, 255, 0, 0.2)',
        overlay: 'rgba(0, 0, 0, 0.9)',
        isQuotingMe: 'rgba(255, 255, 0, 0.7)',
        isMine: 'rgb(255, 255, 255)',
        viewReplies: 'rgba(255, 255, 255, 0.1)',
        badgeNewBg: 'rgb(255, 255, 255)',
        badgeNewFg: 'rgb(0, 0, 0)',
        badgeYouBg: 'rgb(255, 255, 0)',
        badgeYouFg: 'rgb(0, 0, 0)',
    },
    fonts: DefaultDark.fonts,
};

export const LightThemeHighContrast = {
    dark: false,
    colors: {
        primary: 'rgb(0, 0, 0)',
        primaryInverted: 'rgb(255, 255, 255)',
        background: 'rgba(255, 255, 255, 1)',
        card: 'rgb(255, 255, 255)',
        highlight: 'rgba(0, 0, 0, 0.1)',
        text: 'rgb(0, 0, 0)',
        border: 'rgb(0, 0, 0)',
        err: 'rgb(204, 0, 0)',
        lastVisited: 'rgba(0, 0, 0, 0.1)',
        danger: 'rgba(204, 0, 0, 0.1)',
        safe: 'rgba(0, 153, 0, 0.1)',
        overlay: 'rgba(0, 0, 0, 0.6)',
        isQuotingMe: 'rgba(255, 215, 0, 0.5)',
        isMine: 'rgb(0, 0, 0)',
        viewReplies: 'rgba(0, 0, 0, 0.05)',
        badgeNewBg: 'rgb(0, 0, 0)',
        badgeNewFg: 'rgb(255, 255, 255)',
        badgeYouBg: 'rgb(255, 165, 0)',
        badgeYouFg: 'rgb(0, 0, 0)',
    },
    fonts: DefaultLight.fonts,
};

export const DarkHtmlTheme = (config) => StyleSheet.create({
    header: {
        fontWeight: 'bold',
        fontSize: 18 * config.htmlFontScale,
        color: DarkTheme.colors.text,
    },
    span: {
        color: 'rgba(152, 151, 26, 1)',
    },
    a: {
        color: DarkTheme.colors.primary,
        textDecorationLine: 'underline',
    },
    sub: {
        color: 'rgba(178, 148, 187, 1)',
        fontWeight: 'bold',
        fontSize: 14 * config.htmlFontScale,
    },
    com: {
        color: DarkTheme.colors.text,
        fontSize: 14 * config.htmlFontScale,
    },
    info: {
        color: 'rgba(160, 160, 160, 1)',
        fontSize: 13 * config.htmlFontScale,
    },
    name: {
        fontStyle: 'italic',
        fontSize: 13 * config.htmlFontScale,
        color: 'rgba(160, 160, 160, 1)',
    },
    replies: {
        color: 'rgba(160, 160, 160, 1)',
    }
});

export const LightHtmlTheme = (config) => StyleSheet.create({
    header: {
        fontWeight: 'bold',
        fontSize: 18 * config.htmlFontScale,
        color: LightTheme.colors.text,
    },
    span: {
        color: 'rgba(90, 90, 40, 1)', // Deeper, more muted green-brown
    },
    a: {
        color: LightTheme.colors.primary,
        textDecorationLine: 'underline',
    },
    sub: {
        color: 'rgba(100, 70, 130, 1)', // Deeper, more muted purple
        fontWeight: 'bold',
        fontSize: 14 * config.htmlFontScale,
    },
    com: {
        color: LightTheme.colors.text,
        fontSize: 14 * config.htmlFontScale,
    },
    info: {
        color: 'rgba(100, 100, 100, 1)', // Deeper grey
        fontSize: 13 * config.htmlFontScale,
    },
    name: {
        fontStyle: 'italic',
        fontSize: 13 * config.htmlFontScale,
        color: 'rgba(100, 100, 100, 1)', // Deeper grey
    },
    replies: {
        color: 'rgba(100, 100, 100, 1)', // Deeper grey
    }
});
