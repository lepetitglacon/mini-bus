import type Stop from "@/game/objects/Stop";

export default class Passenger {

    public destination: Stop;
    public waitingTime: number;
    public waitingTimeMax: 30000;

    constructor(destination: Stop) {
        this.destination = destination
        this.waitingTime = performance.now()
    }

    update() {
        if (this.waitingTime + this.waitingTimeMax > performance.now()) {
            console.error('le passager à trop attendu')
            throw ('le passager à trop attendu')
        }
    }
}