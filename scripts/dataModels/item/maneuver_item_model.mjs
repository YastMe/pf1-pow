export class ManeuverItemModel extends foundry.abstract.TypeDataModel {
    // Adds the default schema fields to the Maneuver Item model schema.
    static addDefaultSchemaFields(schema) {
        const fields = foundry.data.fields;
        Object.assign(schema, {
            uses: new fields.SchemaField({
                per: new fields.StringField({required: true, initial: "charges"}),
                value: new fields.NumberField({required: true, initial: 0}),
                maxFormula: new fields.StringField({required: true, initial: ""}),
                autoDeductChargesCost: new fields.StringField({required: true, initial: ""}),
                rechargeFormula: new fields.StringField({required: true, initial: ""}),
            }),
            actions: new fields.ArrayField(new fields.JSONField({required: true, initial: {}})),
            description: new fields.SchemaField({
                value: new fields.StringField({required: true, initial: ""}),
            }),
            changes: new fields.ArrayField(new fields.SchemaField({
                _id: new fields.StringField({required: true, initial: ""}),
                formula: new fields.StringField({initial: ""}),
                target: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: ""}),
                operator: new fields.StringField({required: false, initial: undefined}),
                priority: new fields.NumberField({required: false, initial: undefined}),
                continuous: new fields.BooleanField({required: false, initial: undefined}),
            })),
            contextNotes: new fields.ArrayField(new fields.SchemaField({
                target: new fields.StringField({initial: ""}),
                text: new fields.StringField({initial: ""})
            })),
            sources: new fields.ArrayField(new fields.SchemaField({
                title: new fields.StringField({initial: ""}),
                pages: new fields.StringField({initial: ""}),
                id: new fields.StringField({initial: ""}),
                errata: new fields.StringField({initial: ""}),
                date: new fields.StringField({initial: ""}),
                publisher: new fields.StringField({initial: ""}),
            }))
        });
    }

    prepareDerivedData() {
    }

    _recurseAttach = (obj, details) => {
        Object.entries(details).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (!obj[key]) {
                    obj[key] = [];
                }
                obj[key].push(...value);
            } else if (typeof value === "object") {
                if (!obj[key]) {
                    obj[key] = {};
                }
                this._recurseAttach(obj[key], value);
            } else {
                obj[key] = value ?? obj[key] ?? 0
            }
        });
    }
}