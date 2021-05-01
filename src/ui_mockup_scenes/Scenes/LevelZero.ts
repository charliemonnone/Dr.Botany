import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIEvents, UILayers, ButtonNames, InGame_Events, InGame_GUI_Events } from "../Utils/Enums";
import GameLevel from "./GameLevel";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import PlayerController from "../Controllers/PlayerController";
import EnemyController from "../Enemies/EnemyController";
import PauseScreenLayer from "../Layers/PauseScreenLayer";
import Input from "../../Wolfie2D/Input/Input";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Receiver from "../../Wolfie2D/Events/Receiver";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import Timer from "../../Wolfie2D/Timing/Timer";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import AnimatedDialog from "../Classes/AnimatedDialog";

export default class LevelZero extends GameLevel {

    collidables: OrthogonalTilemap;
    tilemapSize: Vec2;
    lookDirection: Vec2;
    time: number;
    enemyList: Array<AnimatedSprite> = [];
    enemyNameList: Array<string> = ["orange_mushroom", "slime_wip"];

    testLabel: AnimatedDialog;

    // TODO: move mood control into PlantController
    overallMood: number = 0; // -10 to 10 maybe? probably have to play with this
    mood: string = "normal";
    moodMin: number = -10;
    moodMax: number = 10;
    moodBarTimer: Timer = new Timer(6000, null, false);
    levelZeroReceiver: Receiver = new Receiver();

    overdrawTiles: Array<Sprite> = [];
    runTest: boolean;
    loadScene(): void {
        super.loadScene();
        this.load.tilemap("level_zero", "assets/tilemaps/tutorialLevel/tutorialLevel.json");
        this.load.image("box_top", "assets/misc/test_box.png")
        this.load.spritesheet("temp_enemy", "assets/enemies/temp_enemy.json")
        this.load.object("equipmentData", "assets/data/equipmentData.json");
        this.load.spritesheet("orange_mushroom", "assets/enemies/orange_mushroom.json")
        this.load.spritesheet("slime_wip", "assets/enemies/slime_wip.json")
    }

    unloadScene(): void {
        this.levelZeroReceiver.destroy();
    }

    startScene(): void {
        super.startScene()
        
        // this.moodBarTimer.start();
        this.time = Date.now();
        let tilemapLayers = this.add.tilemap("level_zero");
        for (let layer of tilemapLayers) {
            let obj = layer.getItems()[0];
            if (obj.isCollidable) {
                this.collidables = <OrthogonalTilemap>obj;
            }
        }
        this.tilemapSize = this.collidables.size;

        super.initPlayer(this.collidables.size);
        super.initPlant(this.collidables.size);
        super.initViewport(this.collidables.size);
        super.initGameUI(this.viewport.getHalfSize());
        super.initPauseMenu(this.viewport.getHalfSize());
        super.initReticle();
        super.initEquipment()
        this.viewport.follow(this.player);

        this.levelZeroReceiver.subscribe(InGame_Events.ANGRY_MOOD_REACHED);
        this.levelZeroReceiver.subscribe(InGame_Events.HAPPY_MOOD_REACHED);
        this.subscribeToEvents();
        for(let i = 0; i < 3; i++) {
            this.overdrawTiles.push(this.add.sprite('box_top', 'primary'));
            this.overdrawTiles[i].visible = false;
        }
        this.testLabel = new AnimatedDialog("I am a test string", this.player.position.clone(), this);

    }

    updateScene(deltaT: number) {
        super.updateScene(deltaT);

        if(!this.testLabel.finished && this.runTest) {
            this.testLabel.incrementText();
        }

        if (this.moodBarTimer.isStopped() && this.moodBarTimer.hasRun()) {
            this.moodBarTimer.reset();


            // this.resetHappyEffect();


            this.resetAngryEffect();

            this.mood = "normal";
        }
        
        if (Input.isKeyJustPressed("t")) {

            this.runTest = true;


        }


        if (Input.isKeyJustPressed("o")) {

            this.overallMood -= 1;
            console.log("Mood: -1, Current Mood stat: " + this.overallMood);
            // this.emitter.fireEvent(InGame_Events.MOOD_CHANGED, {moodChange: -1});
            if (this.overallMood <= this.moodMin) {
                this.overallMood = 0;
                this.emitter.fireEvent(InGame_Events.ANGRY_MOOD_REACHED);
            }


        }

        if (Input.isKeyJustPressed("p")) {

            this.overallMood += 1;
            console.log("Mood: +1, Current Mood stat: " + this.overallMood);
            // this.emitter.fireEvent(InGame_Events.MOOD_CHANGED, {moodChange: 1});
            if (this.overallMood >= this.moodMax) {
                this.overallMood = 0;
                this.emitter.fireEvent(InGame_Events.HAPPY_MOOD_REACHED);
            }


        }

        if (Input.isKeyJustPressed("l")) {

            this.addEnemy("slime_wip", new Vec2(this.tilemapSize.x/2, this.tilemapSize.y/2), { speed: 50 , player: this.player, health: 40, type: "Downer" }, 1.5)


        }

        // tween idea: pass an array of chars to tween manager s.t. each loop of the tween appends a letter




        // NOTE: Disabling this for now as it crashes if an enemy has died
        // if (Input.isKeyJustPressed("k")) {
        //     for (let enemy of this.enemyList) {
        //         if(enemy) {
        //             let enemyController = <EnemyController>enemy._ai;
        //             enemyController.damage(50);
        //         }

        //     }
        // }

        while (this.levelZeroReceiver.hasNextEvent()) {
            let event = this.levelZeroReceiver.getNextEvent();
// NOTE: OVERDRAW 
            // if(event.type === InGame_Events.DRAW_OVERLAP_TILE) {
            //     let positions = event.data.get('positions');
            //     for(let i = 0; i < positions.length; i++ ) {
            //         let entry = positions[i];
            //         this.overdrawTiles[i].position = entry;
            //         // if(this.overdrawTiles[i].position.x > this.tilemapSize.x &&
            //         //     this.overdrawTiles[i].position.y > this.tilemapSize.y) {
            //         //     this.overdrawTiles[i].position.x -= 1/4;
            //             this.overdrawTiles[i].position.y -= 1/4;

            //         // }
            //         // if(this.overdrawTiles[i].position.y > this.tilemapSize.y/2) {

            //         // }
                    
            //         this.overdrawTiles[i].visible = true;
            //     }
            // }

            if (event.type === InGame_Events.ANGRY_MOOD_REACHED) {
                this.mood = "angry";
                if (this.moodBarTimer.isActive() === false) {
                    this.moodBarTimer.start();
                    this.increaseEnemyStrength();
                }

                // this.levelZeroReceiver.unsubscribe(InGame_Events.ANGRY_MOOD_REACHED)

            }

            if (event.type === InGame_Events.HAPPY_MOOD_REACHED) {
                this.mood = "happy";
                if (this.moodBarTimer.isActive() === false) {
                    this.moodBarTimer.start();
                    console.log("Happy mood reached, have to implement faster enemies' speed behavior")
                    // this.increaseEnemySpeed(); // increase speed buggy 
                }
                // this.levelZeroReceiver.unsubscribe(InGame_Events.HAPPY_MOOD_REACHED)
            }

            if (event.type === InGame_Events.ADD_TO_MOOD) {
                let type = event.data.get('type');
                let count = event.data.get('count');
                count *= type;
                this.overallMood += count;
                MathUtils.clamp(this.overallMood, this.moodMin, this.moodMax);
                this.emitter.fireEvent(InGame_Events.MOOD_CHANGED, { moodChange: count });
                if (this.overallMood <= this.moodMin) {
                    this.overallMood = 0;
                    this.emitter.fireEvent(InGame_Events.ANGRY_MOOD_REACHED);
                }
                if (this.overallMood >= this.moodMax) {
                    this.overallMood = 0;
                    this.emitter.fireEvent(InGame_Events.HAPPY_MOOD_REACHED);
                }
            }


        }


        // We want to randomly select the position, and time and maybe some counter ( max enemies in the map ) currently spawning every 5 seconds
        // if (Date.now() - this.time > 5000) {
        //     let randomInt = Math.floor(Math.random() * this.enemyNameList.length);
        //     let randomX = Math.floor(Math.random() * (this.tilemapSize.x - 100) + 50);
        //     let randomY = Math.floor(Math.random() * (this.tilemapSize.y - 100) + 50);
        //     console.log("5 seconds passed, Spawning new enemy");
        //     if (this.enemyNameList[randomInt] === "orange_mushroom") {
        //         let randomScale = Math.random() * (2 - 1) + 1;
        //         this.addEnemy("orange_mushroom", new Vec2(randomX, randomY), { speed: 90 * (1 / randomScale), player: this.player, health: 50, type: "Upper" }, 1);
        //     }
        //     else if (this.enemyNameList[randomInt] === "slime_wip") {
        //         let randomScale = Math.random() * (2 - 0.5) + 0.5;

        //         this.addEnemy("slime_wip", new Vec2(randomX, randomY), { speed: 80 * (1 / randomScale), player: this.player, health: 40, type: "Downer" }, 1.5)
        //     }
        //     this.time = Date.now();
        // }

    }




    protected subscribeToEvents() {
        this.levelZeroReceiver.subscribe([
            InGame_Events.PLAYER_ENEMY_COLLISION,
            InGame_Events.PLAYER_DIED,
            InGame_Events.ENEMY_DIED,
            InGame_Events.ADD_TO_MOOD,
            InGame_Events.DRAW_OVERLAP_TILE

        ]);
    }

    protected addEnemy(spriteKey: string, tilePos: Vec2, aiOptions: Record<string, any>, scale: number): void {
        let enemy = this.add.animatedSprite(spriteKey, "primary");
        enemy.position.set(tilePos.x, tilePos.y);
        enemy.scale.set(scale, scale);
        let collisionShape = enemy.size;
        // This has to be touched
        // this.inRelativeCoordinates(this.collisionShape.center), this.collisionShape.halfSize.scaled(this.scene.getViewScale())
        enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(((collisionShape.x / 2) - 2) * scale, (collisionShape.y / 2 - collisionShape.y / 3) * scale)));

        enemy.colliderOffset.set(0, (collisionShape.y / 3) * scale);
        // play with this // maybe add a condition for each enemy

        enemy.addAI(EnemyController, aiOptions);
        enemy.setGroup("enemies");
        enemy.setTrigger("player", InGame_Events.PLAYER_ENEMY_COLLISION, null);
        enemy.setTrigger("projectiles", InGame_Events.PROJECTILE_HIT_ENEMY, null)

        this.enemyList.push(enemy);
    }
    // TODO: make it so that new created enemies have doubled speed, because when the timer is done, newly created enemies with normal speed gets slower than normal
    protected increaseEnemySpeed(): void {
        for (let enemy of this.enemyList) {
            let enemyController = <EnemyController>enemy._ai;
            enemyController.increaseSpeed();
        }
    }

    protected increaseEnemyStrength(): void {
        let playerController = <PlayerController>this.player._ai;
        playerController.increaseDamageTaken(10);
    }

    protected resetAngryEffect(): void {
        let playerController = <PlayerController>this.player._ai;
        playerController.increaseDamageTaken(5);
    }

    protected resetHappyEffect(): void {
        for (let enemy of this.enemyList) {
            let enemyController = <EnemyController>enemy._ai;
            enemyController.decreaseSpeed();
        }
    }

}