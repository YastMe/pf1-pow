import { TEMPLATES } from "../path-of-war.mjs";

export function setupHook() {
	loadTemplates(TEMPLATES);
	Handlebars.registerHelper('levelsArray', function (options) {
		return [1, 2, 3, 4, 5, 6, 7, 8, 9];
	});
	Handlebars.registerHelper('concat', function (...args) {
		args.pop(); // Remove options object
		return args.join('');
	});
	Handlebars.registerHelper('capitalize', function (str) {
		if (typeof str !== 'string') return str;
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	Handlebars.registerHelper('ge', function (a, b) {
		return a >= b;
	});
	Handlebars.registerHelper('gt', function (a, b) {
		return a > b;
	});
	Handlebars.registerHelper('sum', function (...args) {
		args.pop(); // Remove options object
		return args.reduce((acc, val) => {
			if (typeof val === 'number') {
				return acc + val;
			}
			return acc;
		}, 0);
	});
	Handlebars.registerHelper('get', function (obj, key, value) {
		if (value === "name")
			return obj.get(key)?.name;
		return obj.get(key)?.system?.uses[value] || 0;
	});
	Handlebars.registerHelper('sortManeuvers', function (maneuvers) {
		if (Map.prototype.isPrototypeOf(maneuvers)) {
			maneuvers = Array.from(maneuvers.values());
		}
		maneuvers = maneuvers.filter(m => m.type === 'pf1-pow.maneuver');
		maneuvers.sort((a, b) => {
			const disciplineA = (a.system.discipline || '').trim().toLowerCase();
			const disciplineB = (b.system.discipline || '').trim().toLowerCase();
			const levelA = a.system.level || 0;
			const levelB = b.system.level || 0;

			const disciplineComparison = disciplineA.localeCompare(disciplineB);
			if (disciplineComparison !== 0) return disciplineComparison;

			return levelA - levelB;
		});
		return maneuvers;
	});
	Handlebars.registerHelper('cleanDice', function (haystack) {
		return haystack.replaceAll('[', '').replaceAll(']', '');
	});
}
