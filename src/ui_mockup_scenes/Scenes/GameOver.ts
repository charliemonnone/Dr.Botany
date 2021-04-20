// import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
// import Input from "../../Wolfie2D/Input/Input";
// import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
// import Layer from "../../Wolfie2D/Scene/Layer";
// import Scene from "../../Wolfie2D/Scene/Scene";
// import { UIEvents, UILayers, WindowEvents } from "../Utils/Enums";
// import { MainMenuLayer } from "../Layers/MainMenu/MainMenuLayer";
// import { BackgroundLayer } from "../Layers/MainMenu/BackgroundLayer";
// import { ControlsLayer } from "../Layers/MainMenu/ControlsLayer";
// import { HelpLayer } from "../Layers/MainMenu/HelpLayer";
// import { LevelSelectLayer } from "../Layers/MainMenu/LevelSelectLayer";
// import { SpringLevelLayer } from "../Layers/MainMenu/SpringLevelLayer";
// import { SummerLevelLayer } from "../Layers/MainMenu/SummerLevelLayer";
// import { FallLevelLayer } from "../Layers/MainMenu/FallLevelLayer";
// import { WinterLevelLayer } from "../Layers/MainMenu/WinterLevelLayer";
// import { OptionsLayer } from "../Layers/MainMenu/OptionsLayer";
// import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
// import LevelZero from "../Scenes/LevelZero";
// import GameButton from "../Classes/GameButton";
// import BackButton from "../Classes/BackButton";
// import InGameUI from "../Layers/InGameUI/InGameUILayer";

// export default class GameOver extends Scene {
//     mainMenuLayer: MainMenuLayer;
//     backgroundLayer: BackgroundLayer;
//     controlsLayer: ControlsLayer;
//     helpLayer: HelpLayer;
//     levelSelectLayer: LevelSelectLayer;
//     springLevelLayer: SpringLevelLayer;
//     summerLevelLayer: SummerLevelLayer;
//     fallLevelLayer: FallLevelLayer;
//     winterLevelLayer: WinterLevelLayer;
//     optionsLayer: OptionsLayer;
//     cursorLayer: Layer;
//     cursorLayer2: Layer;

//     cursor: Sprite;
//     cursor2: Sprite;

//     center: Vec2 = this.viewport.getCenter();
//     zoomLevel: number;
//     scrollSpeed: number = 100;
//     defaultFont: string = 'Round';
//     viewPortWidth: number = this.viewport.getHalfSize().x * 2;

//     backButton: BackButton;
//     selectLevelBack: GameButton;



//     loadScene(): void {
//         this.load.image("logo", "assets/misc/logo.png");
//         this.load.image("background", "assets/misc/canvas.png");
//         this.load.image("temp_cursor", "assets/misc/cursor.png");
//         this.load.image("temp_button", "assets/ui_art/button.png");
//         this.load.image("cursor_clicked", "assets/misc/cursor_clicked.png");
//         this.load.audio("temp_music", "assets/music/temp.mp3");
//     }

//     setDetectDocumentClick(toggle: boolean): void {
        
//         // if (toggle) document.onclick = () => { this.emitter.fireEvent(UIEvents.TRANSITION_SPLASH_SCREEN); }
//         // else document.onclick = () => { };
//     }


//     startScene(): void {
//         // this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key : "temp_music", loop: true, holdReference: true});
//         window.onresize = (e: UIEvent) => {this.emitter.fireEvent(WindowEvents.RESIZED, {eventObject: e})};
        

//         this.optionsLayer = new OptionsLayer(this, this.center, this.defaultFont);


//         this.cursorLayer = this.addUILayer(UILayers.CURSOR);
//         this.cursor = this.add.sprite("temp_cursor", UILayers.CURSOR);
        
//         let mousePos = Input.getMousePosition();
//         this.cursor.scale = new Vec2(0.8, 0.8)
//         // this.cursor.rotation = 3.14
//         this.cursor.visible = false;

        
//         this.cursor2 = this.add.sprite("cursor_clicked", UILayers.CURSOR);
//         this.cursor2.scale = new Vec2(0.8, 0.8)
//         this.cursor2.visible = false;
        

//         this.backButton = new BackButton(this);
//         // this.backButton = this.initBackButton();

//         this.backgroundLayer.playSplashScreen();
//         this.setDetectDocumentClick(true);


//         // Subscribe to all events once we nail down the exact events needed we could probably replace this 
//         // loop with this.receiver.subscribe(...) calls
//         for (let events in UIEvents) {
//             let event: UIEvents = UIEvents[events as keyof typeof UIEvents];
//             this.receiver.subscribe(event);
//         }
//         this.receiver.subscribe(GameEventType.MOUSE_MOVE);
//         this.receiver.subscribe(WindowEvents.RESIZED);
//         this.receiver.subscribe(GameEventType.MOUSE_DOWN);
//         this.receiver.subscribe(GameEventType.MOUSE_UP);
        
//     }

//     setVisibleLayer(layerName: string): void {
//         this.uiLayers.forEach((key: string) => {
//             // don't want to hide the background cause it has the logo, and putting it on a reg. layer breaks tween
//             if (key !== layerName && key !== UILayers.BACKGROUND && key !== UILayers.CURSOR) {
//                 this.uiLayers.get(key).setHidden(true);
//             }
//             else if (key === layerName) {
//                 this.uiLayers.get(key).setHidden(false);
//             }
//         });

//     }

//     updateScene(deltaT: number) {
//         let mousePos = Input.getGlobalMousePosition();
//         this.cursor.position.set(mousePos.x, mousePos.y);
//         this.cursor2.position.set(mousePos.x, mousePos.y);
        
//         this.backgroundLayer.bg.position.x += this.scrollSpeed * deltaT;
//         this.backgroundLayer.bgCopy.position.x += this.scrollSpeed * deltaT;
//         if(this.backgroundLayer.bg.position.x > this.backgroundLayer.bg.size.x) {
//             this.backgroundLayer.bg.position.x = -this.backgroundLayer.bg.size.x/2;

//         }

//         if(this.backgroundLayer.bgCopy.position.x > this.backgroundLayer.bg.size.x) {
//             this.backgroundLayer.bgCopy.position.x = -this.backgroundLayer.bg.size.x/2;

//         }
 
//         while (this.receiver.hasNextEvent()) {
//             let event = this.receiver.getNextEvent();

//             // initially hide the mouse until user input, cursor isnt seen in upper corner 
//             if (event.type === GameEventType.MOUSE_MOVE) {
//                 this.cursor.visible = true;
//                 this.receiver.unsubscribe(GameEventType.MOUSE_MOVE);
//             }
//         }
//     }
// }