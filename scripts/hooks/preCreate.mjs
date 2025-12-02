export function setManeuverClassOnDrop(document) {
	let activePoWSubtab = null;

	if (document.parent?.sheet && document.type === "pf1-pow.maneuver") {
		const sheet = document.parent.sheet;

		if (sheet._lastManeuverSubtabName) {
			activePoWSubtab = sheet._lastManeuverSubtabName;

			// Only update the class if it's empty (e.g., from compendium drop)
			// Local creation via createNewManeuver already sets the class
			if (activePoWSubtab && (!document.system?.class || document.system.class !== activePoWSubtab)) {
				document.updateSource({ 'system.class': activePoWSubtab });
			}
		}
	}
}