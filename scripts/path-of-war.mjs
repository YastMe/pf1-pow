import { MODULE_ID } from "./_moduleId.mjs";                // Module ID
import { ManeuverModel } from "./dataModels/_module.mjs";   // Data model
import { ManeuverSheet } from "./applications/_module.mjs"; // Item sheet
import { ManeuverItem } from "./documents/_module.mjs";     // Item document
import "./applications/actor/actor-skills.mjs";             // Add Skills

import { ManeuverBrowser, maneuverBrowser } from "./compendiumBrowser/maneuver-browser.mjs"; // Compendium browser


/**
 * Core initialization and integration logic for the Path of War module in Pathfinder 1e.
 * Handles registration of item types, compendium browser, actor skills, UI hooks, and data migrations.
 */

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


/**
 * Injects a custom "Browse" button for maneuvers into the provided HTML element.
 * The button is styled and configured to trigger the `maneuverBrowser` function when clicked.
 * Additionally, it adjusts its styling based on the number of existing child elements.
 *
 * @param {JQuery} html - The jQuery-wrapped HTML element where the button will be injected.
 */
function injectManeuverButton(html) {
	var buttons = html[0].children[2];
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.category = "maneuver";
	button.classList.add("compendium", "maneuver");
	button.innerText = game.i18n.localize("PF1-PathOfWar.Browse")
	buttons.append(button);
	button.addEventListener("click", maneuverBrowser)
	if (buttons.children.length % 2 == 0)
		button.classList.add("colspan-2");
}

/**
 * Registers configuration settings and item types for the module.
 * This includes adding new skills, maneuver types, save types, and feat subtypes.
 * It also sets up the sheet sections for maneuvers and martial disciplines.
 * 
 * @returns {void}
 */
function registerConfig() {
	// Add Knowledge (Martial) skill
	pf1.config.skills["kmt"] = "PF1-PathOfWar.Skills.kmt";

	// Add Autohypnosis skill
	pf1.config.skills["ahp"] = "PF1-PathOfWar.Skills.ahp";

	// Add maneuver types to config
	pf1.config.maneuverTypes = {
		Strike: {
			label: "PF1-PathOfWar.Maneuvers.Types.strike",
		},
		Boost: {
			label: "PF1-PathOfWar.Maneuvers.Types.boost",
		},
		Counter: {
			label: "PF1-PathOfWar.Maneuvers.Types.counter",
		},
		Stance: {
			label: "PF1-PathOfWar.Maneuvers.Types.stance",
		},
		Untyped: {
			label: "PF1-PathOfWar.Maneuvers.Types.untyped"
		},
		Text: {
			label: "PF1-PathOfWar.Maneuvers.Types.text",
		},
	};

	// Add save types to config
	pf1.config.maneuverSaveTypes = {
		Fortitude: {
			label: "PF1-PathOfWar.Maneuvers.SaveTypes.fortitude",
		},
		Reflex: {
			label: "PF1-PathOfWar.Maneuvers.SaveTypes.reflex",
		},
		Will: {
			label: "PF1-PathOfWar.Maneuvers.SaveTypes.will",
		},
		None: {
			label: "PF1-PathOfWar.Maneuvers.SaveTypes.none",
		},
		Special: {
			label: "PF1-PathOfWar.Maneuvers.SaveTypes.special",
		},
	};

	// Add save effects to config
	pf1.config.maneuverSaveEffects = {
		Half: {
			label: "PF1-PathOfWar.Maneuvers.SaveEffects.half",
		},
		Negates: {
			label: "PF1-PathOfWar.Maneuvers.SaveEffects.negate",
		},
		Partial: {
			label: "PF1-PathOfWar.Maneuvers.SaveEffects.partial",
		},
		Text: {
			label: "PF1-PathOfWar.Maneuvers.SaveEffects.text",
		},
	};

	// Add Martial Discipline as feat subtype
	CONFIG.PF1.featTypes["martialDiscipline"] = "PF1-PathOfWar.FeatTypes.martialDiscipline.Single";
	pf1.config.sheetSections.features.martialDiscipline = {
		label: "PF1-PathOfWar.FeatTypes.martialDiscipline.Plural",
		filters: [{ type: "feat", subTypes: ["martialDiscipline"] }],
		interface: { create: true, actions: false, types: false },
		create: { type: "feat", system: { subType: "martialDiscipline" } },
		browse: { category: "feats", featType: ["martialDiscipline"] },
		sort: 10_000
	};

	// Add section for maneuvers in Combat tab
	pf1.config.sheetSections.combat.maneuvers = {
		label: "PF1-PathOfWar.System",
		interface: { create: true, actions: false, types: true },
		filters: [{ type: `${MODULE_ID}.maneuver` }],
		create: { type: `${MODULE_ID}.maneuver` },
		browse: { category: `${MODULE_ID}.maneuver` },
		sort: 3_700,
	};
}

/**
 * Registers new item types and their corresponding sheets for the module.
 * This includes adding the Maneuver item type and its associated sheet.
 * 	
 * @returns {void}
 */
function registerItems() {
	// Register new item type
	Object.assign(CONFIG.Item.documentClasses, {
		[`${MODULE_ID}.maneuver`]: ManeuverItem
	});

	Object.assign(pf1.documents.item, {
		Maneuver: ManeuverItem
	})

	Object.assign(CONFIG.Item.dataModels, {
		[`${MODULE_ID}.maneuver`]: ManeuverModel
	});

	// Register new item sheet.
	const itemSheets = {
		[`${MODULE_ID}.maneuver`]: ManeuverSheet,
	}

	for (let [type, sheet] of Object.entries(itemSheets)) {
		DocumentSheetConfig.registerSheet(Item, MODULE_ID, sheet, {
			types: [type],
			makeDefault: true
		});
	}
}

/**
 * Injects a custom "Browse" button for maneuvers into the Combat tab of the Actor sheet.
 * The button is styled and configured to trigger the `maneuverBrowser` function when clicked.
 */
function injectCombatBrowserButton(app, html) {
	var controls = html.find(".attacks-maneuvers")[0].children[6];
	const searchManeuvers = document.createElement("a");
	searchManeuvers.classList.add("item-control", "item-search");
	searchManeuvers.innerHTML = '<i class="fas fa-folder-plus"></i> ';
	searchManeuvers.addEventListener("click", maneuverBrowser);
	controls.append(searchManeuvers);
}

function injectInitiatingModifierSelector(app, html, actor) {
	var controls = html.find(".combat")[1]
	const select = document.createElement("select");
	select.name = `flags.${MODULE_ID}.maneuverAttr`;
	const label = document.createElement("label");
	label.innerText = game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttr");
	label.setAttribute("for", select.name);
	const options = [];
	Object.entries(pf1.config.abilities).forEach(([key, value]) => {
		options.push({ value: key, label: value });
	});
	if (!actor.flags[MODULE_ID] || !actor.flags[MODULE_ID].maneuverAttr)
		actor.setFlag(MODULE_ID, "maneuverAttr", "wis");
	for (let option of options) {
		const opt = document.createElement("option");
		opt.value = option.value;
		opt.innerText = option.label;
		if (option.value === actor.flags[MODULE_ID].maneuverAttr) {
			opt.selected = true;
		}
		select.append(opt);
	}
	controls.append(label);
	controls.append(select);
}

function injectDuoPartnerSelector(app, html, currentActor) {
	var controls = html.find(".misc-settings")[0]
	const select = document.createElement("select");
	select.name = `flags.${MODULE_ID}.duoPartner`;
	const label = document.createElement("label");
	label.innerText = game.i18n.localize("PF1-PathOfWar.duoPartner");
	label.setAttribute("for", select.name);
	const actorChoices = { '': '' };
	if (!game.users.current.isGM) {
		game.actors
			.filter(actor => actor.isOwner && actor.id !== currentActor.id)
			.forEach(actor => actorChoices[actor.uuid] = `${actor.name} [${actor.id}]`);
	}
	else {
		game.actors
			.filter(actor => actor.id !== currentActor.id)
			.forEach(actor => actorChoices[actor.uuid] = `${actor.name} [${actor.id}]`);
	}
	if (!currentActor.flags[MODULE_ID] || !currentActor.flags[MODULE_ID].duoPartner)
		currentActor.setFlag(MODULE_ID, "duoPartner", '');
	for (let [key, value] of Object.entries(actorChoices)) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.innerText = value;
		if (key === currentActor.flags[MODULE_ID].duoPartner) {
			opt.selected = true;
		}
		select.append(opt);
	}
	label.classList.add("col-span-2");
	const div = document.createElement("div");
	div.classList.add("form-group", "col-6", "flexrow", "duoPartnerSelector");
	div.append(label);
	div.append(select);
	controls.append(div);
}

/**
 * Handles the visibility of save type fields and headers based on the item's save type.
 * 
 * @param {Object} item - The item being rendered.
 * @param {JQuery} html - The jQuery-wrapped HTML element of the item sheet.
 */
function handleSaveTypeVisibility(item, html) {
	let headers = html[0].querySelectorAll(".saveHeader");

	if (item.system.saveType === "None" || item.system.saveType === "Special") {
		html.find("select[name='system.saveEffect']").hide();
		for (let header of headers) {
			header.style.display = "none";
		}
	} else {
		html.find("select[name='system.saveEffect']").show();
		for (let header of headers) {
			header.style.display = "block";
		}
	}
}

/**
 * Handles the visibility of special save headers based on the item's save type.
 * 
 * @param {Object} item - The item being rendered.
 */
function handleSpecialSaveHeaders(item) {
	let headers = document.getElementsByClassName("saveHeaderSpecial");

	if (item.system.saveType === "Special") {
		for (let header of headers) {
			header.style.display = "block";
		}
	} else {
		for (let header of headers) {
			header.style.display = "none";
		}
	}
}

/**
 * Handles the visibility of charges headers based on the item's maneuver type.
 * 
 * @param {Object} item - The item being rendered.
 */
function handleChargesVisibility(item) {
	let headers = document.getElementsByClassName("chargesHeader");

	if (item.system.maneuverType === "Stance") {
		for (let header of headers) {
			header.style.display = "none";
		}
	} else {
		for (let header of headers) {
			header.style.display = "block";
		}
	}
}

/**
 * @credit claudekennilol
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData} rollData
 */
function onGetRollData(doc, rollData) {
	if (doc instanceof pf1.documents.actor.ActorPF) {
		const actor = doc;

		const attr = actor.getFlag(MODULE_ID, 'maneuverAttr') || '';
		rollData.maneuverAttr = actor.system.abilities[attr]?.mod ?? 0;
		const duoPartner = actor.getFlag(MODULE_ID, 'duoPartner') || '';
		if (duoPartner === '')
			rollData.duoPartner = null;
		else
			rollData.duoPartner = game.actors.get(foundry.utils.parseUuid(duoPartner).id) || null;
	}
}


/**
 * Module hooks for initialization, localization, and rendering.
 */

/**
 * Executes when the module is initialized.
 * It registers the configuration settings and item types for the module.
 */
Hooks.once("init", () => {
	registerConfig();
	registerItems();
	console.log(`${MODULE_ID} | Initialized`);
})

/**
 * Executes when the i18n localization system is initialized.
 * It localizes the labels for maneuver types, save types, and save effects.
 */
Hooks.once("i18nInit", () => {
	console.log(`${MODULE_ID} | Localizing`);
	for (let r of Object.values(pf1.config.maneuverTypes)) {
		r.label = game.i18n.localize(r.label);
	}
	for (let r of Object.values(pf1.config.maneuverSaveTypes)) {
		r.label = game.i18n.localize(r.label);
	}
	for (let r of Object.values(pf1.config.maneuverSaveEffects)) {
		r.label = game.i18n.localize(r.label);
	}
})

/**
 * Executes when all data is ready and the module is fully loaded.
 * It registers the Maneuver Browser and performs migration tasks for old actors.
 * Additionally, it shows a welcome dialog to users who have installed the module for the first time.
 */
Hooks.once("ready", () => {
	console.log(`${MODULE_ID} | Ready`);
	registerManeuverBrowser();
	if (game.users.activeGM === game.user) {
		migrateOldActors();
		showWelcomeDialog();
	}
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
	injectCombatBrowserButton(app, html);
	injectInitiatingModifierSelector(app, html, data.actor);
	injectDuoPartnerSelector(app, html, data.actor);
});

/**
 * Executes when the Item sheet is rendered.
 * It modifies the visibility of certain fields based on the type of maneuver being edited.
 * Specifically, it hides or shows the save information and charges information based on the maneuver type and save type.
 * It also adjusts the display of headers for save effects and charges.
 */
Hooks.on("renderItemSheet", (app, html, data) => {
	let item = app.object;

	if (item.type === "pf1-pow.maneuver") {
		handleSaveTypeVisibility(item, html);
		handleSpecialSaveHeaders(item);
		handleChargesVisibility(item);
	}
});

/**
 * Executes when RollData is requested.
 * It adds the initiation modifier to the roll data for actors using the Path of War system.
 * This allows for accurate calculations during combat and maneuver rolls.
 *
 */
Hooks.on('pf1GetRollData', onGetRollData);