import { TEMPLATES } from "../path-of-war.mjs";

import { MARTIAL_TRAINING_IDS } from "../constants.js";

export function setupHook() {
	loadTemplates(TEMPLATES);
	Handlebars.registerHelper('levelsArray', function (options) {
		return [1, 2, 3, 4, 5, 6, 7, 8, 9];
	});
	Handlebars.registerHelper('filteredLevelsArray', function (maxLevel) {
		const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		return levels.filter(lvl => lvl <= maxLevel);
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
	Handlebars.registerHelper('getClassMaxManeuverLevel', function (classInitiatorLevels, classId, defaultMax) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maxManeuverLevel;
		}
		return defaultMax;
	});
	Handlebars.registerHelper('getClassInitLevel', function (classInitiatorLevels, classId, defaultInit) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].initLevel;
		}
		return defaultInit;
	});
	Handlebars.registerHelper('getClassManeuversPrepared', function (classInitiatorLevels, classId, defaultValue) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maneuversPrepared || 0;
		}
		return defaultValue || 0;
	});
	Handlebars.registerHelper('getClassManeuversKnown', function (classInitiatorLevels, classId, defaultValue) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maneuversKnown || 0;
		}
		return defaultValue || 0;
	});
	Handlebars.registerHelper('getClassMaxManeuversPrepared', function (classInitiatorLevels, classId, defaultValue) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maxManeuversPrepared || 0;
		}
		return defaultValue || 0;
	});
	Handlebars.registerHelper('getClassMaxManeuversKnown', function (classInitiatorLevels, classId, defaultValue) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maxManeuversKnown || 0;
		}
		return defaultValue || 0;
	});
	Handlebars.registerHelper('getClassManeuverAttr', function (classInitiatorLevels, classId, defaultValue) {
		if (classInitiatorLevels && classInitiatorLevels[classId]) {
			return classInitiatorLevels[classId].maneuverAttr || 0;
		}
		return defaultValue || 0;
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
	Handlebars.registerHelper('hasOverMaxManeuvers', function (maneuvers, className, maxLevel) {
		if (Map.prototype.isPrototypeOf(maneuvers)) {
			maneuvers = Array.from(maneuvers.values());
		}
		return maneuvers.some(m => 
			m.type === 'pf1-pow.maneuver' && 
			m.system.class === className && 
			m.system.level > maxLevel
		);
	});
	Handlebars.registerHelper('cleanDice', function (haystack) {
		return haystack.replaceAll('[', '').replaceAll(']', '');
	});
	Handlebars.registerHelper('getParentClasses', function (item) {
		const actor = item.parent;
		if (!actor) return [];
		const classes = actor.items.filter(i => i.type === "class");
		return classes;
	});
	Handlebars.registerHelper('getClasses', function (item) {
		const actor = item.actor;
		if (!actor) return [];
		const classes = actor.items.filter(i => i.type === "class" && (i.system?.maneuverProgression?.classType === "class" || i.system?.maneuverProgression?.classType === "archetype"));
		const martialTrainingFeats = actor.items.filter((item) => MARTIAL_TRAINING_IDS.includes(item._source._stats.compendiumSource))
		const classNames = classes.map(c => ({name: c.name, nameId: c.name.replace(/\s+/g, '-').toLowerCase().replace(" ", "-"), id: c.id }));
		if (martialTrainingFeats.length > 0) {
			classNames.push({name: "Martial Training", nameId: "martial-training", id: "martialTraining"});
		}
		return classNames;
	});
	Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
		return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
	});
}
