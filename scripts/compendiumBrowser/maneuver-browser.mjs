import { DisciplineFilter, ManeuverLevelFilter, ManeuverTypeFilter } from "./maneuver-filter.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class ManeuverFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
	static label = "PF1-PathOfWar.Maneuvers.Plural";
	static type = "pf1-pow.maneuver"
}

export class ManeuverBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
	static documentName = "Item";
	static typeName = "PF1-PathOfWar.Maneuvers.Plural";
	static filterClasses = [commonFilters.TagFilter, ManeuverFilter, DisciplineFilter, ManeuverTypeFilter, ManeuverLevelFilter];

	#setup = false;
	#filterQueue;

	/** @override */
	async setup() {
		await super.setup();
		this.#setup = true;
	}

	/**@override */
	/**
	 * Near copy of the parent method, adjusting the idToFilter mapping
	 */
	_activateFilterQueue() {
		if (!this.#setup) return;

		if (!this.#filterQueue) return;

		// Disable existing filters
		for (const filter of this.filters) {
			if (!filter.choices) continue;
			for (const choice of filter.choices) choice.active = false;
		}

		const idToFilter = {
			ManeuverTypeFilter: "ItemTypeFilter",
			level: "ManeuverLevelFilter",
			discipline: "DisciplineFilter",
		};

		for (const [filterId, choices] of Object.entries(this.#filterQueue)) {
			const filterName = idToFilter[filterId];
			const filter = this.filters.find((f) => f.constructor.name === filterName);
			if (!filter) {
				console.warn(`Filter "${filterId}" not found.`);
				continue;
			}

			for (const [key, choice] of filter.choices.entries()) {
				choice.active = choices.includes(key) || choices.includes(choice.label);
				if (choice.active) this.expandedFilters.add(filter.id);
			}
		}

		this.#filterQueue = null;

	}

	/**
	 * Queue filters to be processed by {@link _activateFilterQueue}
	 *
	 * Only one filter bundle is ever queued.
	 *
	 * @internal
	 * @param {object} filters
	 * @experimental
	 */
	_queueFilters(filters) {
		this.#filterQueue = filters;
	}

}

export function maneuverBrowser(event) {
	event.preventDefault();

	const browser = pf1.applications.compendiums.maneuver;
	
	// If the click was on an icon, get the parent button element
	const button = event.target.closest(".item-search");
	if (!button) {
		console.error("Click event not on maneuver browser button");
		browser.render(true, { focus: true });
		return;
	}
	
	let type = button.dataset.category;
	let level = button.dataset.level;
	let actor = game.actors.get(button.dataset.actorId);
	const actorDisciplines = actor?.items.filter((i) => i.system.subType === "martialDiscipline").map((i) => i.name) ?? [];
	const filters = {}

	if (level) filters.level = [level];
	if (actorDisciplines.length) filters.discipline = actorDisciplines;

	if (!browser) {
		console.error("ManeuverBrowser not initialized");
		return;
	}
	browser._queueFilters(filters);
	
	if (type === undefined)
		type = "maneuver";
	browser.render(true, { focus: true });
}