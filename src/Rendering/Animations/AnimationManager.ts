import Map from "../../DataTypes/Map";
import Emitter from "../../Events/Emitter";
import CanvasNode from "../../Nodes/CanvasNode";
import { AnimationData, AnimationState } from "./AnimationTypes";

export default class AnimationManager {
    /** The owner of this animation manager */
    protected owner: CanvasNode;
    
    /** The current animation state of this sprite */
    protected animationState: AnimationState;

    /** The name of the current animation of this sprite */
    protected currentAnimation: string;

    /** The current frame of this animation */
    protected currentFrame: number;

    /** The progress of the current animation through the current frame */
    protected frameProgress: number;

    /** Whether the current animation is looping or not */
    protected loop: boolean;

    /** The map of animations */
    protected animations: Map<AnimationData>;

    /** The name of the event (if any) to send when the current animation stops playing. */
    protected onEndEvent: string;

    /** The event emitter for this animation manager */
    protected emitter: Emitter;

    /** A queued animation */
    protected pendingAnimation: string;

    /** The loop status of a pending animation */
    protected pendingLoop: boolean;

    /** The onEnd event of a pending animation */
    protected pendingOnEnd: string;

    constructor(){
        this.animationState = AnimationState.STOPPED;
        this.currentAnimation = "";
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.loop = false;
        this.animations = new Map();
        this.onEndEvent = null;
        this.emitter = new Emitter();
    }

    /**
     * Add an animation to this sprite
     * @param key The unique key of the animation
     * @param animation The animation data
     */
    add(key: string, animation: AnimationData): void {
        this.animations.add(key, animation);
    }

    /** Gets the index specified by the current animation and current frame */
    getIndex(): number {
        if(this.animations.has(this.currentAnimation)){
            return this.animations.get(this.currentAnimation).frames[this.currentFrame].index;
        } else {
            // No current animation, warn the user
            console.warn("Animation index was requested, but the current animation was invalid");
            return 0;
        }
    }

    getIndexAndAdvanceAnimation(): number {
        // If we aren't playing, we won't be advancing the animation
        if(!(this.animationState === AnimationState.PLAYING)){
            return this.getIndex();
        }

        if(this.animations.has(this.currentAnimation)){
            let currentAnimation = this.animations.get(this.currentAnimation);
            let index = currentAnimation.frames[this.currentFrame].index;

            // Advance the animation
            this.frameProgress += 1;
            if(this.frameProgress >= currentAnimation.frames[this.currentFrame].duration){
                // We have been on this frame for its whole duration, go to the next one
                this.frameProgress = 0;
                this.currentFrame += 1;

                if(this.currentFrame >= currentAnimation.frames.length){
                    // We have reached the end of this animation
                    if(this.loop){
                        this.currentFrame = 0;
                        this.frameProgress = 0;
                    } else {
                        this.endCurrentAnimation();
                    }
                }
            }

            // Return the current index
            return index;
        } else {
            // No current animation, can't advance. Warn the user
            console.warn("Animation index and advance was requested, but the current animation was invalid");
            return 0;
        }
    }

    protected endCurrentAnimation(): void {
        this.currentFrame = 0;
        this.animationState = AnimationState.STOPPED;

        if(this.onEndEvent !== null){
            this.emitter.fireEvent(this.onEndEvent, {owner: this.owner, animation: this.currentAnimation});
        }

        // If there is a pending animation, play it
        if(this.pendingAnimation !== null){
            this.play(this.pendingAnimation, this.pendingLoop, this.pendingOnEnd);
        }
    }

    /**
     * Plays the specified animation
     * @param animation The name of the animation to play
     * @param loop Whether or not to loop the animation. False by default
     * @param onEnd The name of an event to send when this animation naturally stops playing. This only matters if loop is false.
     */
    play(animation: string, loop: boolean = false, onEnd?: string): void {
        this.currentAnimation = animation;
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.loop = loop;
        this.animationState = AnimationState.PLAYING;
        if(onEnd !== undefined){
            this.onEndEvent = onEnd;
        } else {
            this.onEndEvent = null;
        }

        this.pendingAnimation = null;
    }

    /** Queues a single animation to be played after the current one. Does NOT stack */
    queue(animation: string, loop: boolean = false, onEnd?: string): void {
        this.pendingAnimation = animation;
        this.pendingLoop = loop;
        if(onEnd !== undefined){
            this.pendingOnEnd = onEnd;
        } else {
            this.pendingOnEnd = null;
        }
    }

    /** Pauses the current animation */
    pause(): void {
        this.animationState = AnimationState.PAUSED;
    }

    /** Resumes the current animation if possible */
    resume(): void {
        if(this.animationState === AnimationState.PAUSED){
            this.animationState = AnimationState.PLAYING;
        }
    }

    /** Stops the current animation. The animation cannot be resumed after this. */
    stop(): void {
        this.animationState = AnimationState.STOPPED;
    }
}