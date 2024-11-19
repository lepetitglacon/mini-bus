import {useGameStore} from "@/stores/game";
import Effect from "@/game/objects/Effect";
import Item from "@/game/objects/Item";

export default class PassengersManager {

    gameStore = useGameStore()
    currentState = 0
    states = {
        2: {
            items: [
                Item.ITEMS.Line
            ],
            effects: [

            ]
        },
        200: {
            items: [
                Item.ITEMS.DoubleDecker
            ],
            effects: [
                Effect.EFFECTS.Sub
            ]
        },
        1000: {
            items: [
                Item.ITEMS.Bridge
            ],
            effects: [
                Effect.EFFECTS.Fraud
            ]
        },
        5000: {
            items: [
                Item.ITEMS.Tram
            ],
            effects: [
                Effect.EFFECTS.Controllers
            ]
        }

    }

    update() {
        if (this.gameStore.passengers >= parseInt(Object.keys(this.states)[this.currentState])) {
            console.log('lets go to next level')


            this.gameStore.state = this.gameStore.gameStates.UNLOCK_MODAL

            this.currentState++
        }
    }
}