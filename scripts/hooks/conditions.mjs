import { MODULE_ID } from "../_moduleId.mjs";


export function registerConditions(registry) {
	registerLocked(registry);
}
function registerLocked(registry) {
	registry.register(MODULE_ID, "locked", {
		name: "PF1-PathOfWar.Conditions.locked",
		texture: "modules/pf1-pow/assets/icons/locked.png",
		mechanics: {
			changes: [{ formula: 0, target: "allSpeeds", operator: "set", type: "untyped" }],
		},
	});
}

