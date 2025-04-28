import { getLocal, setLocal } from "./utils";

const Theme = {
    get: async (key) => getLocal(key),
    set: async (key, value) => setLocal(key, value),
    restore: async () => {
        return {};
    },
};

export { Theme };
