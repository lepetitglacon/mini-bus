import L from "leaflet";

export default class Stop {

    public id: string;
    public marker: L.Marker|null = null;
    public latitude: number;
    public longitude: number;

    constructor(id: string, latlng: number[]) {
        this.id = id
        this.latitude = latlng[0]
        this.longitude = latlng[1]
        this.marker = new L.Marker([this.latitude, this.longitude])
    }


}