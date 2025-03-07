import { cache } from "react";

import { Settings, TonguePair } from "@models";

// Possible options that can be passed to setSettings.
interface SettingsSetter {
    tonguePairId?: number;
    tonguePair?: TonguePair;
}

// The particular settings that can be modified in the Settings object.
interface SettingsSubset {
    tonguePairId?: number;
}

async function settingsGetter(): Promise<Settings> {
    const [settings, created] = await Settings.findOrCreate({
        where: {},
        defaults: {
            tonguePairId: null,
        },
        include: {
            association: "tonguePair",
            include: [{ association: "native" }, { association: "studying" }],
        },
    });
    if (created) {
        settings.tonguePair = null;
    }
    return settings;
}

let cachedSettingsGetter = cache(settingsGetter);

export async function getSettings(): Promise<Settings> {
    return await cachedSettingsGetter();
}

export async function setSettings(options: SettingsSetter) {
    const updateSettings: SettingsSubset = {};

    if ("tonguePair" in options && "tonguePairId" in options) {
        throw new Error("Cannot specify both tonguePair and tonguePairId");
    } else if ("tonguePair" in options) {
        updateSettings.tonguePairId = options.tonguePair.id;
    } else if ("tonguePairId" in options) {
        updateSettings.tonguePairId = options.tonguePairId;
    }

    await Settings.update(updateSettings, { where: {} });
    cachedSettingsGetter = cache(settingsGetter);
}
