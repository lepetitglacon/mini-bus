export class Line {

    public id: any;
    public marker: L.Marker|null = null;
    public latitude: number;
    public longitude: number;

    constructor(id: number) {
        this.id = id
    }


}