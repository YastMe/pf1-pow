import { MODULE_ID } from "./_moduleId.mjs";                // Module ID
import { ManeuverModel } from "./dataModels/_module.mjs";   // Data model
import { ManeuverSheet } from "./applications/_module.mjs"; // Item sheet
import { ManeuverItem } from "./documents/_module.mjs";     // Item document
import "./applications/actor/actor-skills.mjs";             // Add Skills

// Execute when the module is initialized.
Hooks.once("init", () => {
    // Register new config and items.
    registerConfig();
    registerItems();
    // Log that the module has been initialized.
    console.log(`${MODULE_ID} | Initialized`);
})

// Localize new config
Hooks.once("i18nInit", () => {
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
})

// Execute when all data is loaded.
Hooks.once("ready", () => {
    console.log(`${MODULE_ID} | Ready`);
    // Only check for old actors if the current user is the GM.
    if (game.users.activeGM !== game.user) return;
    console.log(`${MODULE_ID} | Migrating old actors`);
    game.actors.contents.forEach(actor => {
        // Check if actor has system data. If not, skip.
        if (actor.type !== "character" && actor.type !== "npc") return;
        if (!actor.system.skills) return;
        let skills = actor.system.skills;
        // Check if actor has Knowledge (Martial). If not, add it.
        if (actor.system.skills.kmt == undefined) {
            actor.update({ 
                system: {
                    skills: {
                        kmt: {
                            name: game.i18n.localize("PF1-PathOfWar.Skills.kmt"),
                            ability: "int",
                            rank: 0,
                            rt: true,
                            acp: false,
                            background: true,
                        }
                    }
                }
            });
            console.log(`${MODULE_ID} | Added Knowledge (Martial) to ${actor.name}`);
        }
        // Check if actor has Autohypnosis. If not, add it.
        if (actor.system.skills.ahp == undefined) {
            actor.update({ 
                system: {
                    skills: {
                        ahp: {
                            name: game.i18n.localize("PF1-PathOfWar.Skills.ahp"),
                            ability: "wis",
                            rank: 0,
                            rt: true,
                            acp: false,
                            background: true,
                        }
                    }
                }
            });
            console.log(`${MODULE_ID} | Added Autohypnosis to ${actor.name}`);
        }
    });
    if (!game.users.current.flags.pf1pow) {
        new Dialog({
            title: 'Path of War for Pathfinder 1e',
            content: `
            <p>Hello! Thank you for installing Path of War for Pathfinder 1e.</p>
            <p>This module includes the necessary Item and Feat types for you to create your own Martial Disciplines and Maneuvers, alongside an empty Martial Discipline to help guide in the creation of new ones.</p>
            <p>It also includes four different Macros to make your usage of the system a bit easier. While not all of them are necessary for play, they offer Quality of Life improvements that players and GM alike will enjoy!</p>
            <p>To start using the system, the macro "Set Initiation Modifier" should be called whenever a new character sheet is added. This will help you set up the relevant stats depending on the character's class.</p>
            <p>For players, it is configured to target your assigned character. For GMs, a token will need to be selected for the macro to work on the desired character.</p>
            <p>The rest of the Macros are quite self-explanatory, you can find all of the content in the relevant Compendiums</p>
            <br>
            `,
            buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: `Close, don't show again`,
            default: 'yes'
        }
        }
        }).render(true);
        game.users.current.update({ "flags.pf1pow": true });
    }
})

// Execute when an Item sheet is rendered.
Hooks.on("renderItemSheet", (app, html, data) => {
    let item = app.object;
    // Check if the item is a maneuver. If so, hide the save information if the save type is None or Special, show it otherwise.
    if (item.type === "pf1-pow.maneuver") {
        let headers = document.getElementsByClassName("saveHeader");
        if (item.system.saveType == "None" || item.system.saveType == "Special") {
            html.find("select[name='system.saveEffect']").hide();
            for (let header of headers) {
                header.style.display = "none";
            }
        }
        else {
            html.find("select[name='system.saveEffect']").show();
            for (let header of headers) {
                header.style.display = "block";
            }
        }
        if (item.system.saveType == "Special") {
            headers = document.getElementsByClassName("saveHeaderSpecial");
            for (let header of headers) {
                header.style.display = "block";
            }
        }
        else {
            headers = document.getElementsByClassName("saveHeaderSpecial");
            for (let header of headers) {
                header.style.display = "none";
            }
        }
        // Check if the item is a stance. If so, hide the charges information.
        if (item.system.maneuverType == "Stance") {
            headers = document.getElementsByClassName("chargesHeader");
            for (let header of headers) {
                header.style.display = "none";
            }
        }
        else {
            headers = document.getElementsByClassName("chargesHeader");
            for (let header of headers) {
                header.style.display = "block";
            }
        }
    }
})

function registerConfig() {
    // Add Knowledge (Martial) skill
    pf1.config.skills["kmt"] = "PF1-PathOfWar.Skills.kmt";

    // Add Autohypnosis skill
    pf1.config.skills["ahp"] = "PF1-PathOfWar.Skills.ahp";

    // Add maneuver types to config
    pf1.config.maneuverTypes = {
        Strike: {
            label: "PF1-PathOfWar.Maneuvers.Types.strike",
        },
        Boost: {
            label: "PF1-PathOfWar.Maneuvers.Types.boost",
        },
        Counter: {
            label: "PF1-PathOfWar.Maneuvers.Types.counter",
        },
        Stance: {
            label: "PF1-PathOfWar.Maneuvers.Types.stance",
        },
        Text: {
            label: "PF1-PathOfWar.Maneuvers.Types.text",
        },
    };

    // Add save types to config
    pf1.config.maneuverSaveTypes = {
        Fortitude: {
            label: "PF1-PathOfWar.Maneuvers.SaveTypes.fortitude",
        },
        Reflex: {
            label: "PF1-PathOfWar.Maneuvers.SaveTypes.reflex",
        },
        Will: {
            label: "PF1-PathOfWar.Maneuvers.SaveTypes.will",
        },
        None: {
            label: "PF1-PathOfWar.Maneuvers.SaveTypes.none",
        },
        Special: {
            label: "PF1-PathOfWar.Maneuvers.SaveTypes.special",
        },
    };

    // Add save effects to config
    pf1.config.maneuverSaveEffects = {
        Half: {
            label: "PF1-PathOfWar.Maneuvers.SaveEffects.half",
        },
        Negates: {
            label: "PF1-PathOfWar.Maneuvers.SaveEffects.negate",
        },
        Partial: {
            label: "PF1-PathOfWar.Maneuvers.SaveEffects.partial",
        },
        Text: {
            label: "PF1-PathOfWar.Maneuvers.SaveEffects.text",
        },
    };

    // Add Martial Discipline as feat subtype
    CONFIG.PF1.featTypes["martialDiscipline"] = "PF1-PathOfWar.FeatTypes.martialDiscipline.Single";
    pf1.config.sheetSections.features.martialDiscipline = {
        label: "PF1-PathOfWar.FeatTypes.martialDiscipline.Plural",
        filters: [{ type: "feat", subTypes: ["martialDiscipline"] }],
        interface: { create: true, actions: false, types: false },
        create: { type: "feat", system: {subType: "martialDiscipline"} },
        sort: 10_000
    };

    // Add section for maneuvers in Combat tab
    pf1.config.sheetSections.combat.maneuvers = {
        label: "PF1-PathOfWar.System",
        interface: { create: true, actions: false, types: true },
        filters: [{ type: `${MODULE_ID}.maneuver` }],
        create: { type: `${MODULE_ID}.maneuver` },
        sort: 3_700,
    };
}

function registerItems() {
    // Register new item type
    Object.assign(CONFIG.Item.documentClasses, {
        [`${MODULE_ID}.maneuver`]: ManeuverItem
    });

    Object.assign(pf1.documents.item, {
        Maneuver: ManeuverItem
    })

    Object.assign(CONFIG.Item.dataModels, {
        [`${MODULE_ID}.maneuver`]: ManeuverModel
    });

    // Register new item sheet.
    const itemSheets = {
        [`${MODULE_ID}.maneuver`]: ManeuverSheet,
    }

    for (let [type, sheet] of Object.entries(itemSheets)) {
        DocumentSheetConfig.registerSheet(Item, MODULE_ID, sheet, {
            types: [type],
            makeDefault: true
        });
    }
}