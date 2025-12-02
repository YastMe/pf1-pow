import { MODULE_ID } from "../../_moduleId.mjs";

export class ManeuverItem extends pf1.documents.item.ItemPF {
	static buildChatMessageFromManeuver(maneuver) {
		const actor = maneuver.actor;
		const { description, maneuverType, stanceActive } = maneuver.system;
		const activeStances = actor.items.filter(
			item => item.type === "pf1-pow.maneuver" &&
				item.system.maneuverType === "Stance" &&
				item.system.stanceActive
		);

		let messageContent = `
		<div class="pf1 chat-card item-card" data-actor-id="${actor.id}" data-item-id="${maneuver.id}">
			<header class="card-header type-color type-pf1-pow.maneuver flexrow">
				<img src="${maneuver.img}" data-tooltip="${maneuver.name}" width="36" height="36">
				<div class="item-name"><h3>${maneuver.name}</h3></div>
			</header>
			<div class="card-content">
				<section class="item-description">${description.value}</section>
			</div>
			<footer class="card-footer">`;

		if (maneuverType === "Stance" && actor.flags[MODULE_ID]?.stanceLimit && activeStances.length >= 1) {
			messageContent += `
			<div class="flexcol property-group gm-sensitive common-notes general-notes">
				<label>${game.i18n.localize("PF1-PathOfWar.Stances.Plural")} ${game.i18n.localize("PF1-PathOfWar.Stances.StanceActive")}</label>
				<div class="flexrow tag-list">
					<span class="tag">${maneuver.name}</span>
					${activeStances
					.filter(item => item !== maneuver)
					.map(item => `<span class="tag">${item.name}</span>`)
					.join('')}
				</div>
			</div>`;
		}

		messageContent += `</footer></div>`;
		messageContent = messageContent.replaceAll("[[", "[[/roll ");

		const rollType = game.settings.get("core", "rollMode");

		let whisper;

		if (rollType !== "publicroll")
			whisper = game.users.filter(u => u.isGM).map(u => u._id)
		else
			whisper = [];

		ChatMessage.create({
			author: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			content: messageContent,
			type: 0,
			whisper: whisper
		});
	}

	generateManeuverChatMessage(maneuver, dc, saveType) {
		let content = `
		<div class="pf1 chat-card item-card" data-actor-id="${this.actor.id}" data-item-id="">
			<header class="card-header type-color type-pf1-pow.maneuver flexrow">
				<img src="${maneuver.img}" data-tooltip="${maneuver.name}" width="36" height="36">
				<div class="item-name"><h3>${maneuver.name}</h3></div>
			</header>
			<div class="card-content">
				<section class="item-description">${maneuver.system.description.value}</section>
			</div>
			<footer class="card-footer"></footer>
		</div>`;

		if (!["None", "Special"].includes(maneuver.system.saveType)) {
			content += `
			<div class="chat-attack" data-index="0">
				<div class="card-button-group flexcol">
					<button data-action="save" data-dc="${dc}" data-type="${saveType}" data-gm-sensitive-inner="${this.system.saveType} Save">${this.system.saveType} DC ${dc}</button>
				</div>
			</div>`;
		}

		content = content.replaceAll("[[", "[[/roll ");

		const rollType = game.settings.get("core", "rollMode");

		let whisper;

		if (rollType !== "publicroll")
			whisper = game.users.filter(u => u.isGM).map(u => u._id)
		else
			whisper = [];


		return {
			author: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			content: content,
			type: 0,
			whisper: whisper
		};
	}

	isAttack = item =>
		item.type === "attack" && (item.system.uses.value === null || item.system.uses.value > 0);

	getAttacks(actor) {
		return actor.items.filter(this.isAttack);
	}

	displayAttacks(actor, maneuver, msgData) {
		const options = this.getAttacks(actor).map(attack => {
			const selected = (this.system.defaultAttack?.name === attack.name) ? "selected" : "";
			return `<option value="${attack.name}" ${selected}>${attack.name}</option>`;
		}).join('');

		new Dialog({
			title: 'Select attack',
			content: `
			<form class="flexcol">
				<div class="form-group">
					<label for="attackSelect">Select an attack</label>
					<select name="attackSelect">${options}</select>
				</div>
			</form>`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Use attack',
					callback: html => {
						const selectedName = html.find('[name="attackSelect"]').val();
						const attack = this.getAttacks(actor).find(a => a.name === selectedName);
						if (attack) {
							attack.use();
							this.update({ 'system.defaultAttack': attack });
							ChatMessage.create(msgData);
							actor.sheet._forceShowManeuverTab = true;
						}
					}
				}
			}
		}).render(true);
	}

	async executeManeuver(html, staminaPool = null, secondaryStaminaPool = null) {
		const extraDC = parseInt(html.find('[name="extraDC"]').val()) || 0;
		const hasWeaponGroup = html.find('[name="weaponGroup"]')[0]?.checked;

		const classId = this.actor.items.find(i => i.type === "class" && i.name === this.system.class)?.id;

		let dc = 10 + this.system.level + extraDC + this.actor._rollData?.pow?.classInitiatorLevels?.[classId]?.maneuverAttr || 0;

		if (this.actor._rollData?.pow?.initiatorModifierBonus)
			dc += this.actor._rollData.pow.initiatorModifierBonus;


		const disciplineKey = Object.entries(pf1.config.disciplines).find(([key, label]) => label === this.system.discipline)?.[0];

		if (disciplineKey) {
			const disciplineBonus = this.actor._rollData?.pow?.[`${disciplineKey}`] || 0;
			dc += disciplineBonus;
		}

		if (hasWeaponGroup) dc += 2;

		const saveTypeMap = { Fortitude: "fort", Will: "will", Reflex: "ref" };
		const saveType = saveTypeMap[this.system.saveType] || undefined;

		const msgData = this.generateManeuverChatMessage(this, dc, saveType);

		const token = game.canvas.tokens.controlled[0];
		if (game.modules.get("autoanimations")?.active)
			AutomatedAnimations.playAnimation(token, this.toObject());

		if (this.system.maneuverType !== "Strike") {
			ChatMessage.create(msgData);
		} else {
			this.displayAttacks(this.actor, this, msgData);
		}
		if (!staminaPool && !this.actor.flags[MODULE_ID]?.duoPartner)
			this.update({ "system.uses.value": this.system.uses.value - 1 });
		else if (this.actor.flags[MODULE_ID]?.duoPartner) {
			this.update({ "system.uses.value": this.system.uses.value - 1 });
			const duoPartnerManeuver = this.actor._rollData.pow.duoPartner.items.find(item => item.name === this.name);
			if (duoPartnerManeuver) {
				duoPartnerManeuver.update({ "system.uses.value": duoPartnerManeuver.system.uses.value - 1 });
			}
		}
		else if (staminaPool && !secondaryStaminaPool) {
			staminaPool.update({ "system.uses.value": staminaPool.system.uses.value - this.system.level });
			if (staminaPool.system.uses.value - this.system.level <= 0) {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.Fatigue")}`);
				this.actor.setCondition("fatigued", true);
			}
		}
		else {
			const diff = this.system.level - staminaPool.system.uses.value;
			if (staminaPool.system.uses.value >= this.system.level)
				staminaPool.update({ "system.uses.value": staminaPool.system.uses.value - this.system.level });
			else {
				staminaPool.update({ "system.uses.value": 0 });
				secondaryStaminaPool.update({ "system.uses.value": secondaryStaminaPool.system.uses.value - diff });
			}
			if (staminaPool.system.uses.value - this.system.level <= 0 && diff <= 0) {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.Fatigue")}`);
				this.actor.setCondition("fatigued", true);
			}
			if (secondaryStaminaPool && secondaryStaminaPool.system.uses.value - diff <= 0) {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.Exhaustion")}`);
				this.actor.setCondition("exhausted", true);
			}
		}
		setTimeout(() => { }, 10)
		this.actor.sheet._forceShowManeuverTab = true;
	}

	displayManeuverDialog(staminaPool = null, secondaryStaminaPool = null) {
		const content = `
		<form class="flexcol">
			<div class="form-group">
				<label for="extraDC">Bonus to DC</label>
				<input type="number" name="extraDC" min="0" value="0"/>
			</div>
			<div class="form-group">
				<label for="weaponGroup">Discipline Weapon Group</label>
				<input type="checkbox" name="weaponGroup"/>
			</div>
		</form>`;

		new Dialog({
			content,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Use maneuver',
					callback: html => this.executeManeuver(html, staminaPool, secondaryStaminaPool)
				}
			},
			default: "yes"
		}).render(true);
	}

	useManeuver() {
		const { uses, ready, granted, maneuverType } = this.system;

		if (this.actor.flags[MODULE_ID]?.sparker) {
			if ((this.actor._rollData.conditions.fatigued && !this.actor.flags[MODULE_ID].bypassFatigue) || (this.actor._rollData.conditions.exhausted || this.actor._rollData.conditions.unconscious)) {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.UseFatigue")}`);
				return;
			}
			const staminaPool = this.actor.items.get(this.actor.flags[MODULE_ID].staminaPool);
			const secondaryStaminaPool = this.actor.items.get(this.actor.flags[MODULE_ID].secondaryStaminaPool);
			if (this.actor.flags[MODULE_ID].bypassFatigue && staminaPool && staminaPool.system.uses.value + secondaryStaminaPool.system.uses.value >= this.system.level) {
				this.displayManeuverDialog(staminaPool, secondaryStaminaPool);
				return;
			}
			else if (this.actor.flags[MODULE_ID].bypassFatigue && staminaPool && staminaPool.system.uses.value + secondaryStaminaPool.system.uses.value < this.system.level) {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.UseFailure")} ${this.name}`);
				return;
			}
			else if (staminaPool && staminaPool.system.uses.value >= this.system.level) {
				this.displayManeuverDialog(staminaPool);
				return;
			} else {
				ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Stamina.UseFailure")} ${this.name}`);
				return;
			}
		}

		const rollData = this.actor._rollData;
		const requiresGrant = rollData?.maneuversGranted;

		if (!ready || (requiresGrant && !granted)) {
			ui.notifications.warn(`${this.name} ${game.i18n.localize("PF1-PathOfWar.Maneuvers.NotReady")}`);
		} else if (uses.value <= 0) {
			ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.UseFailure")} ${this.name}`);
		} else if (!requiresGrant || granted) {
			this.displayManeuverDialog();
		} else {
			ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.UseFailure")} ${this.name}`);
		}
	}

	async recoverManeuverSilent() {
		const { uses, ready } = this.system;
		if (uses.value < uses.max && ready) {
			this.update({ "system.uses.value": uses.value + 1 });
			this.actor.sheet._forceShowManeuverTab = true;
			if (this.actor.flags[MODULE_ID]?.duoPartner) {
				const duoPartnerManeuver = this.actor._rollData.pow.duoPartner.items.find(item => item.name === this.name);
				if (duoPartnerManeuver) {
					duoPartnerManeuver.update({ "system.uses.value": duoPartnerManeuver.system.uses.value + 1 });
				}
			}
		}
	}

	recoverManeuver() {
		const { uses, ready } = this.system;
		if (uses.value < uses.max && ready) {
			this.update({ "system.uses.value": uses.value + 1 });
			ui.notifications.info(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.RecoverSuccess")} ${this.name}`);
			if (this.actor.flags[MODULE_ID]?.duoPartner) {
				const duoPartnerManeuver = this.actor._rollData.pow.duoPartner.items.find(item => item.name === this.name);
				if (duoPartnerManeuver) {
					duoPartnerManeuver.update({ "system.uses.value": duoPartnerManeuver.system.uses.value + 1 });
				}
			}
		} else {
			ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.RecoverFailure")} ${this.name}`);
		}
		this.actor.sheet._forceShowManeuverTab = true;
	}

	prepareManeuver() {
		this.update({ "system.ready": !this.system.ready });
		this.actor.sheet._forceShowManeuverTab = true;
	}

	toggleStances() {
		const newState = !this.system.stanceActive;
		this.update({ "system.stanceActive": newState });

		if (newState) {
			ManeuverItem.buildChatMessageFromManeuver(this);

			if (!this.actor.flags[MODULE_ID]?.stanceLimit) {
				const stances = this.actor.items.filter(
					item => item.type === "pf1-pow.maneuver" &&
						item.system.maneuverType === "Stance" &&
						item !== this
				);
				stances.forEach(stance => stance.update({ "system.stanceActive": false }));
			}
			if (game.modules.get("autoanimations")?.active) {
				const token = canvas.tokens.controlled[0];
				AutomatedAnimations.playAnimation(token, this.toObject());
				this.currentAnimation = Sequencer.EffectManager.getEffects().find(e => e.data.source.contains(token.id));
			}
		}
		else {
			Sequencer.EffectManager.endEffects({ source: this.currentAnimation?.id });
			this.currentAnimation = null;
		}
		setTimeout(() => { }, 10)
		this.actor.sheet._forceShowManeuverTab = true;
	}

	async grantSilent() {
		const { granted } = this.system;
		if (!granted) {
			this.update({ "system.granted": true });
			this.actor.sheet._forceShowManeuverTab = true;
		}
	}

	async grant() {
		const { granted } = this.system;
		if (granted) {
			ui.notifications.warn(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.NotGranted")} ${this.name}`);
			return;
		}

		this.update({ "system.granted": true });
		ui.notifications.info(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.Granted")} ${this.name}`);
		this.actor.sheet._forceShowManeuverTab = true;
		this.actor.sheet.render();
	}

	toggleGrant() {
		const { granted } = this.system;
		if (granted) {
			this.update({ "system.granted": false });
			ui.notifications.info(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.NotGranted")} ${this.name}`);
		} else {
			this.update({ "system.granted": true });
			ui.notifications.info(`${game.i18n.localize("PF1-PathOfWar.Maneuvers.Granted")} ${this.name}`);
		}
		this.actor.sheet._forceShowManeuverTab = true;
	}

	async ungrantSilent() {
		const { granted } = this.system;
		if (granted) {
			this.update({ "system.granted": false });
			this.actor.sheet._forceShowManeuverTab = true;
		}
	}
}
