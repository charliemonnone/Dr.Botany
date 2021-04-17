import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Item from "./Item";
import MaterialType from "./MaterialTypes/MaterialType";

export default class Material extends Item {
    /** The type of this weapon */
    type: MaterialType;

    /** A list of assets this material needs to be animated */
    assets: Array<any>;

    /** An event emitter to hook into the EventQueue */
    emitter: Emitter

    /** The cooldown timer for this weapon's use */
    cooldownTimer: Timer;

    constructor(sprite: Sprite, type: MaterialType){
        super(sprite);

        // Set the material type
        this.type = type;

        // Keep a reference to the sprite of this weapon
        this.sprite = sprite;

        // Rely on the weapon type to create any necessary assets
        this.assets = this.type.createRequiredAssets(this.sprite.getScene());

        // Create an event emitter
        this.emitter = new Emitter();

    }

    // @override
    /**
     * Uses this weapon in the specified direction.
     * This only works if the cooldown timer has ended
     */
    use(user: GameNode, userType: string, direction: Vec2): boolean {
        // If the cooldown timer is still running, we can't use the weapon
        if(!this.cooldownTimer.isStopped()){
            return false;
        }

        // Do a type specific weapon animation
        this.type.doAnimation(user, direction, ...this.assets);

        return true;
    }


}