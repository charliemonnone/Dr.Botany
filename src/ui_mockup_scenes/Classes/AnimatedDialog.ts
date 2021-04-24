import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import { InGameUILayers } from "../Utils/Enums";

export default class AnimatedDialog {
	fullString: string = '';
	fullLen: number;
	currentString: string = '';
	intervalTime: number = 4; // ms
	elapsedTime: number = 0 ;
	label: Label;
	position: Vec2;
	scene: Scene;
	finished: boolean = false;
	// note make intervalTime a constructor arg to have variable wait time, so that sentences are fast and then maybe ellipses are slower
	constructor(fullString: string, position: Vec2, scene: Scene) {
		this.fullString = fullString;
		this.fullLen = fullString.length;
		this.currentString = fullString.substring(0,1);
		this.position = position;
		this.scene = scene;
		this.label = <Label>this.scene.add.uiElement(UIElementType.LABEL, InGameUILayers.ANNOUNCEMENT_TEXT, {position: new Vec2(position.x, position.y-16), text: this.currentString});
	}

	// have to schedule this using the update loop
	// when 
	incrementText(): void {
		// emit textwrite sfx
		if(this.elapsedTime % this.intervalTime === 0) {
			let strlen = this.currentString.length;
			// dirty fix for double first char
			if(strlen === 1) strlen++;
			let nextChar = this.fullString.substring(strlen-1, strlen);
			this.currentString = this.currentString + nextChar;
			this.label.text = this.currentString;
			if(strlen === this.fullLen) {
				// maybe a better way would be to subscribe to an event while an animated dialog is playing and then unsub when finished
				this.finished = true;
				this.elapsedTime = 0;
			}
		}
		
		this.elapsedTime ++;
	}


}