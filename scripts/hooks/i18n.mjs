import { MODULE_ID } from "../_moduleId.mjs";

export function i18nHook() {
	console.log(`${MODULE_ID} | Localizing`);
	for (let r of Object.values(pf1.config.maneuverTypes)) {
		r.label = game.i18n.localize(r.label);
	}
	for (let r of Object.values(pf1.config.maneuverSaveTypes)) {
		r.label = game.i18n.localize(r.label);
	}
	for (let r of Object.values(pf1.config.maneuverSaveEffects)) {
		r.label = game.i18n.localize(r.label);
	}
	for (let key of Object.keys(pf1.config.disciplines)) {
		pf1.config.disciplines[key] = game.i18n.localize(pf1.config.disciplines[key]);
	}
	for (let key of Object.keys(pf1.config.maneuverLevels)) {
		pf1.config.maneuverLevels[key] = game.i18n.localize(pf1.config.maneuverLevels[key]);
	}
}
