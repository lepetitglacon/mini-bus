export class Stop {

    public id: any;
    public coords: [number, number];
    public marker: L.Marker|null = null;

    constructor(id: number) {
        this.id = id
    }


}