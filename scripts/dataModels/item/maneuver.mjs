// Copied from system
// #StartCopy
/**
 * Validates key to be slug-like
 *
 * @param {string} key
 * @returns {string}
 */
function isSlug(key) {
    return pf1.utils.createTag(key, { camelCase: true }) === key;
}

/**
 * Validates key to be a slug
 *
 * @param {string} key
 */
function validateSlug(key) {
    if (!isSlug(key)) {
        throw new Error("Class ID must be a basic slug");
    }
}

/**
 * Validates key to be safe alphanumerical
 *
 * @param {string} key
 */
function validateKey(key) {
    if (!/^[a-z][a-z0-9\s]+$/i.test(key)) {
        throw new Error("Key must not contain special characters");
    }
}
// #EndCopy

/**
 * Maneuver item data model
 */
export function registerManeuverModel() {
    return class ManeuverModel extends pf1.models.item.abstract.ActionItemModel {
        /** @type {string} */
        initClassId;

        /**
         * @internal
         * @category Document
         * @readonly
         */
        static metadata = Object.freeze({
            ...super.metadata,
            type: "pf1-pow.maneuver",
            label: "PF1-POW.Labels.maneuver",
        });

        /**
         * @override
         * @hidden
         */
        static defineSchema() {
            const fields = foundry.data.fields;

            const optional = { required: false, initial: undefined };

            const schema = {
                ...super.defineSchema({ changes: false }),
                learnedAt: new fields.SchemaField({
                    discipline: new fields.TypedObjectField(
                        new fields.NumberField({ integer: true, min: 0, nullable: false, required: true }),
                        {
                            ...optional,
                            validateKey,
                        },
                    ),
                    classType: new fields.TypedObjectField(new fields.StringField({ blank: false, required: true }), {
                        ...optional,
                        validateSlug,
                    }),
                }),
                level: new fields.NumberField({ min: 1, integer: true, nullable: false, initial: 1, required: true }),
                discipline: new fields.StringField({ blank: false, required: true, initial: "blackSeraph" }),
                descriptors: new fields.SetField(new fields.StringField({ blank: false, required: true }), {
                    ...optional,
                }),
                maneuverList: new fields.StringField({ ...optional }),
                ready: new fields.BooleanField({ required: true, initial: false }),
                needGranted: new fields.BooleanField({ required: true, initial: false }),
                granted: new fields.BooleanField({ required: true, initial: false }),
                stamina: new fields.SchemaField(
                    {
                        cost: new pf1.models.fields.FormulaField(),
                    },
                    { ...optional },
                ),
                usesStamina: new fields.BooleanField({ required: true, initial: false }),
                uses: new fields.SchemaField(
                    {
                        cost: new pf1.models.fields.FormulaField({ ...optional }),
                    },
                    { ...optional },
                ),
                ilOffset: new fields.NumberField({ integer: true, ...optional }),
                initTime: new fields.SchemaField(
                    {
                        value: new fields.NumberField({ integer: true, min: 0, initial: 1, ...optional }),
                        unit: new fields.StringField({ blank: false, initial: "rounds", ...optional }),
                    },
                    {
                        ...optional,
                    },
                ),
                type: new fields.StringField({ blank: false, required: true, initial: "strike" }),
                defaultAttack: new fields.ObjectField({ type: "attack", required: false, initial: undefined }),
            };

            // Maneuvers don't have the following
            delete schema.subType;
            delete schema.tag;

            return schema;
        }

        /**
         * @override
         * @hidden
         * @param {object} data Creation Data
         * @param {object} options Context Options
         * @param {User} user Triggering User
         */
        async _preCreate(data, options, user) {
            await super._preCreate(data, options, user);

            // Following is only if the item is added on actor
            if (!this.parent.actor) return;

            // TODO: Create maneuver list data model, validate if this.maneuverList is instance of that model,
            // and if not, return. If it is, swap needGranted if the maneuver list has a type of "granted".

            /*
		if (!(this.maneuverList instanceof pf1pow.models.actor.components.ManeuverListModel)) return;

		// Swap needGranted if the maneuver list has a type of "granted"
		if (this.maneuverList.type === "granted") {
			this.needGranted = true;
		}
		*/

            this.constructor._adjustNewItem(this.parent, data, false);
        }

        /** @inheritdoc */
        static _adjustNewItem(item, data, override = false) {
            if (!item.actor) return;

            // Assign level if undefined
            if (override || !Number.isFinite(data.system?.level)) {
                // Get the class from the maneuver list
                const cls = this.maneuverList.class;
                const level = item.system.learnedAt?.discipline?.[cls];
                if (Number.isFinite(level)) {
                    data.system.level = Math.clamp(level, 1, 9);
                }
            }

            // Prepare if undefined
            if (override || !data.system?.ready) {
                data.system.ready = true;
            }
        }

        /** @override */
        prepareBaseData() {
            super.prepareBaseData();

            this.discipline ??= "blackSeraph";
            this.descriptors ??= new Set();

            this.learnedAt ??= {};

            this.stamina ??= {};
            this.stamina.enabled ??= false;

            this.uses ??= {};

            this.initTime ??= {};
        }

        prepareDerivedData() {
            super.prepareDerivedData();

            // Linked maneuver list
            if (this.maneuverList?.length) {
                const list = this.getManeuverList();
                if (!list) return;

                this.stamina.enabled = list.stamina.useSystem;

                // Soft set the cost to the level if not already set
                this.uses.cost = String(this.level);
            } else {
                this.stamina.enabled = false;
            }
        }

        /** @inheritdoc */
        static pruneData(source) {
            if (!source.maneuverList) delete source.maneuverList;
            if (source.descriptors?.length === 0) delete source.descriptors;
            if (source.stamina) {
                if (!source.stamina.cost?.length) delete source.stamina.cost;
                if (foundry.utils.isEmpty(source.stamina)) delete source.stamina;
            }
            if (!source.ilOffset) delete source.ilOffset;

            if (source.learnedAt) {
                for (const [key, entries] of Object.entries(source.learnedAt)) {
                    // Convert tuple to record
                    if (Array.isArray(entries)) {
                        const learned = {};
                        for (const [discipline, level] of entries) {
                            // Skip valid entries
                            if (typeof discipline !== "string" || !discipline.length) continue;

                            // Split combined entries and transform them to object format
                            for (let disc of discipline.split("/")) {
                                disc = disc.trim().replace(".", "-");
                                if (disc) learned[disc] = level;
                            }
                        }
                        source.learnedAt[key] = learned;
                    }

                    if (foundry.utils.isEmpty(source.learnedAt[key])) delete source.learnedAt[key];
                }
                if (foundry.utils.isEmpty(source.learnedAt)) delete source.learnedAt;
            }

            if (source.initTime) {
                if (foundry.utils.isEmpty(source.initTime)) delete source.initTime;
            }

            if (source.uses) {
                if (!source.uses.cost?.length) delete source.uses.cost;
                if (foundry.utils.isEmpty(source.uses)) delete source.uses;
            }

            if (source.defaultAttack) {
                if (foundry.utils.isEmpty(source.defaultAttack)) delete source.defaultAttack;
            }

            if (!source.type) delete source.type;

            super.pruneData(source);
        }

        // GETTERS

        /** @type {boolean} */
        get usesStamina() {
            return this.maneuverList?.stamina?.useSystem ?? false;
        }

        /**
         * Number of remaining uses, or max
         *
         * @param {boolean} max - Return max uses.
         * @returns {number} - Uses
         */
        getUses(max = false) {
            const list = this.maneuverList;
            if (!list) return 0;
            if (this.usesStamina) {
                if (this.ready) {
                    if (max) return Math.max(Math.floor(list.stamina.max / this.uses.cost), 0);
                    return Math.max(Math.floor(list.stamina.value / this.uses.cost), 0);
                }
                return 0;
            }
            if (this.ready) return 1;
            return 0;
        }

        /**
         * @inheritDoc
         * @remarks
         * Checks for granted and preparation status.
         */
        get canUse() {
            if (this.needGranted && !this.granted) return false;
            if (this.ready) return true;
            return false;
        }

        /**
         * Effective initiator level
         *
         * @remarks
         *  - Accounts for offset
         *  - Returns null if not linked to a valid maneuver list
         *
         * @type {number | null}
         */
        get initiatorLevel() {
            const list = this.getManeuverList();
            if (!list) return null;

            return list.il.total + (this.ilOffset || 0);
        }

        // FUNCTIONS

        /**
         * Retrieve associated maneuver list
         *
         * @returns {pf1pow.models.actor.components.ManeuverListModel | void} - Maneuver list
         */
        getManeuverList() {
            return this.parent.actor?.system.pow?.[this.maneuverList];
        }

        // STATIC UTILITY METHODS

        /**
         * Get minimum maneuver level and initiator level for a spell.
         *
         * @param {pf1pow.documents.ItemData<ManeuverData>} maneuverData - A maneuver item's data
         * @returns {[number, number]} - Tuple of [minimum maneuver level, minimum initiator level]
         */
        static getMinILFromData(maneuverData) {
            const learnedAt = Object.entries(maneuverData.system.learnedAt?.discipline ?? {});

            let ml = 9;
            let il = 20;

            for (const [classId, level] of learnedAt?.classType || []) {
                ml = Math.min(ml, level);
                const pt = pf1pow.config.classInitiatorType[classId] || "archetype";

                // Use initiator progression table to support alterations
                const table = pf1pow.config.initiatorProgression.maneuversReady.ready[pt];
                const nil = (table?.findIndex((ls) => ls.length === level + 1) ?? Infinity) + 1;

                il = Math.min(il, nil ?? Infinity);
            }

            return [ml, il];
        }

        // TODO: Convert maneuver into a consumable item. Ref: https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/blob/master/module/models/item/spell-model.mjs?ref_type=heads#L721

        // LIMITED USES

        /**
         * Add charges to the maneuver or its relevant resource pool (stamina).
         *
         * @override
         * @param {number} value - Number of charges to add
         * @returns {Promise<this | void>} Updated document or undefined if no update is possible or required.
         */
        async addCharges(value) {
            if (!this.usesStamina) return;
            if (!this.parent.actor) return;

            /** @type {pf1pow.models.actor.components.ManeuverListModel} */
            const list = this.maneuverList;
            if (!list) return;

            const listId = this.maneuverList;
            if (!listId) return;

            if (this.usesStamina) {
                const oldValue = this.getUses();
                const newValue = Math.max(0, oldValue + value);

                const key = `system.pow.maneuvers.${listId}.stamina.value`;
                return this.parent.actor.update({ [key]: newValue });
            }
        }

        /* ------ Description ------ */

        /** @inheritdoc */
        async getDescription({
            chatcard = false,
            data = {},
            actionId,
            rollData,
            header = true,
            body = true,
            isolated = false,
            placeholder = true,
            container = false,
        } = {}) {
            let bodyContent = "";
            if (body) {
                bodyContent = this.description.value;
                if (!bodyContent?.length && placeholder) {
                    const noDesc = "<p class='placeholder'>" + _loc("PF1-POW.Placeholders.noDescription") + "</p>";
                    bodyContent = noDesc;
                }
            }

            let headerContent = "";
            if (header) {
                headerContent = pf1.utils.handlebars.renderCachedTemplate(
                    "modules/pf1-pow/templates/items/description/maneuver-header.hbs",
                    {
                        ...data,
                        ...(await this.getDescriptionData({ rollData, actionId, isolated })),
                        chatcard: chatcard === true,
                    },
                );
            }
            return headerContent + bodyContent;
        }

        /** @inheritdoc */
        getLabels(labels, options) {
            super.getLabels(labels, options);

            // Maneuver level and discipline
            labels.level = pf1pow.config.maneuverLevels[this.level];
            labels.discipline = pf1pow.config.maneuverDisciplines[this.discipline];
            labels.descriptors = pf1.utils.i18n.join([...(this.descriptors.names ?? [])], "conjunction", false);
        }

        /** @inheritdoc */
        async _getDescriptionData(options = {}) {
            const result = await super._getDescriptionData(options);

            options.rollData ||= result.rollData;

            result.labels = this.parent.getLabels(options);

            // Set information about when the maneuver is learned
            result.learnedAt = {};

            const disciplineNames = pf1pow.utils.packs.disciplineIdMap;
            const classTypes = pf1pow.utils.packs.classIdMap;
            for (const category of ["discipline", "classType"]) {
                const learnedAt = this.learnedAt[category];
                if (!learnedAt) continue;
                if (!Object.keys(learnedAt).length) continue;
                result.learnedAt[category] = of1.utils.i18n.join(
                    Object.entries(learnedAt).map(
                        ([classId, level]) => `${disciplineNames[classId] || classTypes[classId]} ${level}`,
                    ),
                );
            }

            return result;
        }

        /** @inheritdoc */
        async getChatData(options) {
            const result = await super.getChatData(options);

            return result;
        }

        /* ------ Changes ------ */

        /** @inheritdoc */
        getConditionalTargets(targets) {
            super.getConditionalTargets(targets);

            // Add Initiator Level target
            targets.push({
                id: "il",
                label: _loc("PF1-POW.Labels.initiatorLevel"),
                simple: true,
                sort: (targets.find((e) => e.id === "dc").sort ?? 5_000) + 100, // Sort after DC
            });

            const charges = targets.find((t) => t.id === "charges");
            charges.label = _loc("PF1-POW.Labels.Stamina.Cost");
        }
    };
}
