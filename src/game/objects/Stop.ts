import L from "leaflet";
import  Passenger from "@/game/objects/Passenger";

export default class Stop {

    public id: string;
    public name: string;
    public marker: L.Marker|null = null;
    public latitude: number;
    public longitude: number;
    public passengers: Set<Passenger> = new Set();
    public customIcon: L.DivIcon

    constructor(id: string, latlng: number[], name: string) {
        this.id = id
        this.name = name
        this.latitude = latlng[0]
        this.longitude = latlng[1]

        this.customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class='stop-marker-pin'>O</div>
                <div class='stop-marker'>${this.name}</div>
                <div class="stop-marker-stops"></div>
            `,
            iconSize: [0, 0],
            iconAnchor: [50, 5]
        });
        this.marker = new L.Marker([this.latitude, this.longitude], {
            icon: this.customIcon,
            title: this.name,
            riseOnHover: true
        })
        this.marker.on('game/stop/updateUi', e => {
            const stopsDiv = this.marker?.getElement()?.querySelector('.stop-marker-stops')
            stopsDiv.innerHTML = ''
            const passengersByDestination = Array.from(this.passengers.values()).reduce((acc, passenger) => {
                if (acc[passenger.destination.name]) {
                    acc[passenger.destination.name]++
                } else {
                    acc[passenger.destination.name] = 1
                }
                return acc
            }, {})
            for (const [stopName, numberOfPassenger] of Object.entries(passengersByDestination)) {
                const p = document.createElement('div')
                p.innerText = `${stopName}: ${numberOfPassenger}`
                stopsDiv.append(p)
            }
        })
    }

    toString() {
        return JSON.stringify(this, function (key, val) {
            if (key === 'marker') {
                return undefined
            } else {
                return val
            }
        })
    }

}