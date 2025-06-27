export class ManeuverItemSheet extends pf1.applications.item.ItemSheetPF {
    static get defaultOptions() {
        const options = super.defaultOptions;
        return {
            ...options,
            classes: [...options.classes, "pf1", "item", "maneuverItem"]
        };
    }

    async _updateObject(event, formData) {
        return ItemSheet.prototype._updateObject.call(this, event, formData);
    }

    _onDeleteChange(event) {
        event.preventDefault();
        const el = event.target;
        const changeId = el.dataset.changeId;

        game.tooltip.dismissLockedTooltip(el.closest(".locked-tooltip"));
        this.item.changes.get(changeId)?.delete();
    }
}