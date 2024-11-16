import { ManeuverItemSheet } from './maneuver_item_sheet.mjs';
import { MODULE_ID } from '../../_module.js';

export class ManeuverSheet extends ManeuverItemSheet {
  // Specify the Handlebars template
  get template() {
    return `modules/${MODULE_ID}/templates/item/maneuver.hbs`;
    }
}