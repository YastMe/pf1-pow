import { MODULE_ID } from "./consts.mjs";
import { initHook } from "./hooks/init.mjs";

/**
 * Executes when the module is initialized.
 * It registers the configuration settings and item types for the module.
 */
Hooks.once("init", () => {
    initHook();
});
