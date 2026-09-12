import { MODULE_ID } from "../consts.mjs";
import { registerManeuverModel } from "../dataModels/item/_module.mjs";
import { registerManeuverItemSheet } from "../applications/item/maneuver.mjs";

/**
 * Register new item type and sheet.
 */
function registerItems() {
    let ManeuverModel = registerManeuverModel();
    let ManeuverSheet = registerManeuverItemSheet();
    // Register new item type

    Object.assign(CONFIG.Item.dataModels, {
        [`${MODULE_ID}.maneuver`]: ManeuverModel,
    });

    // Register new item sheet.
    const itemSheets = {
        [`${MODULE_ID}.maneuver`]: ManeuverSheet,
    };

    for (let [type, sheet] of Object.entries(itemSheets)) {
        DocumentSheetConfig.registerSheet(Item, MODULE_ID, sheet, {
            types: [type],
            makeDefault: true,
        });
    }
}

export function initHook() {
    console.log(`${MODULE_ID} | Initializing`);
    registerItems();
    console.log(`${MODULE_ID} | Initialized`);
}
