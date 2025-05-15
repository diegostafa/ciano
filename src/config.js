import { getLocal, setLocal } from './utils';

const defaultConfig = {
    catalogMode: 0, // 0: list, 1: grid
    catalogSort: 0, // 0: created, 1: bump, 2: # replies
    catalogRev: false,

    catalogCols: 3,
    catalogRows: 4,
    themeLight: null,
    themeDark: null,
    refreshTimeout: 15, // or null
    relativeTime: false,
    swipeToReply: false,
    alias: null,
};
export const Config = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    restore: async () => {
        return {
            catalogMode: await getLocal('catalogMode').catch(() => null) || defaultConfig.catalogMode,
            catalogSort: await getLocal('catalogSort').catch(() => null) || defaultConfig.catalogSort,
            catalogRev: await getLocal('catalogRev').catch(() => null) || defaultConfig.catalogRev,
            catalogCols: await getLocal('catalogCols').catch(() => null) || defaultConfig.catalogCols,
            catalogRows: await getLocal('catalogRows').catch(() => null) || defaultConfig.catalogRows,
            themeLight: await getLocal('themeLight').catch(() => null) || defaultConfig.themeLight,
            themeDark: await getLocal('themeDark').catch(() => null) || defaultConfig.themeDark,
            refreshTimeout: await getLocal('refreshTimeout').catch(() => null) || defaultConfig.refreshTimeout,
            relativeTime: await getLocal('relativeTime').catch(() => null) || defaultConfig.relativeTime,
            swipeToReply: await getLocal('swipeToReply').catch(() => null) || defaultConfig.swipeToReply,
            alias: await getLocal('alias').catch(() => null) || defaultConfig.alias,
        };
    },
};

export const numToMode = {
    0: 'list',
    1: 'grid',
};
export const numToSort = {
    0: 'created',
    1: 'last reply',
    2: 'replies',
};