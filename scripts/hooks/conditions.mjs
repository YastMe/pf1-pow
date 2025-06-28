import { MODULE_ID } from "../_moduleId.mjs";


export function registerConditions(registry) {
	registerClaimed(registry);
	registerCursed(registry);
	registerLocked(registry);
	registerOffBalanced(registry);
	registerTricked(registry);
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

function registerCursed(registry) {
	registry.register(MODULE_ID, "cursed", {
		name: "PF1-PathOfWar.Conditions.cursed",
		texture: "modules/pf1-pow/assets/icons/cursed.png",
	});
}

function registerTricked(registry) {
	registry.register(MODULE_ID, "tricked", {
		name: "PF1-PathOfWar.Conditions.tricked",
		texture: "modules/pf1-pow/assets/icons/tricked.png",
	});
}

function registerOffBalanced(registry) {
	registry.register(MODULE_ID, "off-balanced", {
		name: "PF1-PathOfWar.Conditions.offBalanced",
		texture: "modules/pf1-pow/assets/icons/off-balanced.png",
		mechanics: {
			changes: [{ formula: -2, target: "ac", operator: "add", type: "untyped" }],
			flags: ["loseDexToAC"]
		},
	});
}

function registerClaimed(registry) {
	registry.register(MODULE_ID, "claimed", {
		name: "PF1-PathOfWar.Conditions.claimed",
		texture: "modules/pf1-pow/assets/icons/claimed.png",
	});
}