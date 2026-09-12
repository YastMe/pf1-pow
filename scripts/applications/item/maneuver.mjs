import { MODULE_ID } from "../../consts.mjs";

/**
 * Sheet for `maneuver` type items.
 *
 * @hideconstructor
 */
export function registerManeuverItemSheet() {
    const { ActionItemSheetPF } = pf1.applications.item.abstract;
    return class ManeuverSheet extends ActionItemSheetPF {
        /** @inheritdoc */
        static SHEET_CONFIG = {
            types: ["maneuver"],
            makeDefault: true,
        };

        /**
         * @override
         * @hidden
         * @category Foundry API
         */
        static DEFAULT_OPTIONS = {
            window: {
                icon: "fa-solid fa-hand-fist",
            },
        };

        /** @inheritdoc */
        static PARTS = {
            ...super.PARTS,
            header: {
                ...super.PARTS.header,
                templates: [
                    ...super.PARTS.header.templates,
                    `modules/${MODULE_ID}/templates/items/headers/maneuver-header.hbs`,
                    `systems/pf1/templates/items/parts/item-summary.hbs`,
                ],
            },
            sidebar: {
                template: `modules/${MODULE_ID}/templates/items/sidebar/maneuver-sidebar.hbs`,
                templates: [...super.PARTS.sidebar.templates],
            },
            description: {
                ...super.PARTS.description,
                template: `modules/${MODULE_ID}/templates/items/tabs/maneuver-description.hbs`,
                templates: [
                    "systems/pf1/templates/items/parts/item-instructions.hbs",
                    `modules/${MODULE_ID}/templates/items/description/maneuver-header.hbs`,
                ],
                scrollable: ["prose-mirror"],
            },
            details: {
                template: `modules/${MODULE_ID}/templates/items/tabs/maneuver-details.hbs`,
                templates: [
                    "systems/pf1/templates/items/parts/item-actions.hbs",
                    "systems/pf1/templates/items/parts/item-action-summary.hbs",
                    "systems/pf1/templates/items/parts/item-notes.hbs",
                    `modules/${MODULE_ID}/templates/items/parts/maneuver-discipline.hbs`,
                    `modules/${MODULE_ID}/templates/items/parts/maneuver-descriptors.hbs`,
                    `modules/${MODULE_ID}/templates/items/parts/maneuver-learned-at.hbs`,
                    "systems/pf1/templates/items/parts/item-tags.hbs",
                ],
                scrollable: [""],
            },
        };

        /**
         * @override
         * @hidden
         * @param {object} options
         * @returns {object}
         */
        async _prepareContext(options) {
            const context = await super._prepareContext(options);
            context.isManeuver = true;

            const collator = pf1.utils.i18n.sortCollator;

            const actor = this.actor;

            const item = this.item;
            const system = item.system;

            /** @type {pf1pow.models.actor.components.ManeuverListModel | null} */
            let maneuverList = null;
            if (actor) maneuverList = system.pow.maneuverList;

            context.isArchetype = maneuverList?.isArchetype ?? false;
            context.isSparker = maneuverList?.stamina.useSystem ?? false;

            if (!actor) {
                // Pretend this is a sparker's maneuver when not on actor
                context.isSparker = true;
            }
            context.maneuverLists = actor?.system.pow.maneuvers ?? {};
            context.maneuverListChoices = Object.fromEntries(
                Object.entries(context.maneuverLists)
                    .map(([key, { label }]) => [key, label])
                    .sort(([_0, n0], [_1, n1]) => collator.compare(n0, n1)),
            );

            return context;
        }

        /** @inheritdoc */
        _prepareDetails(context) {
            super._prepareDetails(context);

            context.labels.learnedAt = {};

            if (context.system.learnedAt) {
                const labelSource = {
                    discipline: pf1pow.utils.packs.disciplineIdMap,
                };

                for (const [type, learned] of Object.entries(context.system.learnedAt)) {
                    if (!learned) continue;

                    const entries = [];
                    const labels = labelSource[type] ?? {};
                    for (const [id, level] of Object.entries(learned)) {
                        entries.push({
                            id,
                            label: labels[id] || id,
                            level,
                            hasLabel: Number.isFinite(level),
                        });
                    }

                    const collator = pf1.utils.i18n.sortCollator;
                    entries.sort((a, b) => collator.compare(a.label, b.label));
                    context.labels.learnedAt[type] = {};
                    for (const discInfo of entries) {
                        context.labels.learnedAt[type][discInfo.id] = discInfo;
                    }
                }
            }
        }

        /**
         * @override
         * @hidden
         */
        _processFormData(event, form, formData) {
            formData = super._processFormData(event, form, formData);

            return formData;
        }
    };
}
