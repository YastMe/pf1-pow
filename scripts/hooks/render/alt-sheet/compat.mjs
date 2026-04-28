import { MODULE_ID } from "../../../_moduleId.mjs";
import { createTemplate } from "../../../documents/actor/actor-sheet.mjs";
import { maneuverBrowser } from "../../../compendiumBrowser/maneuver-browser.mjs";


export function renderAltActorHook(data, app, html) {
    injectPathofWarTab(app, html);
    addControlHandlers(app, html);
    setActiveClassSubTab(html, app);
    attachManeuverBrowserHandlers(html);
    if (app._forceShowManeuverTab) {
        app.activateTab("maneuvers", "primary");
        setTimeout(() => delete app?._forceShowManeuverTab, 1000);
    }
}

function injectPathofWarTab(app, html) {
    const { actor } = app;
    if ((actor.getRollData()?.pow?.initLevel > 0 || actor.getRollData()?.initLevel > 0) || actor.flags[MODULE_ID]?.sparker) {
        const tabSelector = html.find("a[data-tab=skills]");
        const powTab = document.createElement("a");
        powTab.classList.add("item");
        powTab.dataset["tab"] = "maneuvers";
        powTab.dataset["group"] = "primary";
        powTab.innerText = game.i18n.localize("PF1-PathOfWar.TabName");
        tabSelector.after(powTab);

        const powBody = createTemplate(
            `pf1-pow-alt`,
            {
                actor: actor,
            }
        );
        const bodySelector = html.find("div.tab[data-tab=skills]");
        bodySelector.after(powBody);
    }
}

function addControlHandlers(app, html) {
    const classSelectors = html.find("a.item.class-selector");
    const items = html.find(".maneuver-control");
    const { actor } = app;

    classSelectors.on("click", function () {
        const selectedClass = $(this).data("tab");
        html.find("a.item.class-selector").removeClass("active");
        $(this).addClass("active");
        html.find("div.tab.maneuvers-group").removeClass("active");
        html.find(`div.tab.maneuvers-group[data-tab=${selectedClass}]`).addClass("active");
        // Store the active subtab id and name
        app._lastManeuverSubtab = selectedClass;
        app._lastManeuverSubtabName = $(this).text().trim();
    });

    const forceTab = () => {
        app._forceShowManeuverTab = true;
        app._lastManeuverSubtab = app._lastManeuverSubtab || html.find("a.item.class-selector.active").data("tab") || html.find("a.item.class-selector").first().data("tab");
    };
    const createNewManeuver = () => {
        const baseName = game.i18n.localize("PF1-PathOfWar.Maneuvers.NewManeuver");
        const n = actor.items.filter(i => i.type === "pf1-pow.maneuver" && i.name.startsWith(baseName)).length;
        const name = n ? `${baseName} (${n})` : baseName;

        // Get the class name and level from the stored values
        const className = app._lastManeuverSubtabName || "";
        const levelString = app._lastManeuverLevel || "1";
        const level = levelString === "overmax" ? 0 : parseInt(levelString, 10) || 1;

        actor.createEmbeddedDocuments("Item", [new Item({
            name,
            type: "pf1-pow.maneuver",
            system: {
                maneuverType: "Untyped",
                saveType: "None",
                saveEffect: "Text",
                description: { value: "" },
                class: className,
                level: level,
            }
        })]);

        // Clear the stored level after use
        delete app._lastManeuverLevel;

        forceTab();
    };

    items.each((_, el) => {
        const item = el;
        const maneuver = actor.items.get(item.id);
        const action = item.name;

        item.addEventListener("click", (event) => {
            // If this is a create button, capture the level from the button's id
            if (action === "create") {
                const buttonId = event.currentTarget.id;
                const levelMatch = buttonId.match(/maneuver-create-(.+)/);
                if (levelMatch) {
                    const level = levelMatch[1];
                    // Store the level so it can be accessed in preCreateItem hook
                    app._lastManeuverLevel = level;
                }
            }

            const actionMap = {
                delete: () => (maneuver.delete(), forceTab()),
                edit: () => maneuver.sheet.render(true),
                display: () => ManeuverItem.buildChatMessageFromManeuver(maneuver),
                create: createNewManeuver,
                recover: () => (maneuver.recoverManeuver(), forceTab()),
                use: () => (maneuver.useManeuver(), forceTab()),
                prepare: () => (maneuver.prepareManeuver(), forceTab()),
                activate: () => (maneuver.toggleStances(), forceTab()),
                grant: () => (maneuver.toggleGrant(), forceTab()),
                showConfig: () => {
                    const configDiv = html.find(".maneuver-control-buttons")[0];
                    configDiv.style.maxHeight = (configDiv.style.maxHeight && configDiv.style.maxHeight !== "0px")
                        ? "0"
                        : `${configDiv.scrollHeight}px`;
                    configDiv.classList.toggle("accordion", "open");
                    forceTab();
                },
                maneuverName: () => {
                    const descriptionDiv = $(`#maneuver-summary-${maneuver.id}`)[0];
                    descriptionDiv.style.maxHeight = (descriptionDiv.style.maxHeight && descriptionDiv.style.maxHeight !== "0px")
                        ? "0px"
                        : `${descriptionDiv.scrollHeight}px`;
                    const isOpen = descriptionDiv.classList.contains("open");
                    if (isOpen) {
                        setTimeout(() => {
                            descriptionDiv.classList.toggle("open");
                        }, 300);
                    } else {
                        descriptionDiv.classList.toggle("open");
                    }
                    forceTab();
                }
            };
            actionMap[action]?.();
        });

        item.parentElement.parentElement.addEventListener("mousedown", (event) => {
            if (event.button === 2 && maneuver) {
                event.preventDefault();
                maneuver.sheet.render(true);

            }
        });
    });
}

function setActiveClassSubTab(html, app) {
    if (app._lastManeuverSubtab) {
        html.find("a.item.class-selector").removeClass("active");
        html.find(`a.item.class-selector[data-tab=${app._lastManeuverSubtab}]`).addClass("active");
        html.find("div.tab.maneuvers-group").removeClass("active");
        html.find(`div.tab.maneuvers-group[data-tab=${app._lastManeuverSubtab}]`).addClass("active");
        return;
    }
    const firstClassSelector = html.find("a.item.class-selector").first();
    if (firstClassSelector.length > 0) {
        firstClassSelector.addClass("active");
        const firstClassTab = firstClassSelector.data("tab");
        html.find(`div.tab.maneuvers-group[data-tab=${firstClassTab}]`).addClass("active");
        app._lastManeuverSubtab = firstClassTab;
        app._lastManeuverSubtabName = firstClassSelector.text().trim();
    }
}

function attachManeuverBrowserHandlers(html) {
    const searchButtons = html.find(".item-search");
    searchButtons.each((_, button) => {
        button.addEventListener("click", maneuverBrowser);
    });
}

export function injectAltPoWDiv(app, html, data) {
    const targetBlock = html.find(".form-group.stacked:contains('Saving Throws')");

    const initiatingModifier = data.actor.getFlag(MODULE_ID, "maneuverAttr") || "int";
    const maneuverAttr = data.actor.getFlag(MODULE_ID, "maneuverAttr") || "int";
    const duoPartner = data.actor.getFlag(MODULE_ID, "duoPartner") || "";
    const staminaPool = data.actor.getFlag(MODULE_ID, "staminaPool") || 0;
    const secondaryStaminaPool = data.actor.getFlag(MODULE_ID, "secondaryStaminaPool") || 0;
    const sparker = data.actor.getFlag(MODULE_ID, "sparker") || false;
    const stanceLimitOverride = data.actor.getFlag(MODULE_ID, "stanceLimit") || false;
    const ignoreNonInitiatorClasses = data.actor.getFlag(MODULE_ID, "ignoreNonInitiatorClasses") || false;
    const bypassFatigue = data.actor.getFlag(MODULE_ID, "bypassFatigue") || false;

    const abilityOptions = Object.entries(pf1.config.abilities).map(([key, label]) => {
        const isSelected = (key === maneuverAttr) ? "selected" : "";
        return `<option value="${key}" ${isSelected}>${label}</option>`;
    }).join("");

    const maneuverAttrSelector = `
        <div class="flexrow" data-tooltip="${game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttrTooltip")}">
            <label class="cell left-label half" for="flags.${MODULE_ID}.maneuverAttr">
                ${game.i18n.localize("PF1-PathOfWar.Attributes.maneuverAttr")}
            </label>
            <select class="cell midsize half" name="flags.${MODULE_ID}.maneuverAttr">
                ${abilityOptions}
            </select>
        </div>
    `;

    let staminaPoolSelector = "";
    let bypassFatigueCheckbox = "";
    let secondaryStaminaPoolSelector = "";

    const staminaChoices = { '': '' };
    data.actor.items.forEach(item => {
        if (item?.system?.uses?.max && item.type == "feat") {
            staminaChoices[item.id] = `${item.name}`;
        }
    });
    const sortedStaminaChoices = Object.fromEntries(
        Object.entries(staminaChoices)
            .sort(([, a], [, b]) => a.localeCompare(b))
    );

    if (sparker) {
        staminaPoolSelector = `
            <div class="flexrow">
                <label class="cell left-label half" for="flags.${MODULE_ID}.staminaPool">
                    ${game.i18n.localize("PF1-PathOfWar.Stamina.Pool")}
                </label>
                <select class="cell midsize half" name="flags.${MODULE_ID}.staminaPool">
                    ${Object.entries(sortedStaminaChoices).map(([value, label]) => {
            const isSelected = (value === staminaPool) ? "selected" : "";
            return `<option value="${value}" ${isSelected}>${label}</option>`;
        }).join("")}
                </select>
            </div>
        `;
        bypassFatigueCheckbox = `
        <div class="form-group stacked">
                <label class="checkbox">
                    <input type="checkbox" name="flags.${MODULE_ID}.bypassFatigue" ${bypassFatigue ? "checked" : ""}>
                    ${game.i18n.localize("PF1-PathOfWar.Stamina.BypassFatigue")}
                </label>
            </div>
        `;
    }

    if (sparker && bypassFatigue) {
        secondaryStaminaPoolSelector = `
            <div class="flexrow">
                <label class="cell left-label half" for="flags.${MODULE_ID}.secondaryStaminaPool">
                    ${game.i18n.localize("PF1-PathOfWar.Stamina.SecondaryPool")}
                </label>
                <select class="cell midsize half" name="flags.${MODULE_ID}.secondaryStaminaPool">
                    ${Object.entries(sortedStaminaChoices).map(([value, label]) => {
            const isSelected = (value === secondaryStaminaPool) ? "selected" : "";
            return `<option value="${value}" ${isSelected}>${label}</option>`;
        }).join("")}
                </select>
            </div>
        `;
    }


    const powSection = $(`
        <div class="form-group stacked pow-div">
            <div class="flexrow">
                <h2>${game.i18n.localize("PF1-PathOfWar.TabName")}</h2>
            </div>

            ${maneuverAttrSelector}

            ${staminaPoolSelector}

            ${secondaryStaminaPoolSelector}

            <div class="form-group stacked">
                <label class="checkbox">
                    <input type="checkbox" name="flags.${MODULE_ID}.sparker" ${sparker ? "checked" : ""}>
                    ${game.i18n.localize("PF1-PathOfWar.Sparker")}
                </label>
            </div>

            ${bypassFatigueCheckbox}

            <div class="form-group stacked">
                <label class="checkbox">
                    <input type="checkbox" name="flags.${MODULE_ID}.stanceLimit" ${stanceLimitOverride ? "checked" : ""}>
                    ${game.i18n.localize("PF1-PathOfWar.Stances.StanceLimit")}
                </label>
            </div>

            <div class="form-group stacked">
                <label class="checkbox">
                    <input type="checkbox" name="flags.${MODULE_ID}.ignoreNonInitiatorClasses" ${ignoreNonInitiatorClasses ? "checked" : ""}>
                    ${game.i18n.localize("PF1-PathOfWar.IgnoreNonInitiatorClasses")}
                </label>
            </div>
        </div>
    `);

    targetBlock.after(powSection);
}
