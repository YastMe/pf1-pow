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
	const footer = html.find(".directory-footer");
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.category = "maneuver";
	button.classList.add("compendium", "maneuver");
	button.innerText = game.i18n.localize("PF1-PathOfWar.Browse");
	footer.append(button);
	button.addEventListener("click", maneuverBrowser);
	if (footer.children.length % 2 == 0)
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
 * @credit claudekennilol
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData} rollData
 */
export function onGetRollData(doc, rollData) {
	try {
		if (doc instanceof pf1.documents.actor.ActorPF) {
			const actor = doc;

			// Settings //
			const attr = actor.getFlag(MODULE_ID, 'maneuverAttr') || '';
			rollData.maneuverAttr = actor.system.abilities[attr]?.mod ?? 0;
			const duoPartner = actor.getFlag(MODULE_ID, 'duoPartner') || '';
			if (duoPartner === '')
				rollData.duoPartner = null;

			else
				rollData.duoPartner = game.actors.get(foundry.utils.parseUuid(duoPartner).id) || null;
			const sparker = actor.getFlag(MODULE_ID, 'sparker') || false;
			const martiallyTrained = actor.getFlag(MODULE_ID, 'martialTrainingLevel');

			// Initiator Level //
			let initLevel = 0;
			let classes = Array.from(actor.items).filter(item => item.type === "class");
			let notInitClasses = classes.filter(c => c.system.maneuverProgression?.classType === "none" || c.system.maneuverProgression?.classType === "" || !c.system.maneuverProgression?.classType);
			let initClasses = classes.filter(c => !notInitClasses.includes(c));
			let maneuversGranted = false;
			for (const c of initClasses) {
				if (c.system?.maneuverProgression?.type === "granted") {
					maneuversGranted = true;
					break;
				}
			}
			rollData.maneuversGranted = maneuversGranted;
			if (initClasses.length > 0 && !sparker) {
				for (const c of initClasses) {
					initLevel += c.system.level || 0;
				}
				for (const c of notInitClasses) {
					initLevel += c.system.level / 2 || 0;
				}
				initLevel = Math.floor(initLevel);
			}
			else if (sparker) {
				initLevel = actor.system.attributes.bab.total;
			}
			else if (martiallyTrained) {
				initLevel = Math.floor(actor.system.attributes.hd.total / 2) + actor.system.abilities[attr]?.mod;
			}

			else
				initLevel = 0;
			if (initLevel > actor.system.attributes.hd.total)
				initLevel = actor.system.attributes.hd.total;
			rollData.initLevel = initLevel;

			rollData.maxManeuverLevel = martiallyTrained ? Math.min(Math.min(9, Math.ceil(initLevel / 2)), 6) : Math.min(9, Math.ceil(initLevel / 2));

			let maneuversPrepared = 0;
			let maneuversKnown = 0;
			let maxManeuversPrepared = 0;
			let maxManeuversKnown = 0;
			actor.items.forEach(item => {
				if (item.type === "pf1-pow.maneuver") {
					if (item.system.ready && item.system.maneuverType !== "Stance")
						maneuversPrepared += 1;
					maneuversKnown += 1;
				}
			});
			if (sparker) {
				maxManeuversPrepared = Math.floor(initLevel / 2) + 2;
				maxManeuversKnown = initLevel + rollData.maneuverAttr;
				maneuversPrepared = maneuversPrepared;
			}
			if (martiallyTrained) {
				maxManeuversPrepared = martiallyTrained;
				switch (martiallyTrained) {
					case 1:
						maxManeuversKnown = 2;
						break;
					case 2:
						maxManeuversKnown = 5;
						break;
					case 3:
						maxManeuversKnown = 7;
						break;
					case 4:
						maxManeuversKnown = 9;
						break;
					case 5:
						maxManeuversKnown = 11;
						break;
					case 6:
						maxManeuversKnown = 13;
						break;
					default:
						maxManeuversKnown = 0;
				}
				rollData.maxManeuverLevel = martiallyTrained;
				maneuversPrepared = maneuversPrepared;
			}

			let maneuversOverMaxLevel = 0;
			actor.items.forEach(item => {
				if (item.type === "pf1-pow.maneuver" && item.system.level > rollData.maxManeuverLevel) {
					maneuversOverMaxLevel += 1;
				}
			});
			rollData.maneuversOverMaxLevel = maneuversOverMaxLevel;
			if (actor.getFlag(MODULE_ID, 'combatTrainingTrait')) {
				maxManeuversKnown += 1;
				maxManeuversPrepared += 1;
			}
			rollData.maneuversPrepared = maneuversPrepared;
			rollData.maxManeuversPrepared = maxManeuversPrepared;
			rollData.maneuversKnown = maneuversKnown;
			rollData.maxManeuversKnown = maxManeuversKnown;
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

