# pf1-pow
This module aims to incorporate Dreamscarred Press' Path of War system into the Pathfinder 1e system for FoundryVTT.

It includes the necessary Item types for a fully fledged implementation of the Martial Disciplines and Maneuvers at the users' content. This is explicitly a skeleton module, since no content from Dreamscarred Press was authorized to be used.

The module contains four macros to ease the utilization of the system for both players and GMs alike. Please review them in the corresponding Compendium.

 - Set Initiation Modifier: This macro sets the currently selected token's Initiation Modifier, used to calculate saving throw DCs. If no token is selected, it will default to the player's selected character in the User Configuration section.
 - Use Maneuver: This macro shows a dialogue with a dropdown menu from where to select the maneuver. When used, it will be shared in the chat with all necessary information, including description and Save DC if applicable, and a use will be expended.
 - Recover Maneuver: Like the previous macro, but this time recovers a use and the dropdown menu only shows maneuvers that aren't at full capacity.
 - Recover all Maneuvers: This macro recovers all of the maneuvers the character had expended. Like the previous macros, only works when a token is selected or, by default, with the player's selected character.

The module also includes the following changes to the character sheet:
 - Added Autohypnosis (Wis, Trained only) to Skills tab.
 - Added Knowledge (Martial) (Int, Trained only) to Skills tab.
 - Added Path of War row to Combat tab.
 - Added Martial Disciplines row to Features tab.

NOTE: This module does NOT include any existing Disciplines or Maneuvers from any publisher. Users will be responsible for the creation of these on their own worlds. The created items will be shared between worlds on the same FoundryVTT installation if included in the module's compendium (right click - Toggle Edit Lock).

Legal Note: 
"This module uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/communityuse). We are expressly prohibited from charging you to use or access this content. This module is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit paizo.com.

"This module also uses trademarks and/or copyrights owned by Dreamscarred Press, which are used under the Open Game License v1.0a. We are expressly prohibited from charging you to use or access this content. This is not published, endorsed, or specifically approved by Dreamscarred Press."
