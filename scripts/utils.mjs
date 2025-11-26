import { MODULE_ID } from "./_moduleId.mjs";
import { maneuverBrowser } from "./compendiumBrowser/maneuver-browser.mjs";


/**
 * Injects a custom "Browse" button for maneuvers into the provided HTML element.
 * The button is styled and configured to trigger the `maneuverBrowser` function when clicked.
 * Additionally, it adjusts its styling based on the number of existing child elements.
 *
 * @param {JQuery} html - The jQuery-wrapped HTML element where the button will be injected.
 */
export function injectManeuverButton(html) {
	let footer;
	if (html && typeof html.find === "function") {
		footer = html.find(".directory-footer");
		if (footer.length > 0) {
			footer = footer[0];
		} else {
			footer = $("section.action-buttons")[0];
		}
	} else {
		footer = $("section.action-buttons")[0];
	}

	if (!footer || footer.querySelector('button[data-category="maneuver"]')) return;

	const button = document.createElement("button");
	button.type = "button";
	button.dataset.category = "maneuver";
	button.classList.add("compendium", "maneuver");
	button.innerText = game.i18n.localize("PF1-PathOfWar.Browse");
	footer.appendChild(button);
	button.addEventListener("click", maneuverBrowser);
	if (footer.children.length % 2 === 0)
		button.classList.add("colspan-2");
}


export function handleJumpingToSummary() {
	libWrapper.register(MODULE_ID, 'pf1.applications.actor.ActorSheetPF.prototype._focusTabByItem', function (wrapped, item) {
		wrapped(item);

		if (item.type === "pf1-pow.maneuver") {
			this._forceShowManeuverTab = true;
		}
	}, 'WRAPPER');

	libWrapper.register(MODULE_ID, 'pf1.applications.actor.ActorSheetPF.prototype._onItemCreate', function (wrapped, event) {
		wrapped(event);

		const el = event.currentTarget;

		const [categoryId, sectionId] = el.dataset.create?.split('.') ?? [];
		const createData = foundry.utils.deepClone(pf1.config.sheetSections[categoryId]?.[sectionId]?.create);
		if (!createData) throw new Error(`No create data found for category ${categoryId} and section ${sectionId}`);
		if (type === "pf1-pow.maneuver") {
			this._forceShowManeuverTab = true;
		}
	}, 'WRAPPER');

	libWrapper.register(MODULE_ID, 'pf1.applications.item.ItemSheetPF.prototype._onSubmit', function (wrapped, event) {
		wrapped(event);
		const el = event.currentTarget;

		if (!el) return;

		const offsetParent = el.offsetParent;
		if (!offsetParent) return;
		if (offsetParent.id.includes("Maneuver")) {
			const actorId = offsetParent.id.split("-")[2];
			const actor = game.actors.get(actorId);
			actor.sheet._forceShowManeuverTab = true;
		}
	}, 'WRAPPER');
}

/**
 * Gets actor settings related to maneuvers
 */
function getActorManeuverSettings(actor) {
	const attr = actor.getFlag(MODULE_ID, 'maneuverAttr') || '';
	const duoPartner = actor.getFlag(MODULE_ID, 'duoPartner') || '';

	return {
		attr,
		globalManeuverAttr: actor.system.abilities[attr]?.mod ?? 0,
		duoPartner: duoPartner === '' ? null : game.actors.get(foundry.utils.parseUuid(duoPartner).id) || null,
		sparker: actor.getFlag(MODULE_ID, 'sparker') || false,
		martiallyTrained: actor.getFlag(MODULE_ID, 'martialTrainingLevel'),
		combatTrainingTrait: actor.getFlag(MODULE_ID, 'combatTrainingTrait') || false,
		advancedStudyFeat: actor.getFlag(MODULE_ID, 'advancedStudyFeat') || false
	};
}

/**
 * Gets the initiator attribute modifier for a specific class
 */
function getClassManeuverAttr(actor, classItem, settings) {
	// If class has a specific initiator attribute set, use that
	if (classItem?.system?.maneuverProgression?.initiatorAttr) {
		const attr = classItem.system.maneuverProgression.initiatorAttr;
		return actor.system.abilities[attr]?.mod ?? 0;
	}
	// Otherwise fall back to global setting
	return settings.globalManeuverAttr;
}

/**
 * Calculates the initiator level based on actor classes and settings
 * Returns per-class initiator level data.
 * Rules:
 * - Single-class martial disciple: initiator level = class level
 * - No martial disciple levels: initiator level = ½ character level
 * - Multiclass martial disciple: full levels in martial classes + ½ levels in non-martial classes
 * - Sparker: initiator level = BAB (global)
 * - Martial Training feat: initiator level = ½ character level + initiation modifier (global)
 */
function calculateInitiatorLevel(actor, settings) {
	const classes = Array.from(actor.items).filter(item => item.type === "class");
	const notInitClasses = classes.filter(c =>
		c.system.maneuverProgression?.classType === "none" ||
		c.system.maneuverProgression?.classType === "" ||
		!c.system.maneuverProgression?.classType
	);
	const initClasses = classes.filter(c =>
		c.system.maneuverProgression?.classType === "class" ||
		c.system.maneuverProgression?.classType === "archetype"
	);

	let maxLevelInitClass = null;
	let maneuversGranted = false;
	const classInitiatorLevels = new Map();

	for (const c of initClasses) {
		if (!maxLevelInitClass || c.system.level > maxLevelInitClass.system.level) {
			maxLevelInitClass = c;
		}
		if (c.system?.maneuverProgression?.type === "granted") {
			maneuversGranted = true;
		}
	}

	const archetypeInitiator = maxLevelInitClass?.system?.maneuverProgression?.classType === "archetype";
	const characterLevel = actor.system.attributes.hd.total;
	let globalInitLevel = 0;

	// Sparker rule: initiator level = BAB (applies globally)
	if (settings.sparker) {
		globalInitLevel = actor.system.attributes.bab.total;
		for (const c of classes) {
			classInitiatorLevels.set(c.id, {
				classId: c.id,
				className: c.name,
				initLevel: globalInitLevel,
				isArchetype: false
			});
		}
	}
	// Calculate per-class initiator levels for martial disciples
	else if (initClasses.length > 0) {
		// For each martial class, calculate its initiator level
		for (const c of initClasses) {
			const classLevel = c.system.level || 0;
			const isArchetype = c.system?.maneuverProgression?.classType === "archetype";

			// Calculate half of all OTHER class levels
			let halfOtherLevels = 0;

			// Always add half of other martial classes
			for (const otherClass of initClasses) {
				// Skip the current class
				if (otherClass.id === c.id) continue;
				halfOtherLevels += (otherClass.system.level || 0) / 2;
			}

			// Add half of non-martial classes unless ignoring them
			if (!actor.getFlag(MODULE_ID, 'ignoreNonInitiatorClasses')) {
				for (const otherClass of notInitClasses) {
					halfOtherLevels += (otherClass.system.level || 0) / 2;
				}
			}

			// This class's full level + half of all other class levels
			const initLevel = Math.min(
				Math.floor(classLevel + halfOtherLevels),
				characterLevel
			);

			classInitiatorLevels.set(c.id, {
				classId: c.id,
				className: c.name,
				initLevel: initLevel,
				isArchetype: isArchetype,
				classLevel: classLevel
			});

			globalInitLevel = Math.max(globalInitLevel, initLevel);
		}
	}
	// No martial disciple levels: initiator level = ½ character level
	else {
		globalInitLevel = Math.floor(characterLevel / 2);
	}

	// Martial Training feat: adds an additional "class" entry for feat-granted maneuvers
	if (settings.martiallyTrained) {
		const martialTrainingInitLevel = Math.floor(characterLevel / 2) + (actor.system.abilities[settings.attr]?.mod || 0);
		classInitiatorLevels.set('martialTraining', {
			classId: 'martialTraining',
			className: 'Martial Training',
			initLevel: martialTrainingInitLevel,
			isArchetype: false
		});
		globalInitLevel = Math.max(globalInitLevel, martialTrainingInitLevel);
	}

	// Ensure global initiator level doesn't exceed character level
	if (globalInitLevel > characterLevel) {
		globalInitLevel = characterLevel;
	}

	return {
		initLevel: globalInitLevel,
		maneuversGranted,
		archetypeInitiator,
		classInitiatorLevels
	};
}

/**
 * Calculates the maximum maneuver level for the actor or a specific class
 */
function calculateMaxManeuverLevel(initLevel, classLevel, settings, isArchetype = false) {
	if (settings.martiallyTrained) {
		return Math.min(6, Math.ceil(initLevel / 2));
	} else if (settings.advancedStudyFeat) {
		return Math.min(9, Math.ceil(initLevel / 2));
	} else if (isArchetype) {
		if (classLevel < 7)
			return (Math.max(1, Math.ceil(classLevel / 3)));
		else
			return Math.min(6, Math.floor((classLevel - 1) / 2));
	} else {
		return Math.min(9, Math.floor(classLevel / 2));
	}
}

/**
 * Counts current maneuvers prepared and known per class
 */
function countManeuvers(actor, settings, classInitiatorLevels) {
	const perClassCounts = {};
	let globalPrepared = 0;
	let globalKnown = 0;

	// Initialize counts for each class
	for (const classId of classInitiatorLevels.keys()) {
		perClassCounts[classId] = { prepared: 0, known: 0 };
	}

	actor.items.forEach(item => {
		if (item.type === "pf1-pow.maneuver") {
			const itemClass = item.system.class;
			let classId = null;

			// Check if this is a Martial Training maneuver
			if (itemClass === "Martial Training") {
				classId = 'martialTraining';
			} else if (itemClass) {
				// Find the class item by name
				classId = actor.items.find(c => c.name === itemClass)?.id || null;
			}

			// Count prepared maneuvers (non-stances only)
			if (item.system.ready && item.system.maneuverType !== "Stance") {
				globalPrepared += 1;
				if (classId && perClassCounts[classId]) {
					perClassCounts[classId].prepared += 1;
				}
			}

			// Count known maneuvers
			const countAsKnown = settings.sparker ? item.system.maneuverType !== "Stance" : true;
			if (countAsKnown) {
				globalKnown += 1;
				if (classId && perClassCounts[classId]) {
					perClassCounts[classId].known += 1;
				}
			}
		}
	});

	return {
		maneuversPrepared: globalPrepared,
		maneuversKnown: globalKnown,
		perClass: perClassCounts
	};
}

/**
 * Calculates maximum maneuvers that can be prepared and known per class
 * Returns per-class max values and stores the maneuverAttr for each class
 */
function calculateMaxManeuvers(actor, settings, classInitiatorLevels) {
	const perClassMax = {};
	let globalMaxPrepared = 0;
	let globalMaxKnown = 0;

	// For Sparker: global limits apply to all classes
	if (settings.sparker) {
		const babInitLevel = actor.system.attributes.bab.total;
		const maneuverAttr = settings.globalManeuverAttr;
		globalMaxPrepared = Math.floor(babInitLevel / 2) + 2;
		globalMaxKnown = babInitLevel + maneuverAttr;

		// All classes share the same limits for sparkers
		for (const [classId, classData] of classInitiatorLevels) {
			perClassMax[classId] = {
				maxPrepared: globalMaxPrepared,
				maxKnown: globalMaxKnown,
				maneuverAttr: maneuverAttr
			};
		}
	}
	// For non-sparkers: only Martial Training has hard limits
	// Regular martial disciples learn maneuvers through class progression
	else {
		// Process each martial disciple class (set values to 0 since they don't have hard limits)
		for (const [classId, classData] of classInitiatorLevels) {
			// Skip Martial Training entry, handle it separately below
			if (classId === 'martialTraining') continue;

			const classItem = actor.items.get(classId);
			const maneuverAttr = getClassManeuverAttr(actor, classItem, settings);

			// Regular classes don't have hard limits on prepared/known
			// They learn maneuvers through class progression tables
			perClassMax[classId] = {
				maxPrepared: 0,
				maxKnown: 0,
				maneuverAttr: maneuverAttr
			};
		}

		// Add Martial Training limits if present
		if (settings.martiallyTrained) {
			let mtMaxPrepared = settings.martiallyTrained;
			let mtMaxKnown = 0;

			switch (settings.martiallyTrained) {
				case 1: mtMaxKnown = 2; break;
				case 2: mtMaxKnown = 5; break;
				case 3: mtMaxKnown = 7; break;
				case 4: mtMaxKnown = 9; break;
				case 5: mtMaxKnown = 11; break;
				case 6: mtMaxKnown = 13; break;
				default: mtMaxKnown = 0;
			}

			perClassMax['martialTraining'] = {
				maxPrepared: mtMaxPrepared,
				maxKnown: mtMaxKnown,
				maneuverAttr: settings.globalManeuverAttr
			};

			globalMaxPrepared += mtMaxPrepared;
			globalMaxKnown += mtMaxKnown;
		}
	}

	return {
		maxManeuversPrepared: globalMaxPrepared,
		maxManeuversKnown: globalMaxKnown,
		perClass: perClassMax
	};
}

/**
 * Applies combat training trait bonuses
 */
function applyCombatTrainingTrait(settings, maxManeuversKnown, maxManeuversPrepared, powData) {
	if (settings.combatTrainingTrait) {
		maxManeuversKnown += 1;
		maxManeuversPrepared += 1;
		if (powData.initLevel === 0) {
			powData.initLevel = 1;
			powData.maxManeuverLevel = 1;
		}
	}
	return { maxManeuversKnown, maxManeuversPrepared };
}

/**
 * Counts maneuvers that are over the maximum level
 */
function countManeuversOverMaxLevel(actor, maxManeuverLevel) {
	let count = 0;
	actor.items.forEach(item => {
		if (item.type === "pf1-pow.maneuver" && item.system.level > maxManeuverLevel) {
			count += 1;
		}
	});
	return count;
}

/**
 * @credit claudekennilol
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData} rollData
 */
export function onGetRollData(doc, rollData) {
	try {
		if (doc instanceof pf1.documents.actor.ActorPF) {
			const actor = doc;

			// Initialize Path of War namespace in rollData
			rollData.pow = rollData.pow || {};

			// Get actor settings
			const settings = getActorManeuverSettings(actor);
			rollData.pow.maneuverAttr = settings.globalManeuverAttr;
			rollData.pow.duoPartner = settings.duoPartner;

			// Calculate initiator level (per-class and global)
			const { initLevel, maneuversGranted, archetypeInitiator, classInitiatorLevels } = calculateInitiatorLevel(actor, settings);
			rollData.pow.initLevel = initLevel;
			rollData.pow.maneuversGranted = maneuversGranted;

			// Count maneuvers per class (must be done before storing class data)
			const { maneuversPrepared, maneuversKnown, perClass: perClassCounts } = countManeuvers(actor, settings, classInitiatorLevels);

			// Calculate maximums per class (must be done before storing class data)
			const { maxManeuversPrepared, maxManeuversKnown, perClass: perClassMax } = calculateMaxManeuvers(
				actor,
				settings,
				classInitiatorLevels
			);

			// Store per-class initiator levels and maneuver counts
			rollData.pow.classInitiatorLevels = {};
			for (const [classId, classData] of classInitiatorLevels) {
				rollData.pow.classInitiatorLevels[classId] = {
					initLevel: classData.initLevel,
					className: classData.className,
					maxManeuverLevel: calculateMaxManeuverLevel(classData.initLevel, classData.classLevel, settings, classData.isArchetype),
					maneuversPrepared: perClassCounts[classId]?.prepared || 0,
					maneuversKnown: perClassCounts[classId]?.known || 0,
					maxManeuversPrepared: perClassMax[classId]?.maxPrepared || 0,
					maxManeuversKnown: perClassMax[classId]?.maxKnown || 0,
					maneuverAttr: perClassMax[classId]?.maneuverAttr || 0
				};
			}

			// Calculate global max maneuver level (highest across all classes)
			let maxManeuverLevel = 0;
			for (const classData of Object.values(rollData.pow.classInitiatorLevels)) {
				maxManeuverLevel = Math.max(maxManeuverLevel, classData.maxManeuverLevel);
			}
			if (settings.martiallyTrained) {
				maxManeuverLevel = settings.martiallyTrained;
			}
			rollData.pow.maxManeuverLevel = maxManeuverLevel;

			// Apply combat training trait
			({ maxManeuversKnown, maxManeuversPrepared } = applyCombatTrainingTrait(
				settings,
				maxManeuversKnown,
				maxManeuversPrepared,
				rollData.pow
			));

			// Count over-level maneuvers
			const maneuversOverMaxLevel = countManeuversOverMaxLevel(actor, rollData.pow.maxManeuverLevel);

			// Set all rollData.pow values
			rollData.pow.maneuversOverMaxLevel = maneuversOverMaxLevel;
			rollData.pow.maneuversPrepared = maneuversPrepared;
			rollData.pow.maxManeuversPrepared = maxManeuversPrepared;
			rollData.pow.maneuversKnown = maneuversKnown;
			rollData.pow.maxManeuversKnown = maxManeuversKnown;

			// Backward compatibility: maintain old rollData structure for external modules
			rollData.maneuverAttr = rollData.pow.maneuverAttr;
			rollData.duoPartner = rollData.pow.duoPartner;
			rollData.initLevel = rollData.pow.initLevel;
			rollData.maneuversGranted = rollData.pow.maneuversGranted;
			rollData.maxManeuverLevel = rollData.pow.maxManeuverLevel;
			rollData.maneuversOverMaxLevel = rollData.pow.maneuversOverMaxLevel;
			rollData.maneuversPrepared = rollData.pow.maneuversPrepared;
			rollData.maxManeuversPrepared = rollData.pow.maxManeuversPrepared;
			rollData.maneuversKnown = rollData.pow.maneuversKnown;
			rollData.maxManeuversKnown = rollData.pow.maxManeuversKnown;
			rollData.classInitiatorLevels = rollData.pow.classInitiatorLevels;
		}
	} catch (error) {
		return;
	}
}

export function grantDialogue(actor) {
	let maneuvers = actor.items.filter(i => i.type === "pf1-pow.maneuver" && i.system.ready);
	for (const maneuver of maneuvers)
		maneuver.ungrantSilent();

	maneuvers = new Map(maneuvers.map(m => [m.id, m]));

	let dialogContent = `
	<div style="overflow: scroll;">
	<form class="flexcol">
		<div class="">
	`;
	for (const maneuver of maneuvers.values()) {
		if (maneuver.system.maneuverType !== "Stance") {
			dialogContent += `
				<div class="form-group flexrow">
					<input type="checkbox" name="${maneuver.id}" id="${maneuver.id}">
					<label for="${maneuver.id}">${maneuver.name}</label>
				</div>
			`;
		}
	}
	dialogContent += `
		</div>
	</form>
	</div>
	`;
	new Dialog({
		title: game.i18n.localize("PF1-PathOfWar.Maneuvers.GrantTitle"),
		content: dialogContent,
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: game.i18n.localize("PF1-PathOfWar.Maneuvers.Grant"),
				callback: (html) => {
					const selectedManeuvers = html.find("input[type=checkbox]:checked");
					for (const maneuver of selectedManeuvers) {
						const maneuverItem = maneuvers.get(maneuver.id);
						if (maneuverItem) {
							maneuverItem.grantSilent();
						}
					}
				}
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: game.i18n.localize("PF1-PathOfWar.Cancel"),
			}
		}
	}).render(true);
}

