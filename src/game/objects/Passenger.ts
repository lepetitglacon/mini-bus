import type Stop from "@/game/objects/Stop";
import {useGameStore} from "@/stores/game";

export default class Passenger {

    public destination: Stop;
    public waitingTimeStart: number;
    public waitingTimeMax = 60000;
    private gameStore

    constructor(destination: Stop) {
        this.destination = destination
        this.waitingTimeStart = Date.now()
        this.gameStore = useGameStore()
    }

    update() {
        if (this.waitingTimeStart + this.waitingTimeMax < Date.now()) {
            console.error('le passager à trop attendu')
            this.gameStore.state = this.gameStore.gameStates.GAME_OVER
        }
    }
}