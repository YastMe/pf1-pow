import { MODULE_ID } from "../_moduleId.mjs";
import { ManeuverBrowser } from "../compendiumBrowser/maneuver-browser.mjs";


export function readyHook() {
	console.log(`${MODULE_ID} | Ready`);
	registerManeuverBrowser();
	if (game.users.activeGM === game.user) {
		migrateOldActors();
		showWelcomeDialog();
	}
}

/**
 * Registers the Maneuver Browser in the `pf1.applications.compendiums` and `pf1.applications.compendiumBrowser` namespaces.
 * This allows users to access and interact with a specialized browser for maneuvers.
 */
function registerManeuverBrowser() {
	pf1.applications.compendiums.maneuver = new ManeuverBrowser();
	pf1.applications.compendiumBrowser.maneuver = ManeuverBrowser;
}
/**
 * Migrates existing actors by adding missing skills (`kmt` and `ahp`) to their skill list.
 * This ensures all actors have the required skills for the "Path of War" system.
 */

function migrateOldActors() {
	console.log(`${MODULE_ID} | Migrating old actors`);
	game.actors.contents.forEach(actor => {
		if (!isValidActor(actor)) return;
		addSkillIfMissing(actor, "kmt", {
			name: game.i18n.localize("PF1-PathOfWar.Skills.kmt"),
			ability: "int",
			rank: 0,
			rt: true,
			acp: false,
			background: true,
		});
		addSkillIfMissing(actor, "ahp", {
			name: game.i18n.localize("PF1-PathOfWar.Skills.ahp"),
			ability: "wis",
			rank: 0,
			rt: true,
			acp: false,
			background: true,
		});
	});
}

/**
 * Checks if an actor is valid for migration.
 * A valid actor must be of type `character` or `npc` and have a `skills` property in its system data.
 *
 * @param {Object} actor - The actor to validate.
 * @returns {boolean} - Returns `true` if the actor is valid, otherwise `false`.
 */
function isValidActor(actor) {
	return (actor.type === "character" || actor.type === "npc") && actor.system.skills;
}

/**
 * Adds a skill to an actor's skill list if it is missing.
 *
 * @param {Object} actor - The actor to update.
 * @param {string} skillKey - The key for the skill (e.g., `"kmt"` or `"ahp"`).
 * @param {Object} skillData - The data for the skill, including:
 *   - `name`: Localized name of the skill.
 *   - `ability`: Associated ability score (e.g., `"int"`, `"wis"`).
 *   - `rank`: Initial rank (default is `0`).
 *   - `rt`: Whether the skill is a class skill (boolean).
 *   - `acp`: Whether the skill is affected by armor check penalties (boolean).
 *   - `background`: Whether the skill is a background skill (boolean).
 */
function addSkillIfMissing(actor, skillKey, skillData) {
	if (actor.system.skills[skillKey] === undefined) {
		actor.update({
			system: {
				skills: {
					[skillKey]: skillData
				}
			}
		});
		console.log(`${MODULE_ID} | Added ${skillData.name} to ${actor.name}`);
	}
}

/**
 * Displays a welcome dialog to users who have installed the module for the first time.
 * The dialog introduces the module's features and provides instructions for setup.
 *
 * The dialog is only shown once per user by setting a flag (`flags.pf1pow`) on the user.
 */
function showWelcomeDialog() {
	if (!game.users.current.flags.pf1pow) {
		new Dialog({
			title: 'Path of War for Pathfinder 1e',
			content: `
            <p>Hello! Thank you for installing Path of War for Pathfinder 1e.</p>
            <p>This module includes the necessary Item and Feat types for you to create your own Martial Disciplines and Maneuvers, alongside an empty Martial Discipline to help guide in the creation of new ones.</p>
            <p>It also includes four different Macros to make your usage of the system a bit easier. While not all of them are necessary for play, they offer Quality of Life improvements that players and GM alike will enjoy!</p>
            <p>To start using the system, the macro "Set Initiation Modifier" should be called whenever a new character sheet is added. This will help you set up the relevant stats depending on the character's class.</p>
            <p>For players, it is configured to target your assigned character. For GMs, a token will need to be selected for the macro to work on the desired character.</p>
            <p>The rest of the Macros are quite self-explanatory, you can find all of the content in the relevant Compendiums</p>
            <br>
            `,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: `Close, don't show again`,
					default: 'yes'
				}
			}
		}).render(true);
		game.users.current.update({ "flags.pf1pow": true });
	}
}