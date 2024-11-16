// Executes when creating a new actor. Adds the Knowledge (Martial) and Autohypnosis skills to the actor.
Hooks.on("preCreateActor", (actor) => {
    
    // Knowledge (Martial)
    if (!["character","npc"].includes(actor.type)) return;
    actor.updateSource({
      system: { skills: { kmt: {
        name: game.i18n.localize("PF1-PathOfWar.Skills.kmt"),
        ability: "int",
        rt: true,
        rank: 0,
        acp: false,
        background: true,
      }}}
    });

    // Autohypnosis
    if (!["character","npc"].includes(actor.type)) return;
    actor.updateSource({
      system: { skills: { ahp: {
        name: game.i18n.localize("PF1-PathOfWar.Skills.ahp"),
        ability: "wis",
        rt: false,
        rank: 0,
        acp: false,
        background: true,
      }}}
    });
  });