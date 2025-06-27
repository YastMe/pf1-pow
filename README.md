
pf1-pow
=======

This module aims to incorporate Dreamscarred Press' Path of War system into the Pathfinder 1e system for FoundryVTT.

Features
========

It includes the necessary Item types for a fully fledged implementation of the Martial Disciplines and Maneuvers at the users' content. The module contains four macros to ease the utilization of the system for both players and GMs alike. Please review them in the corresponding Compendium. 
* Set Initiation Modifier: This macro sets the currently selected token's Initiation Modifier, used to calculate saving throw DCs. If no token is selected, it will default to the player's selected character in the User Configuration section.
* Use Maneuver: This macro shows a dialogue with a dropdown menu from where to select the maneuver. When used, it will be shared in the chat with all necessary information, including description and Save DC if applicable, and a use will be expended.
* Recover Maneuver: Like the previous macro, but this time recovers a use and the dropdown menu only shows maneuvers that aren't at full capacity.
* Recover all Maneuvers: This macro recovers all of the maneuvers the character had expended. Like the previous macros, only works when a token is selected or, by default, with the player's selected character.

**The functionalities previously only accessible via Macros are now integrated into the Character Sheet**

The module also includes the following changes to the character sheet: 
* Added Autohypnosis (Wis, Trained only) to Skills tab.
* Added Knowledge (Martial) (Int, Trained only) to Skills tab.
* Added Path of War tab to house maneuvers and stances, as well as other relevant information.
* Added Martial Disciplines row to Features tab.

Plus, the module now includes a Maneuver Browser button both in the Compendiums tab on the sidebar and the Path of War row inside the Combat tab on a character's sheet.

How to enable the Path of War tab:
===
Either
- Add a class from the module to the relevant actor.
- Add any of the Martial Training feats to the relevant actor.
- Add the Combat Training Trait to the relevant actor.
- Edit an existing class, the Details tab now has a selector for maneuver progression.
- Activate the toggle for the Sparking subsystem on the Settings tab of the actor's sheet.

License
=======

For the full license, see the [LICENSE](https://github.com/YastMe/pf1-pow/blob/main/LICENSE) file

### Legal Note:

"This module uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/communityuse). We are expressly prohibited from charging you to use or access this content. This module is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit paizo.com."

"This module references Path of War, a product of Dreamscarred Press, which is used under the Open Game License v1.0a. To the best of our knowledge, 'Path of War' is not a registered trademark."

"This module is not published, endorsed or specifically approved by Dreamscarred Press. For more information about Dreamscarred Press, visit dreamscarred.com. To the best of our knowledge, this module operates within Dreamscarred Press' OGL Product Identity statement, and all efforts were made to attemt to reach Dreamscarred Press for interpretation, although said efforts were met with unresponsiveness. If a Dreamscarred Press representative is reading this note and believes that the content should be removed from this module, please contact us using the contact information from this module's [module.json](https://github.com/YastMe/pf1-pow/blob/main/module.json) file."

### Content sources

 1.  Dreamscarred Press
	 - [Path of War](https://www.drivethrurpg.com/en/product/135308/path-of-war)
	 - [Path of War Expanded](https://www.drivethrurpg.com/en/product/177763/path-of-war-expanded)
	 - [Divergent Paths: Fool's Errand](https://www.drivethrurpg.com/en/product/208645/divergent-paths-fools-errand)
	 - [Divergent Paths: Rajah](https://www.drivethrurpg.com/en/product/220762)
	 - [Lords of the Night](https://www.drivethrurpg.com/en/product/148871/lords-of-the-night)
2.   Moonhand Press
	 - [Akasha Reshaped: Path of Enlightenment ](https://www.drivethrurpg.com/en/product/361495/akasha-reshaped-path-of-enlightenment)
	 - [Akasha Reshaped: Moon and Tides](https://www.drivethrurpg.com/en/product/352984/akasha-reshaped-moon-and-tides)
3.  Lost Spheres Publishing
	- [Codex of Blood: Parasites and Paragons](https://www.drivethrurpg.com/en/product/318476/codex-of-blood-parasites-paragons)
4. General Sources
	 - [d20PFSRD](https://www.d20pfsrd.com)
	 - [Library of Metzofitz](https://metzo.miraheze.org)
