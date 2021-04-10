import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import UILayer from "../../Wolfie2D/Scene/Layers/UILayer";
import Scene from "../../Wolfie2D/Scene/Scene";
import { UILayers, ButtonNames } from "../Utils/Enums";
import * as Palette from "../Utils/Colors";
import * as Tweens from "../Utils/Tweens";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";


export class MainMenuLayer {
	layer: UILayer;
	position: Vec2;
	scene: Scene;
	sprite: Sprite;
	menuButtons: Array<UIElement> = [];
	constructor(scene: Scene, position: Vec2) {
		this.scene = scene;
		this.position = position.clone();
		this.layer = scene.addUILayer(UILayers.MAIN_MENU);
		this.layer.setHidden(true);
		this.initButtons();
		
	}


	initButtons(): void {
		let xOffset = 200
		let startX = this.position.x - xOffset;
		let startY = this.position.y - xOffset;
		let endX = this.position.x;
		let animationDelay = 0;
		for (let name in ButtonNames) {
			let myName: ButtonNames = ButtonNames[name as keyof typeof ButtonNames];

			// this.sprite = this.scene.add.sprite("temp_button_art", UILayers.MAIN_MENU);
			// this.sprite.position.set(this.position.x, this.position.y);
			// this.sprite.scale = new Vec2(6,3)

			let label = <Label>this.scene.add.uiElement(UIElementType.LABEL, UILayers.MAIN_MENU, { position: new Vec2(startX, startY), text: `${myName}`, size: 24 });
			label.size.set(200, 100);
			label.borderWidth = 0;
			label.borderRadius = 0;
			label.font = "PixelSimple";
			label.backgroundColor = Palette.logoColor();
			label.backgroundColor.a = 0;
			label.textColor.a = 0;
			label.borderColor = Palette.transparent();
			label.onClickEventId = 'CLICKED_' + name;

			label.tweens.add('slideXFadeIn', Tweens.slideXFadeIn(startX, startY, animationDelay, xOffset));
			label.tweens.add('slideUpLeft', Tweens.slideUpLeft(endX, startY));
			label.tweens.add('slideDownRight', Tweens.slideDownRight(endX, startY));
			label.tweens.add('highlight', Tweens.changeColor(label.backgroundColor, Palette.highlight()));
			label.tweens.add('unhighlight', Tweens.changeColor(Palette.highlight(), label.backgroundColor));

			label.onFirstEnter = () => {
				label.tweens.play('slideUpLeft');
				label.tweens.play('highlight');
			}
			label.onLeave = () => {
				label.tweens.play('slideDownRight');
				label.tweens.play('unhighlight');
			}
			animationDelay += 30;
			startY += 100;
			this.menuButtons.push(label);
		}
	}
}