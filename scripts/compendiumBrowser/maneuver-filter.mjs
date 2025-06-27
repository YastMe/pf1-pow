const BOOLEAN_OPERATOR = /** @type {const} */ ({
	AND: "AND",
	OR: "OR",
	NONE: false,
});


export class DisciplineFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
	static label = "PF1-PathOfWar.Disciplines.Single";
	static indexField = "system.discipline";
	static type = "pf1-pow.maneuver";

	/** @override */
	prepareChoices() {
		this.choices = this.constructor.getChoicesFromConfig(pf1.config.disciplines);
	}

	/** @override */
	applyFilter(entry) {
		const activeChoices = this.choices.filter((choice) => choice.active);
		if (activeChoices.length === 0) return true;

		const types = this.constructor.handledTypes;
		if (types.size && !types.has(entry.type)) return false;

		const data = foundry.utils.getProperty(entry, this.constructor.indexField);
		const testMethod = this.booleanOperator === BOOLEAN_OPERATOR.OR ? "some" : "every";
		if (Array.isArray(data)) {
			return activeChoices[testMethod]((choice) => data.includes(choice.key));
		} else if (typeof data === "object" && data !== null) {
			return activeChoices[testMethod]((choice) => choice.key in data && data[choice.key] !== false);
		} else {
			return activeChoices.some((choice) => {
				return data == choice.label;
			});
		}
	}
}

export class ManeuverTypeFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
	static label = "PF1-PathOfWar.Maneuvers.Type";
	static indexField = "system.maneuverType";
	static type = "pf1-pow.maneuver";

	/** @override */
	prepareChoices() {
		const choices = new foundry.utils.Collection();
		for (const [key, value] of Object.entries(pf1.config.maneuverTypes)) {
			choices.set(key, {
				key,
				label: game.i18n.localize(value.label),
			});
		}
		this.choices = choices;
	}
}

export class ManeuverLevelFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
	static label = "PF1-PathOfWar.Maneuvers.Level";
	static indexField = "system.level";
	static type = "pf1-pow.maneuver";
	static autoSort = false;

	/** @override */
	prepareChoices() {
		const choices = this.constructor.getChoicesFromConfig(pf1.config.maneuverLevels);
		for (const choice of choices) {
			choice.key = Number(choice.key);
		}
		this.choices = choices;
	}

	/** @override */
	applyFilter(entry) {
		const activeChoices = this.choices.filter((choice) => choice.active);
		if (activeChoices.length === 0) return true;

		const types = this.constructor.handledTypes;
		if (types.size && !types.has(entry.type)) return false;

		const data = foundry.utils.getProperty(entry, this.constructor.indexField);
		for (const choice of activeChoices)
			if (data === choice.key)
				return true;
		return false;
	}
}
