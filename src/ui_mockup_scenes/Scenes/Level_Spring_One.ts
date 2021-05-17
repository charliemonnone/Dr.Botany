import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIEvents, InGame_Events, Scenes } from "../Utils/Enums";
import GameLevel from "./GameLevel";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Timer from "../../Wolfie2D/Timing/Timer";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import GrowthManager from "../GameSystems/GrowthManager";
import * as Tweens  from "../Utils/Tweens";

export default class Level_Spring_One extends GameLevel {

    collidables: OrthogonalTilemap;
    tilemapSize: Vec2;
    lookDirection: Vec2;
    time: number;
    maxEnemyNumber: number = 10;
    moodEffectTimer: Timer = new Timer(10000, null, false);
    moodBarTimer: Timer = new Timer(6000, null, false);
    levelReceiver: Receiver = new Receiver();
    currentLevel: string = Scenes.LEVEL_SPRING_ONE;

    pauseExecution: boolean = false;
    loadScene(): void {
        super.loadScene();
        this.load.tilemap("level_spring_one", "assets/tilemaps/SpringLevel/springLevel.json");
        this.load.audio("background_music", "assets/music/in_game_music.mp3")
    }

	unloadScene(): void {
        super.unloadScene();
        this.levelReceiver.destroy();
    }

    startScene(): void {
        super.startScene()
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "background_music", loop: true, holdReference: true });
        
        this.time = Date.now();
        let tilemapLayers = this.add.tilemap("level_spring_one");
        for (let layer of tilemapLayers) {
            let obj = layer.getItems()[0];
            if (obj.isCollidable) {
                this.collidables = <OrthogonalTilemap>obj;
            }
        }

        this.tilemapSize = this.collidables.size;


        //INITIALIZE PLANT BEFORE PLAYER WHEN MAKING YOUR LEVELS 
        super.initPlant(this.collidables.size);
        super.initPlayer(this.collidables.size);
        super.initViewport(this.collidables.size);
        super.initGameUI(this.viewport.getHalfSize());
        super.initPauseMenu(this.viewport.getHalfSize());
        super.initGameOverScreen(this.viewport.getHalfSize());
        super.initSpawnerTimer(3000);
        this.viewport.follow(this.player);

        this.levelReceiver.subscribe(InGame_Events.ANGRY_MOOD_REACHED);
        this.levelReceiver.subscribe(InGame_Events.HAPPY_MOOD_REACHED);
        this.subscribeToEvents();
        


        //we initialized supportmanager in gamelevel but it starts with 0 healthpacks and 0 ammopacks 
        //we use addHealthPacks and addAmmoPacks to add how many we want for each level. in tutorial level will have 5 each
        this.supportManager.addHealthPacks(10); 
        this.supportManager.addAmmoPacks(10);

        this.growthManager = new GrowthManager(this);
        this.spawnerTimer.start();

    }

    updateScene(deltaT: number) {
        super.updateScene(deltaT);
        this.growthManager.update(deltaT);
        if(this.pauseExecution && this.spawnerTimer.isActive()) {
            this.spawnerTimer.pause();
            console.log(this.spawnerTimer.toString());
        }
        else if(!this.pauseExecution && this.spawnerTimer.isPaused()) {
            this.spawnerTimer.continue();
        }
        if(this.spawnerTimer.isStopped() && this.maxEnemyNumber >= this.enemyManager.activePool.length && !this.pauseExecution) {
            this.spawnerTimer.start();
            this.enemyManager.spawnEnemy(this.player, this.plant);
        }


		else if(this.pauseExecution && this.moodEffectTimer.isActive()) {
            this.moodEffectTimer.pause();
        }
        else if(!this.pauseExecution && this.moodEffectTimer.isPaused()) {
            this.moodEffectTimer.continue();
        }

        
        if(this.moodEffectTimer.isStopped() && this.moodEffectTimer.hasRun()) {
            this.moodEffectTimer.reset();
            this.plant.animation.play("EH");
            this.moodManager.resetEffect(this);
        }



        while (this.levelReceiver.hasNextEvent()) {
            let event = this.levelReceiver.getNextEvent();

			if (event.type === InGame_Events.ANGRY_MOOD_REACHED) {
                this.moodEffectTimer.start();
                this.plant.animation.play("ANGRY", true);
                this.moodManager.applyEffect(this,"downer", Math.floor(Math.random() * this.moodManager.prototypesAngry.length), this.player.position);
                
            }

            if (event.type === InGame_Events.HAPPY_MOOD_REACHED) {
                this.moodEffectTimer.start();
                this.plant.animation.play("HAPPY", true);
                this.moodManager.applyEffect(this,"upper", Math.floor(Math.random() * this.moodManager.prototypesHappy.length), this.player.position);
                
            }
            

            // We gotta check this with each levels
            if (event.type === UIEvents.CLICKED_RESTART) {
                this.nextLevel = this.currentLevel;
                this.screenWipe.imageOffset = new Vec2(0, 0);
                this.screenWipe.scale = new Vec2(2,1)
                this.screenWipe.position.set(2*this.screenWipe.size.x, this.screenWipe.size.y/2);
                this.screenWipe.tweens.add("levelTransition", Tweens.slideLeft(this.screenWipe.position.x, 0, 500, UIEvents.TRANSITION_LEVEL));
                this.screenWipe.tweens.play("levelTransition");
            }
            


        }
   

    }

    protected subscribeToEvents() {
        this.levelReceiver.subscribe([
            InGame_Events.PLAYER_ENEMY_COLLISION,
            InGame_Events.PLAYER_DIED,
            InGame_Events.ENEMY_DIED,
            InGame_Events.UPDATE_MOOD,
            InGame_Events.TOGGLE_PAUSE,
            UIEvents.CLICKED_RESTART

        ]);
    }

}