import { getLocal, setLocal } from "./utils";

const defaultConfig = {
    catalogMode: 'list', // 'list' or 'grid'
    catalogSort: 'new', // 'new' or 'latest' or 'replies'
    catalogCols: 3,
    catalogRows: 4,
    selectedImg: null, // this can be lowered
    themeLight: null,
    themeDark: null,
    refreshTimeout: 10, // or null
    relativeTime: false,
    swipeToReply: false,
    alias: 'Anonymous',
};
const Config = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    restore: async () => {
        return {
            catalogMode: await getLocal('catalogMode').catch(() => null) || defaultConfig.catalogMode,
            catalogSort: await getLocal('catalogSort').catch(() => null) || defaultConfig.catalogSort,
            catalogCols: await getLocal('catalogCols').catch(() => null) || defaultConfig.catalogCols,
            catalogRows: await getLocal('catalogRows').catch(() => null) || defaultConfig.catalogRows,
            selectedImg: await getLocal('selectedImg').catch(() => null) || defaultConfig.selectedImg,
            themeLight: await getLocal('themeLight').catch(() => null) || defaultConfig.themeLight,
            themeDark: await getLocal('themeDark').catch(() => null) || defaultConfig.themeDark,
            refreshTimeout: await getLocal('refreshTimeout').catch(() => null) || defaultConfig.refreshTimeout,
            relativeTime: await getLocal('relativeTime').catch(() => null) || defaultConfig.relativeTime,
            swipeToReply: await getLocal('swipeToReply').catch(() => null) || defaultConfig.swipeToReply,
            alias: await getLocal('alias').catch(() => null) || defaultConfig.alias,
        };
    },
};

export { Config };
