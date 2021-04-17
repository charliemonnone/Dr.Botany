import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Slider from "../../Wolfie2D/Nodes/UIElements/Slider";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import InGameUILayer from "../Layers/InGameUI/InGameUILayer"
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import UILayer from "../../Wolfie2D/Scene/Layers/UILayer";
import { UIEvents, UILayers, ButtonNames, InGameUILayers, WindowEvents, InGame_Events } from "../Utils/Enums";
import PauseScreenLayer from "../Layers/PauseScreenLayer";
import Game from "../../Wolfie2D/Loop/Game";
import EnemyController from "../Enemies/EnemyController"
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import PlayerController from "../Controllers/PlayerController";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import * as Tweens from "../Utils/Tweens";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class GameLevel extends Scene {
    defaultFont: string = 'Round';
    screenCenter: Vec2; 
    pauseScreenToggle: boolean = true; 

    //initialize layers 
    primary:        Layer; 
    background:     Layer; 
    cursorLayer:    Layer; 
    inGameUILayer:  InGameUILayer;
    pauseScreenLayer: PauseScreenLayer; 

    reticle: Sprite;
    player: Sprite;
    plant: Sprite;
    shadow: Sprite;
    swing: Sprite
    defaultEquip: Sprite;
    shadowOffset: Vec2 = new Vec2(0, 10);
    playerLookDirection: Vec2 = new Vec2(0,0);
    doingSwing: boolean = false;
    swingDir: number = -1; 

    loadScene(): void {
        this.load.image("temp_cursor", "assets/misc/cursor.png");
        this.load.image("reticle", "assets/misc/reticle.png");
        this.load.image("temp_button", "assets/ui_art/button.png");
        this.load.image("ui_square", "assets/ui_art/ui_square.png");
        this.load.image("ui_circle", "assets/ui_art/ui_circle.png");
        this.load.image("cursor_clicked", "assets/misc/cursor_clicked.png")
        this.load.image("healthbar", "assets/ui_art/health_bar_wip.png")
        this.load.image("growthbar", "assets/ui_art/growth_bar_wip.png")
        this.load.image("moodbar", "assets/ui_art/mood_bar_wip.png")

        this.load.image("player", "assets/player/dr_botany_wip.png");
        this.load.image("shadow", "assets/player/shadow_sprite.png");
        this.load.image("shovel", "assets/weapons/shovel.png");
        this.load.spritesheet("swing_sprite", "assets/weapons/swing_sprite.json" )
        this.load.spritesheet("plant", "assets/plant/plant.json" )

    }

    startScene(): void {
        this.receiver.subscribe(GameEventType.MOUSE_DOWN);
        this.receiver.subscribe(GameEventType.MOUSE_UP);
        this.receiver.subscribe(GameEventType.KEY_DOWN);
        this.receiver.subscribe(InGame_Events.LEVEL_LOADED);
        this.receiver.subscribe(InGame_Events.DOING_SWING);
        this.receiver.subscribe(InGame_Events.FINISHED_SWING);
        this.receiver.subscribe(InGame_Events.START_SWING);
        this.addLayer("primary", 10);
        this.addLayer("secondary", 9);

    }

    updateScene(deltaT: number){
        super.updateScene(deltaT);
        // update positions and rotations
        let mousePos = Input.getMousePosition();
        let rotateTo = Input.getGlobalMousePosition();
        this.reticle.position.set(mousePos.x, mousePos.y);

        this.shadow.position = this.player.position.clone();
        this.shadow.position.y += this.shadowOffset.y;
        this.defaultEquip.position = this.player.position.clone();
        this.playerLookDirection = this.defaultEquip.position.dirTo(rotateTo);
        if(mousePos.x > this.defaultEquip.position.x) {
            this.defaultEquip.rotation = -Vec2.UP.angleToCCW(this.playerLookDirection);
        }
        else {
            this.defaultEquip.rotation = -Vec2.UP.angleToCCW(this.playerLookDirection);

        }
        this.defaultEquip.position.add(new Vec2(-8 * this.playerLookDirection.x,-8 *this.playerLookDirection.y));
            
        
        if(Input.isKeyJustPressed("p")){
            if(this.pauseScreenLayer !== undefined) {
                if(this.pauseScreenToggle){
                    for (let button of this.pauseScreenLayer.menuButtons) {
                        //button.label.tweens.play('slideXFadeIn')
                        //button.sprite.tweens.play('spriteSlideXFadeIn')
                        button.label.textColor.a = 1; 
                    }
                    this.pauseScreenToggle = false; 
                }
                else{
                    for (let button of this.pauseScreenLayer.menuButtons) {
                        //button.label.tweens.play('slideXFadeOut')
                        //button.sprite.tweens.play('spriteSlideXFadeOut')
                        button.label.textColor.a = 0; 
                    }
                    this.pauseScreenToggle = true; 
                }
            }
            

        }

        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            if(event.type === GameEventType.MOUSE_DOWN && !this.doingSwing) {
                // this.swing.position = new Vec2(this.player.position.x + 30*this.playerLookDirection.x,this.player.position.y + 30*this.playerLookDirection.y);
                this.emitter.fireEvent(InGame_Events.START_SWING);
                this.doingSwing = true;
            }

            if(event.type === WindowEvents.RESIZED) {
            }

            if(event.type === InGame_Events.LEVEL_LOADED) {
                this.screenCenter = this.viewport.getHalfSize();
            }

            // TODO: Move these swing related things into PlayerController/a player class-thing
            if(event.type === InGame_Events.START_SWING) {
                // NOTE: Right now the swing cooldown is tied to the duration of the swing tween
                // this is because the tween would kind of bug outit you didnt let it finish
                // a fix might be to have two copies of the swing tween and swap between them
                // for alternating swing, which should give each enough time to finish
                this.swing.position.set(this.player.position.x + (20*this.playerLookDirection.x), 
                    this.player.position.y+ (20*this.playerLookDirection.y));

                this.emitter.fireEvent(InGame_Events.DOING_SWING);
                this.defaultEquip.tweens.add('swingdown', Tweens.swing(this.defaultEquip, this.swingDir))
                this.defaultEquip.tweens.play('swingdown');
                this.swing.rotation = -this.defaultEquip.rotation;
                this.swing.visible = true;
                (<AnimatedSprite>this.swing).animation.play("SWING");

                this.viewport.doScreenShake(this.playerLookDirection);
            }

            if(event.type === InGame_Events.DOING_SWING) {
                this.swing.tweens.add('fadeOut', Tweens.spriteFadeOut(this.swing.position, this.playerLookDirection))
                this.swing.tweens.play('fadeOut');
                // (<AnimatedSprite>this.swing).animation.stop()
            }

            if(event.type === InGame_Events.FINISHED_SWING) {
                if(Input.isMouseJustPressed()) {
                    this.swingDir *= -1;
                    this.emitter.fireEvent(InGame_Events.START_SWING);
                } 
                else {
                    this.swingDir *= -1;
                    this.doingSwing = false;
                } 
            }

        }
    }

    initPlant(mapSize: Vec2): void {
        this.plant = this.add.animatedSprite('plant', "primary");
        this.plant.position.set(mapSize.x/2, mapSize.y/4);
        this.plant.scale.set(0.2, 0.2);
        (<AnimatedSprite>this.plant).animation.play("EH")
        // This has to be touched
        // this.plant.addPhysics(new AABB(Vec2.ZERO), new Vec2(7, 2));
        // this.plant.colliderOffset.set(0,10);
        // play with this // maybe add a condition for each enemy
        
        // TODO: define a specific physics group whose collider is half the size of the sprite for collision objects that the player can go behind
        // this.plant.setGroup("ground");
        // this.plant.setTrigger("player", InGame_Events.PLAYER_ENEMY_COLLISION, null);
    }   

    initPlayer(mapSize: Vec2): void {


        this.player = this.add.sprite("player", "primary");

        this.player.scale = new Vec2(1.5, 1.5);
        this.player.position.set(mapSize.x/2,mapSize.y/2);

        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(7, 2)));
        this.player.colliderOffset.set(0, 10);
        this.player.addAI(PlayerController, {tilemap: "Main", speed: 150,});

        // Add triggers on colliding with coins or coinBlocks
        this.player.setGroup("player");

        this.shadow = this.add.sprite("shadow", "secondary");
        this.shadow.position.set(this.player.position.x, this.player.position.y + this.shadowOffset.y);
        this.shadow.scale = new Vec2(0.7, 0.7);


        this.defaultEquip = this.add.sprite("shovel", "secondary");
        this.defaultEquip.position.set(mapSize.x/2,mapSize.y/2);
        this.defaultEquip.invertY = true
        // this.defaultEquip.rotation = 3.14 / 4;
        // this.defaultEquip.addPhysics(new Circle(Vec2.ZERO, 8));
        // this.defaultEquip.setGroup("equipment");

        this.swing = this.add.animatedSprite("swing_sprite", "primary");

        this.swing.position.set(this.player.position.x, this.player.position.y);
        this.swing.visible = false;

        // this.swing.setGroup("equipment");
        // this.swing.setTrigger("enemy", InGame_Events.EQUIPMENT_ENEMY_COLLISION, null);

    }

    initInventory(): void {

    }

    initEquipment(): void {

    }

    initGameUI(halfsize: Vec2): void { 
        this.inGameUILayer = new InGameUILayer(this, halfsize, this.defaultFont, this.viewport);

    }

    initViewport(mapSize: Vec2): void {
        let origin = this.viewport.getOrigin();
        this.viewport.setBounds(origin.x, origin.y, mapSize.x, mapSize.y+24);
        // NOTE: Viewport can only see 1/4 of full 1920x1080p canvas
        this.viewport.setSize(480, 270);
    }

    initReticle(): void { 
        this.cursorLayer = this.addUILayer(UILayers.CURSOR);
        this.reticle = this.add.sprite("reticle", UILayers.CURSOR);
        this.reticle.scale = new Vec2(0.8, 0.8);

    }
}