import { getLocal, setLocal } from '../helpers';

const defaultConfig = {
    // appearance
    layoutMode: 2,
    themeMode: 2,
    relativeTime: false,
    catalogGridCols: 3,
    catalogGridRows: 4,
    catalogGridColsLandscape: 5,
    catalogGridRowsLandscape: 2,
    catalogListRows: 7,
    catalogListRowsLandscape: 3,
    borderRadius: 10,

    // accessibility
    disableMovingElements: false,
    uiFontScale: 1,
    htmlFontScale: 1,
    highContrast: false,
    autofocus: true,

    // behaviour
    defaultName: null,
    showNames: true,
    showOptionalFields: false,
    swipeToReply: false,
    showCatalogThumbnails: true,
    autoWatchThreads: true,
    autoWatchThreadsCreated: true,
    muteVideos: false,
    loopVideos: true,
    watcherUpdateSecs: 10,

    // advanced
    loadFaster: true,
    apiName: 'chan',
};
export const Config = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (config) => {
        await Promise.allSettled(Object.entries(config).map(([key, value]) =>
            setLocal(key, value).catch(err => ({ key, error: err }))
        ));
    },
    restore: async () => {
        const restored = {};
        for (const [key, defaultValue] of Object.entries(defaultConfig)) {
            restored[key] = (await getLocal(key).catch(() => null)) ?? defaultValue
        }
        return restored;
    },
    default: () => defaultConfig
};
export const setConfigAndSave = async (setConfig, key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    await Config.set(key, value);
};
export const themeModes = [
    'light',
    'dark',
    'auto',
];
export const layoutModes = [
    'ios',
    'android',
    'auto',
];