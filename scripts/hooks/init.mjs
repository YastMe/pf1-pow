import { MODULE_ID } from "../_moduleId.mjs";
import { ManeuverSheet } from "../applications/_module.mjs";
import { ManeuverModel } from "../dataModels/_module.mjs";
import { ManeuverItem } from "../documents/_module.mjs";


export function initHook() {
	registerConfig();
	registerItems();
	console.log(`${MODULE_ID} | Initialized`);
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
		}
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

	// Add Disciplines to config
	pf1.config.disciplines = {
		blackSeraph: "PF1-PathOfWar.Disciplines.blackSeraph",
		brokenBlade: "PF1-PathOfWar.Disciplines.brokenBlade",
		cursedRazor: "PF1-PathOfWar.Disciplines.cursedRazor",
		elementalFlux: "PF1-PathOfWar.Disciplines.elementalFlux",
		eternalGuardian: "PF1-PathOfWar.Disciplines.eternalGuardian",
		foolsErrand: "PF1-PathOfWar.Disciplines.foolsErrand",
		goldenLion: "PF1-PathOfWar.Disciplines.goldenLion",
		ironTortoise: "PF1-PathOfWar.Disciplines.ironTortoise",
		mithralCurrent: "PF1-PathOfWar.Disciplines.mithralCurrent",
		piercingThunder: "PF1-PathOfWar.Disciplines.piercingThunder",
		primalFury: "PF1-PathOfWar.Disciplines.primalFury",
		radiantDawn: "PF1-PathOfWar.Disciplines.radiantDawn",
		rivenHourglass: "PF1-PathOfWar.Disciplines.rivenHourglass",
		sagittaStellaris: "PF1-PathOfWar.Disciplines.sagittaStellaris",
		scarletThrone: "PF1-PathOfWar.Disciplines.scarletThrone",
		shatteredMirror: "PF1-PathOfWar.Disciplines.shatteredMirror",
		silverCrane: "PF1-PathOfWar.Disciplines.silverCrane",
		sleepingGoddess: "PF1-PathOfWar.Disciplines.sleepingGoddess",
		solarWind: "PF1-PathOfWar.Disciplines.solarWind",
		steelSerpent: "PF1-PathOfWar.Disciplines.steelSerpent",
		tempestGale: "PF1-PathOfWar.Disciplines.tempestGale",
		thrashingDragon: "PF1-PathOfWar.Disciplines.thrashingDragon",
		unquietGrave: "PF1-PathOfWar.Disciplines.unquietGrave",
		veiledMoon: "PF1-PathOfWar.Disciplines.veiledMoon"
	}

	// Add Levels to config
	pf1.config.maneuverLevels = {
		1: "PF1-PathOfWar.Maneuvers.Levels.1",
		2: "PF1-PathOfWar.Maneuvers.Levels.2",
		3: "PF1-PathOfWar.Maneuvers.Levels.3",
		4: "PF1-PathOfWar.Maneuvers.Levels.4",
		5: "PF1-PathOfWar.Maneuvers.Levels.5",
		6: "PF1-PathOfWar.Maneuvers.Levels.6",
		7: "PF1-PathOfWar.Maneuvers.Levels.7",
		8: "PF1-PathOfWar.Maneuvers.Levels.8",
		9: "PF1-PathOfWar.Maneuvers.Levels.9"
	};

	// Add progression types to config
	pf1.config.powClassProgressionTypes = {
		"none": "PF1-PathOfWar.Maneuvers.ProgressionTypes.none",
		"class": "PF1-PathOfWar.Maneuvers.ProgressionTypes.class",
		"archetype": "PF1-PathOfWar.Maneuvers.ProgressionTypes.archetype",
	};
	pf1.config.powManeuverGrantTypes = {
		"regular": "PF1-PathOfWar.Maneuvers.GrantTypes.regular",
		"granted": "PF1-PathOfWar.Maneuvers.GrantTypes.granted",
	}

	// Add buff categories to config
	pf1.config.buffTargetCategories.pow = {
		label: "PF1-PathOfWar.BuffCategories.pow",
		filters: {}
	}

	pf1.config.buffTargets.powinitiatorLevelBonus = {
		label: "PF1-PathOfWar.BuffTargets.powInitiatorLevel",
		category: "pow",
	}

	pf1.config.buffTargets.powinitiatorModifierBonus = {
		label: "PF1-PathOfWar.BuffTargets.powInitiatorModifier",
		category: "pow",
	}

	for (let disciplineKey of Object.keys(pf1.config.disciplines)) {
		pf1.config.buffTargets[`pow${disciplineKey}`] = {
			label: `PF1-PathOfWar.BuffTargets.powDisciplineDC.${disciplineKey}`,
			category: "pow",
		};
	}

	// Add Martial Discipline as feat subtype
	CONFIG.PF1.featTypes["martialDiscipline"] = "PF1-PathOfWar.FeatTypes.martialDiscipline.Single";
	pf1.config.sheetSections.features.martialDiscipline = {
		label: "PF1-PathOfWar.FeatTypes.martialDiscipline.Plural",
		filters: [{ type: "feat", subTypes: ["martialDiscipline"] }],
		interface: { create: true, actions: false, types: false },
		create: { type: "feat", system: { subType: "martialDiscipline" } },
		browse: { category: "feats", featType: ["martialDiscipline"] },
		sort: 10000
	};

	// Add Stance as a buff subtype
	CONFIG.PF1.buffTypes["stance"] = "PF1-PathOfWar.Stances.Single";
	pf1.config.sheetSections.buffs.stance = {
		label: "PF1-PathOfWar.Stances.Plural",
		filters: [{ type: "buff", subTypes: ["stance"] }],
		interface: { create: true, actions: true, types: false },
		create: { type: "buff", system: { subType: "stance" } },
		browse: { category: "buffs", buffType: ["stance"] },
		sort: 10000
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
	});

	Object.assign(CONFIG.Item.dataModels, {
		[`${MODULE_ID}.maneuver`]: ManeuverModel
	});

	// Register new item sheet.
	const itemSheets = {
		[`${MODULE_ID}.maneuver`]: ManeuverSheet,
	};

	for (let [type, sheet] of Object.entries(itemSheets)) {
		DocumentSheetConfig.registerSheet(Item, MODULE_ID, sheet, {
			types: [type],
			makeDefault: true
		});
	}
}

