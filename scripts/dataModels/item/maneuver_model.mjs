import { ManeuverItemModel } from './maneuver_item_model.mjs';

import { MARTIAL_TRAINING_IDS } from '../../constants.js';

export class ManeuverModel extends ManeuverItemModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = {
            discipline: new fields.StringField({ initial: "Black Seraph" }),
            level: new fields.NumberField({ initial: 1 }),
            initTime: new fields.SchemaField({
                value: new fields.NumberField({ initial: 1 }),
                units: new fields.StringField({ initial: "standard" })
            }),
            maneuverType: new fields.StringField({ initial: "Strike" }),
            saveType: new fields.StringField({ initial: "None" }),
            saveEffect: new fields.StringField({ initial: "See text" }),
            defaultAttack: new fields.ObjectField({ type: "attack", required: false, initial: undefined }),
            ready: new fields.BooleanField({ initial: false }),
            granted: new fields.BooleanField({ initial: false }),
            stanceActive: new fields.BooleanField({ initial: false }),
            class: new fields.StringField({ initial: "" }),
        };
        this.addDefaultSchemaFields(schema);
        return schema;
    }
    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.class) {
            const actor = this?.parent?.parent;
            if (actor && actor.type === "character") {
                const classes = actor.items.filter(i => i.type === "class");
                const initiatorClasses = classes.filter(c => {
                    const cData = c.system;
                    return cData?.maneuverProgression?.classType;
                });
                const martialTrainingFeats = actor.items.filter((item) => MARTIAL_TRAINING_IDS.includes(item._source._stats.compendiumSource));
                if (martialTrainingFeats.length > 0) {
                    this.class = "Martial Training";
                }
                else if (initiatorClasses.length > 0) {
                    this.class = initiatorClasses[0].name;
                }
                else {
                    this.class = actor.items.find(i => i.type === "class")?.name || "";
                }
            }
        }
    }
}