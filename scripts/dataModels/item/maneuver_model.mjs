import { ManeuverItemModel } from './maneuver_item_model.mjs';

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
            // charges: new fields.SchemaField({
            //     value: new fields.NumberField({ initial: 1 }),
            //     max: new fields.NumberField({ initial: 1 })
            // }),
            maneuverType: new fields.StringField({ initial: "Strike" }),
            saveType: new fields.StringField({ initial: "None" }),
            saveEffect: new fields.StringField({ initial: "See text" }),
        };
        this.addDefaultSchemaFields(schema);
        return schema;
    }
    prepareDerivedData() {
        super.prepareDerivedData();

    }
}