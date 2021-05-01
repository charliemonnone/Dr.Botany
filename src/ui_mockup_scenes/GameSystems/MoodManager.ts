import Receiver from "../../Wolfie2D/Events/Receiver";
import PlayerController from "../Controllers/PlayerController";
import EnemyController from "../Enemies/EnemyController";
import { InGame_Events, PlantMoods } from "../Utils/Enums";
export default class PlantManager {
	
	receiver: Receiver = new Receiver();
	moodLevel: number = 0; 						// mood goes from -50 -> 50, 100 total points 
	currentMood: string = PlantMoods.NEUTRAL; 	// plant starts each level neutral, although we may want to change this
	
	neutralEffect: MoodEffect;
	upperTierOneEffect: MoodEffect;
	upperTierTwoEffect: MoodEffect;
	downerTierOneEffect: MoodEffect;
	downerTierTwoEffect: MoodEffect;

	/*
		-50 -> -30		-30 -> -10	   -10 -> 10 	 10 -> 30		 30 -> 50				
		| Tier 2 Upper | Tier 1 Upper | Neutral 	| Tier 1 Downer | Tier 2 Downer |

		My tentative plan for the mood range is that once you git a threshold, it transitions to the 
		next tier. So if Im tier 1 upper at -20 and I deposit 10 uppers landing exactly on -30, 
		choose to transition to tier 2 upper.
		
		It annoys me to think of uppers as negative and downers as positive, so Ill probably change the art of
		the mood bar to have the upper range on the right and downer on the left
	*/
	constructor() {

	}

	updateMoodLevel(count: number, type: number): void {
		// NOTE: Type is either -1 or 1, so that the mood will shift in the upper/downer direction
		count *= type;
		this.moodLevel += count;
		this.updateCurrentMood(); 
	}

	updateCurrentMood(): void {

	}

	subscribeToEvents(): void {
		while(this.receiver.hasNextEvent()) {
			let event = this.receiver.getNextEvent();
			// if(event.type === InGame_Events.MOOD_CHANGED)
		}
	}

}


abstract class MoodEffect {
	
/*	
	my vague intention for plant effect is that it has access to every enemy and player
	and will apply a data change to all of them, depending on the specific type of effect

	I dont know if effects will be better implemented as:
	UpperEffect extends MoodEffect
	or
	UpperEffect<T> extends MoodEffect, with T being MoveFaster, HitHarder, DoubleMaterialDrops, etc
	or
	IncreaseSpeed extends MoodEffect
*/	
	abstract enemies: Array<EnemyController>;
	abstract player: PlayerController;
	abstract applyEffect: void;
}
