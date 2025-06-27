import { grantDialogue } from "../utils.mjs";

export function startCombatHook() {
	const actors = game.actors.filter(actor => actor._rollData?.initLevel > 0 && actor.type === "character");
	for (const actor of actors) {
		const maneuvers = actor.items.filter(item => item.type === "pf1-pow.maneuver" && item.system.ready);
		for (const maneuver of maneuvers) {
			if (maneuver.system.ready)
				maneuver.recoverManeuverSilent();
			if (actor._rollData?.maneuversGranted)
				maneuver.ungrantSilent();
		}
	}
}

export function turnHook(combat, prior, current) {
	if (game.user.isGM) return;
	const currentCombatant = game.actors.get(combat.combatants.get(current.combatantId).actorId);
	const priorCombatant = game.actors.get(combat.combatants.get(prior.combatantId).actorId);
	if (currentCombatant.isOwner && currentCombatant?._rollData?.maneuversGranted && combat.round === 1) {
		grantDialogue(currentCombatant);
	}
	if (priorCombatant.isOwner && priorCombatant?._rollData?.maneuversGranted) {
		const maneuvers = priorCombatant.items.filter(item => item.type === "pf1-pow.maneuver" && item.system.ready && !item.system.granted);
		if (maneuvers.length === 0)
			grantDialogue(priorCombatant);
		else {
			const randomManeuver = maneuvers[Math.floor(Math.random() * maneuvers.length)];
			randomManeuver.grant();
		}
	}
	let actors = [];
	for (const combatant of combat.combatants.contents) {
		actors.push(game.actors.get(combatant.actorId));
	}
	for (const combatant of actors) {
		if (combatant.isOwner && combatant._sheet?._tabs[0].active === "pf1-pow")
			combatant.sheet._forceShowManeuverTab = true;
	}
}
