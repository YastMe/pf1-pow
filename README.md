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

"Open Game License
OPEN GAME LICENSE Version 1.0a
The following text is the property of Wizards of the Coast, Inc and is
Copyright 2000 Wizards of the Coast, Inc (“Wizards”). All Rights Reserved.
1. Definitions: (a)”Contributors” means the copyright and/or trademark
owners who have contributed Open Game Content; (b)”Derivative Material”
means copyrighted material including derivative works and translations
(including into other computer languages), potation, modification, correction,
addition, extension, upgrade, improvement, compilation, abridgment or other
form in which an existing work may be recast, transformed or adapted; (c)
“Distribute” means to reproduce, license, rent, lease, sell, broadcast, publicly
display, transmit or otherwise distribute; (d)”Open Game Content” means the
game mechanic and includes the methods, procedures, processes and routines
to the extent such content does not embody the Product Identity and is an
enhancement over the prior art and any additional content clearly identified
as Open Game Content by the Contributor, and means any work covered
by this License, including translations and derivative works under copyright
law, but specifically excludes Product Identity. (e) “Product Identity” means
product and product line names, logos and identifying marks including trade
dress; artifacts; creatures characters; stories, storylines, plots, thematic elements,
dialogue, incidents, language, artwork, symbols, designs, depictions, likenesses,
formats, poses, concepts, themes and graphic, photographic and other
visual or audio representations; names and descriptions of characters, spells,
enchantments, personalities, teams, personas, likenesses and special abilities;
places, locations, environments, creatures, equipment, magical or supernatural
abilities or effects, logos, symbols, or graphic designs; and any other trademark
or registered trademark clearly identified as Product identity by the owner of the
Product Identity, and which specifically excludes the Open Game Content; (f)
“Trademark” means the logos, names, mark, sign, motto, designs that are used
by a Contributor to identify itself or its products or the associated products
contributed to the Open Game License by the Contributor (g) “Use”, “Used”
or “Using” means to use, Distribute, copy, edit, format, modify, translate and
otherwise create Derivative Material of Open Game Content. (h) “You” or
“Your” means the licensee in terms of this agreement.
2. The License: This License applies to any Open Game Content that
contains a notice indicating that the Open Game Content may only be Used
under and in terms of this License. You must affix such a notice to any Open
Game Content that you Use. No terms may be added to or subtracted from this
License except as described by the License itself. No other terms or conditions
may be applied to any Open Game Content distributed using this License.
3. Offer and Acceptance: By Using the Open Game Content You indicate
Your acceptance of the terms of this License.
4. Grant and Consideration: In consideration for agreeing to use this License,
the Contributors grant You a perpetual, worldwide, royalty-free, non-exclusive
license with the exact terms of this License to Use, the Open Game Content.
5. Representation of Authority to Contribute: If You are contributing original
material as Open Game Content, You represent that Your Contributions are
Your original creation and/or You have sufficient rights to grant the rights
conveyed by this License.
6. Notice of License Copyright: You must update the COPYRIGHT
NOTICE portion of this License to include the exact text of the COPYRIGHT
NOTICE of any Open Game Content You are copying, modifying or
distributing, and You must add the title, the copyright date, and the copyright
holder’s name to the COPYRIGHT NOTICE of any original Open Game
Content you Distribute.
7. Use of Product Identity: You agree not to Use any Product Identity,
including as an indication as to compatibility, except as expressly licensed in
another, independent Agreement with the owner of each element of that
Product Identity. You agree not to indicate compatibility or co-adaptability with
any Trademark or Registered Trademark in conjunction with a work containing
Open Game Content except as expressly licensed in another, independent
Agreement with the owner of such Trademark or Registered Trademark. The
use of any Product Identity in Open Game Content does not constitute a
challenge to the ownership of that Product Identity. The owner of any Product
Identity used in Open Game Content shall retain all rights, title and interest in
and to that Product Identity.
8. Identification: If you distribute Open Game Content You must clearly
indicate which portions of the work that you are distributing are Open Game
Content. 9. Updating the License: Wizards or its designated Agents may publish
updated versions of this License. You may use any authorized version of this
License to copy, modify and distribute any Open Game Content originally
distributed under any version of this License.
10. Copy of this License: You MUST include a copy of this License with
every copy of the Open Game Content You Distribute.
11. Use of Contributor Credits: You may not market or advertise the Open
Game Content using the name of any Contributor unless You have written
permission from the Contributor to do so.
12. Inability to Comply: If it is impossible for You to comply with any of the
terms of this License with respect to some or all of the Open Game Content
due to statute, judicial order, or governmental regulation then You may not Use
any Open Game Material so affected.
13. Termination: This License will terminate automatically if You fail to
comply with all terms herein and fail to cure such breach within 30 days of
becoming aware of the breach. All sublicenses shall survive the termination of
this License.
14. Reformation: If any provision of this License is held to be unenforceable,
such provision shall be reformed only to the extent necessary to make it
enforceable.
15. COPYRIGHT NOTICE
Open Game License v 1.0a, © 2000, Wizards of the Coast, Inc.
System Reference Document. © 2000, Wizards of the Coast, Inc.; Authors
Jonathan Tweet, Monte Cook, Skip Williams, based on material by E. Gary
Gygax and Dave Arneson.
Pathfinder RPG Core Rulebook. © 2009, Paizo Publishing, LLC; Author:
Jason Bulmahn, based on material by Jonathan Tweet, Monte Cook, and Skip
Williams. Pathfinder RPG Bestiary, © 2009, Paizo Publishing, LLC; Author:
Jason Bulmahn, based on material by Jonathan Tweet, Monte Cook, and Skip
Williams.
Advanced Player’s Guide, © 2010, Paizo Publishing, LLC; Author: Jason
Bulmahn
Pathfinder RPG GameMastery Guide, © 2010, Paizo Publishing, LLC;
Author: Cam Banks, Wolfgang Buar, Jason Bulmahn, Jim Butler, Eric Cagle,
Graeme Davis, Adam Daigle, Joshua J. Frost, James Jacobs, Kenneth Hite,
Steven Kenson, Robin Laws, Tito Leati, Rob McCreary, Hal Maclean, Colin
McComb, Jason Nelson, David Noonan, Richard Pett, Rich Redman, Sean K
reynolds, F. Wesley Schneider, Amber Scorr, Doug Seacat, Mike Selinker, Lisa
Stevens, James L. Sutter, Russ Taylor, Penny Williams, Skip Williams, Teeuwynn
Woodruff.
Pathfinder Roleplaying Game Ultimate Magic, © 2011, Paizo Publishing,
LLC; Authors: Jason Bulmahn, Tim Hitchcock, Colin McComb, Rob McCreary,
Jason Nelson, Stephen Radney-MacFarland, Sean K Reynolds, Owen K.C.
Stephens, and Russ Taylor.
Pathfinder Roleplaying Game Ultimate Combat, © 2011, Paizo Publishing,
LLC; Authors: Dennis Baker, Jesse Benner, Benjamin Bruck, Jason Bulmahn,
Brian J. Cortijo, Jim Groves, Tim Hitchcock, Richard A. Hunt, Colin McComb,
Jason Nelson, Tom Phillips, Patrick Renie, Sean K Reynolds, and Russ Taylor.
The Book of Experimental Might, © 2008, Monte J. Cook. All rights reserved.
Tome of Horrors, © 2002, Necromancer Games, Inc.; Authors: Scott Greene,
with Clark Peterson, Erica Balsley, Kevin Baase, Casey Christofferson, Lance
Hawvermale, Travis Hawvermale, Patrick Lawinger, and Bill Webb; Based on
original content from TSR.
Unearthed Arcana, © 2004, Wizards of the Coast, Inc.; Authors Andy
Collins, Jesse Decker, David Noonan, Rich Redman
The Iconic Bestiary: Classics of Fantasy, © 2005, Lions Den Press; Author
Ari Marmell
Hyperconscious: Explorations in Psionics, © 2004, Bruce R Cordell. All
rights reserved.
If Thoughts Could Kill, © 2001–2004, Bruce R. Cordell. All rights reserved.
Mindscapes, © 2003–2004, Bruce R. Cordell. All rights reserved.
Unearthed Arcana, © 2004, Wizards of the Coast.
Mutants & Masterminds © 2002, Green Ronin Publishing.
Swords of Our Fathers, Copyright 2003, The Game Mechanics.
Modern System Reference Document, © 2002, Wizards of the Coast, Inc.;
Authors Bill Slavicsek, Jeff Grubb, Rich Redman, Charles Ryan, based on
material by Jonathan Tweet, Monte Cook, Skip Williams, Richard Baker,Peter
Adkison, Bruce R. Cordell, John Tynes, Andy Collins, and JD Wiker
Psionics Unleashed. Copyright 2010, Dreamscarred Press.
Path of War, © 2014, Dreamscarred Press."