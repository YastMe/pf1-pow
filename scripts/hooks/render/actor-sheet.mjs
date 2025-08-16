import { MODULE_ID } from "../../_moduleId.mjs";
import { maneuverBrowser } from "../../compendiumBrowser/maneuver-browser.mjs";
import { ManeuverItem } from "../../documents/_module.mjs";
import { createTemplate } from "../../documents/actor/actor-sheet.mjs";
import { grantDialogue } from "../../utils.mjs";

const MARTIAL_TRAINING_IDS = [
	"Compendium.pf1-pow.feats.Item.0F1Y26AhFPtjmtRs",
	"Compendium.pf1-pow.feats.Item.GH0DPCS1opKc8Cwq",
	"Compendium.pf1-pow.feats.Item.Sp3szYhmXlojaRMh",
	"Compendium.pf1-pow.feats.Item.UhbWUsItUjaoWDWW",
	"Compendium.pf1-pow.feats.Item.csVlOkXed702Do0C",
	"Compendium.pf1-pow.feats.Item.39qFM9kVc5B7qhrE"
]

const COMBAT_TRAINING_TRAIT = "Compendium.pf1-pow.traits.Item.jTkem5O4Xu0MdirH"

export function renderActorHook(data, app, html) {
	const actor = data.actor;
	if (actor.flags?.core?.sheetClass !== "pf1alt.AltActorSheetPFCharacter") {
		updateMartialTrainingLevel(actor);

		injectPoWDiv(app, html);
		injectInitiatingModifierSelector(app, html, actor);
		injectDuoPartnerSelector(app, html, actor);
		injectSparkingCheckbox(app, html, actor);
		if (actor.flags[MODULE_ID]?.sparker) {
			injectStaminaPoolSelector(app, html, actor);
			injectBypassFatigueCheckbox(app, html, actor);
			if (actor.flags[MODULE_ID]?.bypassFatigue) {
				injectSecondaryStaminaPoolSelector(app, html, actor);
			}
		}
		injectStanceLimitCheckbox(app, html, actor);
		injectIgnoreNonInitiatorClassesCheckbox(app, html, actor);
		injectPathofWarTab(app, html, actor);
		injectManeuverBrowserButton(app, html);
		addControlHandlers(app, html, data);
		if (app._forceShowManeuverTab) {
			app.activateTab("pf1-pow", "primary");
			setTimeout(() => delete app?._forceShowManeuverTab, 200);
		}
	}
}

/**
 * Injects a custom "Browse" button for maneuvers into the Combat tab of the Actor sheet.
 * The button is styled and configured to trigger the `maneuverBrowser` function when clicked.
 */
function injectManeuverBrowserButton(app, html) {
	let controls = html.find(".maneuver-controls");
	for (const control of controls) {
		const searchManeuvers = document.createElement("a");
		searchManeuvers.classList.add("item-control", "item-search");
		searchManeuvers.innerHTML = '<i class="fas fa-folder-plus"></i> ';
		searchManeuvers.addEventListener("click", maneuverBrowser);
		control.append(searchManeuvers);
	}
}

function injectPoWDiv(app, html) {
	const controls = html.find(".settings")[0];
	const div = document.createElement("div");
	div.classList.add("pf1-pow-div");
	const h2 = document.createElement("h2");
	h2.innerText = game.i18n.localize("PF1-PathOfWar.TabName");
	div.append(h2);
	if (controls.children.length > 1) {
		controls.insertBefore(div, controls.children[controls.children.length - 1]);
	} else {
		controls.append(div);
	}
	const formGroup = document.createElement("div");
	formGroup.classList.add("form-group", "stacked");
	div.append(formGroup);
}

function injectInitiatingModifierSelector(app, html, actor) {
	const div = document.createElement("div");
	div.classList.add("form-group", "col-6", "flexrow", "maneuverAttrSelector");
	let controls = html.find(".pf1-pow-div")[0];
	const select = document.createElement("select");
	select.name = `flags.${MODULE_ID}.maneuverAttr`;
	const label = document.createElement("label");
	label.innerText = game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttr");
	label.setAttribute("for", select.name);
	label.setAttribute("data-tooltip", game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttrTooltip"));
	const options = [];
	Object.entries(pf1.config.abilities).forEach(([key, value]) => {
		options.push({ value: key, label: value });
	});
	if (!actor.flags[MODULE_ID] || !actor.flags[MODULE_ID].maneuverAttr)
		actor.setFlag(MODULE_ID, "maneuverAttr", "wis");
	let hasContent = false;
	for (const prop in actor.flags) {
		if (Object.hasOwn(actor.flags, prop))
			hasContent = true;
	}
	for (let option of options) {
		const opt = document.createElement("option");
		opt.value = option.value;
		opt.innerText = option.label;
		if (hasContent && option.value === actor.flags[MODULE_ID].maneuverAttr) {
			opt.selected = true;
		}
		select.append(opt);
	}
	select.setAttribute("data-tooltip", game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttrTooltip"));
	div.append(label);
	div.append(select);
	if (controls.children.length > 1) {
		controls.insertBefore(div, controls.children[controls.children.length - 1]);
	}
	else {
		controls.append(div);
	}
}

function injectDuoPartnerSelector(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div")[0];
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
	let hasContent = false;
	for (const prop in currentActor.flags) {
		if (Object.hasOwn(currentActor.flags, prop))
			hasContent = true;
	}
	for (let [key, value] of Object.entries(actorChoices)) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.innerText = value;
		if (hasContent && key === currentActor.flags[MODULE_ID].duoPartner) {
			opt.selected = true;
		}
		select.append(opt);
	}
	label.classList.add("col-span-2");
	const div = document.createElement("div");
	div.classList.add("form-group", "col-6", "flexrow", "duoPartnerSelector");
	div.append(label);
	div.append(select);
	if (controls.children.length > 1) {
		controls.insertBefore(div, controls.children[controls.children.length - 1]);
	} else {
		controls.append(div);
	}
}

function injectStaminaPoolSelector(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div")[0];
	const select = document.createElement("select");
	select.name = `flags.${MODULE_ID}.staminaPool`;
	const label = document.createElement("label");
	label.innerText = game.i18n.localize("PF1-PathOfWar.Stamina.Pool");
	label.setAttribute("for", select.name);
	const staminaChoices = { '': '' };
	currentActor.items.forEach(item => {
		if (item?.system?.uses?.max && item.type == "feat") {
			staminaChoices[item.id] = `${item.name}`;
		}
	});
	const sortedStaminaChoices = Object.fromEntries(
		Object.entries(staminaChoices)
			.sort(([, a], [, b]) => a.localeCompare(b))
	);
	for (let [key, value] of Object.entries(sortedStaminaChoices)) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.innerText = value;
		if (currentActor.flags[MODULE_ID] && currentActor.flags[MODULE_ID].staminaPool === key) {
			opt.selected = true;
		}
		select.append(opt);
	}
	label.classList.add("col-span-2");
	const div = document.createElement("div");
	div.classList.add("form-group", "col-6", "flexrow", "staminaPoolSelector");
	div.append(label);
	div.append(select);
	if (controls.children.length > 1) {
		controls.insertBefore(div, controls.children[controls.children.length - 1]);
	} else {
		controls.append(div);
	}
}

function injectSecondaryStaminaPoolSelector(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div")[0];
	const select = document.createElement("select");
	select.name = `flags.${MODULE_ID}.secondaryStaminaPool`;
	const label = document.createElement("label");
	label.innerText = game.i18n.localize("PF1-PathOfWar.Stamina.SecondaryPool");
	label.setAttribute("for", select.name);
	const staminaChoices = { '': '' };
	currentActor.items.forEach(item => {
		if (item?.system?.uses?.max && item.type == "feat" && item.id !== currentActor.flags[MODULE_ID]?.staminaPool) {
			staminaChoices[item.id] = `${item.name}`;
		}
	});
	const sortedStaminaChoices = Object.fromEntries(
		Object.entries(staminaChoices)
			.sort(([, a], [, b]) => a.localeCompare(b))
	);
	for (let [key, value] of Object.entries(sortedStaminaChoices)) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.innerText = value;
		if (currentActor.flags[MODULE_ID] && currentActor.flags[MODULE_ID].secondaryStaminaPool === key) {
			opt.selected = true;
		}
		select.append(opt);
	}
	label.classList.add("col-span-2");
	const div = document.createElement("div");
	div.classList.add("form-group", "col-6", "flexrow", "secondaryStaminaPoolSelector");
	div.append(label);
	div.append(select);
	if (controls.children.length > 1) {
		controls.insertBefore(div, controls.children[controls.children.length - 1]);
	} else {
		controls.append(div);
	}
}

function injectSparkingCheckbox(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div .stacked")[0];
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = `flags.${MODULE_ID}.sparker`;
	checkbox.id = checkbox.name;
	const label = document.createElement("label");
	label.append(checkbox);
	label.append(game.i18n.localize("PF1-PathOfWar.Sparker"));
	label.classList.add("checkbox");
	if (!currentActor.flags[MODULE_ID] || !currentActor.flags[MODULE_ID].sparker)
		currentActor.setFlag(MODULE_ID, "sparker", false);
	if (currentActor.flags[MODULE_ID].sparker) {
		checkbox.checked = true;
	}
	controls.append(label);
}

function injectStanceLimitCheckbox(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div .stacked")[0];
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = `flags.${MODULE_ID}.stanceLimit`;
	checkbox.id = checkbox.name;
	const label = document.createElement("label");
	label.append(checkbox);
	label.append(game.i18n.localize("PF1-PathOfWar.Stances.StanceLimit"));
	label.classList.add("checkbox");
	if (!currentActor.flags[MODULE_ID] || !currentActor.flags[MODULE_ID].stanceLimit)
		currentActor.setFlag(MODULE_ID, "stanceLimit", false);
	if (currentActor.flags[MODULE_ID].stanceLimit) {
		checkbox.checked = true;
	}
	controls.append(label);
}

function injectIgnoreNonInitiatorClassesCheckbox(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div .stacked")[0];
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = `flags.${MODULE_ID}.ignoreNonInitiatorClasses`;
	checkbox.id = checkbox.name;
	const label = document.createElement("label");
	label.append(checkbox);
	label.append(game.i18n.localize("PF1-PathOfWar.IgnoreNonInitiatorClasses"));
	label.classList.add("checkbox");
	if (!currentActor.flags[MODULE_ID] || !currentActor.flags[MODULE_ID].ignoreNonInitiatorClasses)
		currentActor.setFlag(MODULE_ID, "ignoreNonInitiatorClasses", false);
	if (currentActor.flags[MODULE_ID].ignoreNonInitiatorClasses)
		checkbox.checked = true;
	controls.append(label);
}

function injectBypassFatigueCheckbox(app, html, currentActor) {
	let controls = html.find(".pf1-pow-div .stacked")[0];
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = `flags.${MODULE_ID}.bypassFatigue`;
	checkbox.id = checkbox.name;
	const label = document.createElement("label");
	label.append(checkbox);
	label.append(game.i18n.localize("PF1-PathOfWar.Stamina.BypassFatigue"));
	label.classList.add("checkbox");
	if (!currentActor.flags[MODULE_ID] || !currentActor.flags[MODULE_ID].bypassFatigue)
		currentActor.setFlag(MODULE_ID, "bypassFatigue", false);
	if (currentActor.flags[MODULE_ID].bypassFatigue) {
		checkbox.checked = true;
	}
	controls.append(label);
}

function injectPathofWarTab(app, html, currentActor) {
	const { actor } = app;

	if (actor._rollData?.initLevel > 0 || actor.flags[MODULE_ID]?.sparker) {
		const tabSelector = html.find("a[data-tab=skills]");
		const artsTab = document.createElement("a");
		artsTab.classList.add("item");
		artsTab.dataset["tab"] = "pf1-pow";
		artsTab.dataset["group"] = "primary";
		artsTab.innerHTML = game.i18n.localize("PF1-PathOfWar.TabName");
		tabSelector.after(artsTab);

		const powBody = createTemplate(
			'pf1-pow',
			{
				actor: actor,
			}
		);
		const bodySelector = html.find("div.tab[data-tab=skills]");
		bodySelector.after(powBody);
	}
}

function addControlHandlers(app, html) {
	const { actor } = app;
	const items = html.find(".maneuver-control");

	const forceTab = () => app._forceShowManeuverTab = true;
	const createNewManeuver = () => {
		const baseName = game.i18n.localize("PF1-PathOfWar.Maneuvers.NewManeuver");
		const n = actor.items.filter(i => i.type === "pf1-pow.maneuver" && i.name.startsWith(baseName)).length;
		const name = n ? `${baseName} (${n})` : baseName;

		actor.createEmbeddedDocuments("Item", [new Item({
			name,
			type: "pf1-pow.maneuver",
			system: {
				maneuverType: "Untyped",
				saveType: "None",
				saveEffect: "Text",
				description: { value: "" },
			}
		})]);
		forceTab();
	};

	items.each((_, el) => {
		const item = el;
		const maneuver = actor.items.get(item.id);
		const action = item.name;

		item.addEventListener("click", () => {
			const actionMap = {
				delete: () => (maneuver.delete(), forceTab()),
				edit: () => maneuver.sheet.render(true),
				display: () => ManeuverItem.buildChatMessageFromManeuver(maneuver),
				create: createNewManeuver,
				recover: () => (maneuver.recoverManeuver(), forceTab()),
				use: () => (maneuver.useManeuver(), forceTab()),
				prepare: () => (maneuver.prepareManeuver(), forceTab()),
				activate: () => (maneuver.toggleStances(), forceTab()),
				grant: () => (maneuver.toggleGrant(), forceTab()),
				showConfig: () => {
					const configDiv = html.find(".maneuver-control-buttons")[0];
					configDiv.style.maxHeight = (configDiv.style.maxHeight && configDiv.style.maxHeight !== "0px")
						? "0"
						: `${configDiv.scrollHeight}px`;
					configDiv.classList.toggle("accordion", "open");
					forceTab();
				},
				maneuverName: () => {
					const descriptionDiv = $(`#maneuver-summary-${maneuver.id}`)[0];
					descriptionDiv.style.maxHeight = (descriptionDiv.style.maxHeight && descriptionDiv.style.maxHeight !== "0px")
						? "0px"
						: `${descriptionDiv.scrollHeight}px`;
					const isOpen = descriptionDiv.classList.contains("open");
					if (isOpen) {
						setTimeout(() => {
							descriptionDiv.classList.toggle("open");
						}, 300);
					} else {
						descriptionDiv.classList.toggle("open");
					}
					forceTab();
				}
			};
			actionMap[action]?.();
		});

		item.parentElement.parentElement.addEventListener("mousedown", (event) => {
			if (event.button === 2) {
				event.preventDefault();
				maneuver.sheet.render(true);
			}
		});
	});

	html.find(".override-button").each((_, button) => {
		button.addEventListener("click", (event) => {
			event.preventDefault();
			const action = button.name;
			const maneuvers = actor.items.filter(i => i.type === "pf1-pow.maneuver");

			const actions = {
				grantDialogue: () => (forceTab(), grantDialogue(app)),
				grantAll: () => (maneuvers.filter(m => m.system.maneuverType !== "Stance").forEach(m => m.grantSilent()), forceTab()),
				recoverAll: () => (maneuvers.filter(m => m.system.maneuverType !== "Stance").forEach(m => m.recoverManeuverSilent()), forceTab()),
				toggleAllGranted: () => {
					maneuvers.forEach(m => m.update({ "system.granted": !m.system.granted }));
					forceTab();
				}
			};
			actions[action]?.();
		});
	});
}


async function updateMartialTrainingLevel(actor) {
	const martialTrainingFeats = actor.items.filter((item) => MARTIAL_TRAINING_IDS.includes(item._source._stats.compendiumSource))
	let index = 0;
	const combatTrainingTrait = actor.items.find(i => i._source._stats.compendiumSource === COMBAT_TRAINING_TRAIT);
	if (combatTrainingTrait)
		actor.setFlag(MODULE_ID, "combatTrainingTrait", true);
	else
		actor.setFlag(MODULE_ID, "combatTrainingTrait", false);
	if (martialTrainingFeats.length > 0) {
		for (let feat of martialTrainingFeats)
			if (MARTIAL_TRAINING_IDS.indexOf(feat._source._stats.compendiumSource) > index)
				index = MARTIAL_TRAINING_IDS.indexOf(feat._source._stats.compendiumSource);
		actor.setFlag(MODULE_ID, "martialTrainingLevel", index + 1);
	}
	else
		actor.setFlag(MODULE_ID, "martialTrainingLevel", 0);
}
