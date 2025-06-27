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
            maneuverType: new fields.StringField({ initial: "Strike" }),
            saveType: new fields.StringField({ initial: "None" }),
            saveEffect: new fields.StringField({ initial: "See text" }),
            defaultAttack: new fields.ObjectField({ type: "attack", required: false, initial: undefined }),
			ready: new fields.BooleanField({ initial: false }),
			granted: new fields.BooleanField({ initial: false }),
			stanceActive: new fields.BooleanField({ initial: false })		
        };
        this.addDefaultSchemaFields(schema);
        return schema;
    }
    prepareDerivedData() {
        super.prepareDerivedData();

    }
}