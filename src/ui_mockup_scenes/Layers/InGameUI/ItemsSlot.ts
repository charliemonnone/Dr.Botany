import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../Wolfie2D/Scene/Scene";
import { UILayers, Fonts } from "../../Utils/Enums";
import * as Palette from "../../Utils/Colors";

export default class ItemsSlot {
	sprite: Sprite;
	text: Label;
	textBackdrop: Label;
	centerPos: Vec2;
    xOffset: number;
    yOffset: number;

	constructor(scene: Scene, centerPos: Vec2, xOffset: number) {

		this.centerPos = centerPos;
		this.sprite = scene.add.sprite("ui_square", UILayers.INGAME_UI)
        this.xOffset = xOffset;
        this.yOffset = 2*this.centerPos.y - this.sprite.size.y - 8;
        this.sprite.position.set(this.xOffset, this.yOffset)

        this.sprite.scale = new Vec2(0.5,0.5);
        this.textBackdrop = <Label>scene.add.uiElement(UIElementType.LABEL, UILayers.INGAME_UI, {position: new Vec2(this.xOffset+0.5, this.yOffset + 0.5), text:'x0'});
        this.textBackdrop.size.set(50,50)
        this.textBackdrop.font = Fonts.ROUND;
        this.textBackdrop.textColor = Palette.black();
        this.textBackdrop.fontSize = 16;
        this.textBackdrop.setHAlign('right');
        this.textBackdrop.setVAlign('bottom')

        this.text = <Label>scene.add.uiElement(UIElementType.LABEL, UILayers.INGAME_UI, {position: new Vec2(xOffset, this.yOffset), text:'x0'});
        this.text.size.set(50,50)
        this.text.font = Fonts.ROUND;
        this.text.textColor = Palette.white();
        this.text.fontSize = 16;
        this.text.setHAlign('right');
        this.text.setVAlign('bottom')
	}

	updateText(): void {
		// TODO: when player health changes, text has to update
	}
}