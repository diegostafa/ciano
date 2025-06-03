import { api } from "../data/api";
import { getLocal, setLocal } from "../utils";

const defaultConfig = {
    // appearance
    themeMode: 2, // 0:light, 1:dark, 2:auto
    themeLight: null,
    themeDark: null,
    relativeTime: false,
    catalogGridCols: 3, catalogGridRows: 4,
    catalogGridColsLandscape: 5, catalogGridRowsLandscape: 2,
    catalogListRows: 7, catalogListRowsLandscape: 3,
    borderRadius: 10,

    // accessibility
    disableMovingElements: false,

    // behaviour
    alias: null,
    swipeToReply: false,
    showCatalogThumbnails: true,
    loadFaster: true,
    autoWatchThreads: true,
    muteVideos: false,
    loopVideos: true,

    // advanced
    api: api.ciano,

};
export const Config = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    save: async (config) => {
        for (const [key, value] of Object.keys(config)) {
            await setLocal(key, value);
        }
    },
    restore: async () => {
        const restored = {};
        for (const [key, defaultValue] of Object.entries(defaultConfig)) {
            restored[key] = (await getLocal(key).catch(() => null)) || defaultValue
        }
        return restored;
    },
};