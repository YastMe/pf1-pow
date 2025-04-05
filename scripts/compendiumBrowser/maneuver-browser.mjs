const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class ManeuverFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
	static label = "PF1-PathOfWar.Maneuvers.Plural";
	static type = "pf1-pow.maneuver"
}

export class ManeuverBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
	static documentName = "Item";
	static typeName = "PF1-PathOfWar.Maneuvers.Plural";
	static filterClasses = [commonFilters.TagFilter, ManeuverFilter];
}

export function maneuverBrowser(event) {
	event.preventDefault();
	let type = event.target.dataset.category;
	if (type === undefined)
		type = "maneuver";
	pf1.applications.compendiums[type].render(true, { focus: true });
}