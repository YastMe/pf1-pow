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
 * <h3 class="form-header">${pf1.config.powClassProgressionTypes}</h3>
 * <div class="form-group initiator-type">
		<label>Type</label>
		<div class="form-fields">
		  <select name="system.maneuverProgression.type">
		  </select>
		</div>
	  </div>
 */

function injectProgressionSelector(html, app) {
	const classItem = app.object;
	let progressionTypes = pf1.config.powClassProgressionTypes;
	let maneuverTypes = pf1.config.powManeuverGrantTypes;
	// Get the previous select element with the name "system.savingThrows.will.value"
	let previousSelect = html.find("select[name='system.savingThrows.will.value']");
	let h3 = $(`<h3 class="form-header">${game.i18n.localize("PF1-PathOfWar.Maneuvers.ProgressionTypes.section")}</h3>`);
	let divClassType = $(`<div class="form-group initiator-type"></div>`);
	if (previousSelect.length === 0) {
		return;
	}
	let selectClassType = $(`<select name="system.maneuverProgression.classType"></select>`);
	for (const [key, value] of Object.entries(progressionTypes)) {
		let option = $(`<option value="${key}">${game.i18n.localize(value)}</option>`);
		if (key === classItem.system?.maneuverProgression?.classType)
			option.attr("selected", "selected");
		selectClassType.append(option);
	}
	divClassType.append($(`<label for='system.maneuverProgression.classType'>${game.i18n.localize("PF1-PathOfWar.Maneuvers.ProgressionTypes.classType")}</label>`));
	let formFieldsClass = $("<div class='form-fields'></div>");
	formFieldsClass.append(selectClassType);
	divClassType.append(formFieldsClass);
	previousSelect.parent().after(h3);
	divClassType.insertAfter(h3);
	if (classItem.system?.maneuverProgression && classItem.system?.maneuverProgression?.classType !== "none") {
		let selectManeuverTypes = $(`<select name="system.maneuverProgression.type"></select>`);
		for (const [key, value] of Object.entries(maneuverTypes)) {
			let option = $(`<option value="${key}">${game.i18n.localize(value)}</option>`);
			if (key === classItem.system?.maneuverProgression?.type)
				option.attr("selected", "selected");
			selectManeuverTypes.append(option);
		}
		let formFieldsManeuver = $("<div class='form-fields'></div>");
		let divClassTypeManeuver = $(`<div class="form-group initiator-type"></div>`);
		divClassTypeManeuver.append($(`<label for='system.maneuverProgression.type'>${game.i18n.localize("PF1-PathOfWar.Maneuvers.ProgressionTypes.type")}</label>`));
		formFieldsManeuver.append(selectManeuverTypes);
		divClassTypeManeuver.append(formFieldsManeuver);
		divClassTypeManeuver.insertAfter(divClassType);
		
		// Add initiator attribute selector for initiator classes
		let selectInitAttr = $(`<select name="system.maneuverProgression.initiatorAttr"></select>`);
		const abilities = {
			'str': 'PF1.AbilityStr',
			'dex': 'PF1.AbilityDex',
			'con': 'PF1.AbilityCon',
			'int': 'PF1.AbilityInt',
			'wis': 'PF1.AbilityWis',
			'cha': 'PF1.AbilityCha'
		};
		for (const [key, value] of Object.entries(abilities)) {
			let option = $(`<option value="${key}">${game.i18n.localize(value)}</option>`);
			if (key === classItem.system?.maneuverProgression?.initiatorAttr)
				option.attr("selected", "selected");
			selectInitAttr.append(option);
		}
		let formFieldsInitAttr = $("<div class='form-fields'></div>");
		let divInitAttr = $(`<div class="form-group initiator-attr"></div>`);
		divInitAttr.append($(`<label for='system.maneuverProgression.initiatorAttr'>${game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttr")}</label>`));
		formFieldsInitAttr.append(selectInitAttr);
		divInitAttr.append(formFieldsInitAttr);
		divInitAttr.insertAfter(divClassTypeManeuver);
	}
}

export function renderItemHook(app, html) {
	let item = app.object;

	if (item.type === "pf1-pow.maneuver") {
		handleSaveTypeVisibility(item, html);
		handleSpecialSaveHeaders(item);
		handleChargesVisibility(item);
	}
	else if (item.type === "class") {
		injectProgressionSelector(html, app);
	}
}
