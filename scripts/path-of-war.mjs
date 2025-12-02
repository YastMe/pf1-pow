import "./applications/actor/actor-skills.mjs";             // Add Skills
import { renderActorHook } from "./hooks/render/actor-sheet.mjs";
import { renderItemHook } from "./hooks/render/item-sheet.mjs";
import { readyHook } from "./hooks/ready.mjs";
import { i18nHook } from "./hooks/i18n.mjs";
import { initHook } from "./hooks/init.mjs";
import { setupHook } from "./hooks/setup.mjs";
import { injectManeuverButton, handleJumpingToSummary } from "./utils.mjs";
import { startCombatHook, turnHook } from "./hooks/combat.mjs";
import { registerConditions } from "./hooks/conditions.mjs";
import { setManeuverClassOnDrop } from "./hooks/preCreate.mjs";
import { getChangeFlat } from "./hooks/changes.mjs";
import { onGetRollData } from "./hooks/onGetRollData.mjs";

export const TEMPLATES = {
	"pf1-pow": "modules/pf1-pow/templates/actor/pf1-pow.hbs", // Path of War tab template
}

/**
 * Module hooks for initialization, localization, and rendering.
 */

Hooks.once('setup', () => {
	setupHook();
});

/**
 * Executes when the module is initialized.
 * It registers the configuration settings and item types for the module.
 */
Hooks.once("init", () => {
	initHook();
})

/**
 * Executes when the i18n localization system is initialized.
 * It localizes the labels for maneuver types, save types, and save effects.
 */
Hooks.once("i18nInit", () => {
	i18nHook();
})

/**
 * Executes when all data is ready and the module is fully loaded.
 * It registers the Maneuver Browser and performs migration tasks for old actors.
 * Additionally, it shows a welcome dialog to users who have installed the module for the first time.
 */
Hooks.once("ready", () => {
	readyHook();
});

/**
 * Executes when the Compendium Directory is rendered.
 * It injects a custom "Browse" button for maneuvers into the Compendium Directory UI.
 * This button allows users to quickly access the Maneuver Browser from the Compendium Directory.
 */
Hooks.on("renderCompendiumDirectory", async (app, html) => {
	injectManeuverButton(html)
})

/**
 * Executes when the Actor sheet is rendered.
 * It adds a custom "Browse" button for maneuvers to the Actor sheet UI.
 * This button allows users to quickly access the Maneuver Browser from the Actor sheet.
 * The button is styled and configured to trigger the `maneuverBrowser` function when clicked.
 */
Hooks.on("renderActorSheet", (app, html, data) => {
	renderActorHook(data, app, html);
});

/**
 * Executes when the Item sheet is rendered.
 * It modifies the visibility of certain fields based on the type of maneuver being edited.
 * Specifically, it hides or shows the save information and charges information based on the maneuver type and save type.
 * It also adjusts the display of headers for save effects and charges.
 */
Hooks.on("renderItemSheet", (app, html, data) => {
	renderItemHook(app, html);
});

/**
 * Executes when RollData is requested.
 * It adds the initiation modifier to the roll data for actors using the Path of War system.
 * This allows for accurate calculations during combat and maneuver rolls.
 *
 */
Hooks.on('pf1GetRollData', onGetRollData);

/**
 * This is a fix to handle the sheet jumping to the Summary tab
 * when a new maneuver is added.
 * @credit McGreger
 */
Hooks.once("libWrapper.Ready", () => {
	handleJumpingToSummary();
})

Hooks.on("combatStart", () => {
	startCombatHook();
})

Hooks.on("combatTurnChange", (combat, prior, current) => {
	turnHook(combat, prior, current);
});

Hooks.on("pf1RegisterConditions", (registry, _model) => {
  registerConditions(registry);
});

Hooks.on("preCreateItem", (document, data, options, userId) => {
	// Capture the currently active Path of War subtab name, if any
	// This handles items dropped from compendium or other sources
	setManeuverClassOnDrop(document);
});

Hooks.on("pf1GetChangeFlat", getChangeFlat);