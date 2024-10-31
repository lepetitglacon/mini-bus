import type Stop from "@/game/objects/Stop";
import L from "leaflet";
import {computed, type ComputedRef} from "vue";

export default class Line {

    public id: any;
    public active = false
    public loop: boolean = false;
    public color: string = '#338866';
    public stops: Set<Stop> = new Set();
    public lineOnMap = null;

    public weight = 20

    constructor(id: number, color: string|null) {
        this.id = id
        this.color = color ?? this.color
    }

    resetFromDrawing() {
        if (!this.active) {
            this.stops.clear()
            this.lineOnMap = null;
        }
    }

    getStopsCoords() {
        const coords = []
        for (const stop of this.stops.values()) {
            coords.push([stop.latitude, stop.longitude])
        }
        return coords
    }

    getPolyline() {
        const polyline = L.polyline(this.getStopsCoords(), {
            color: this.color,
            stroke: true,
            weight: this.weight
        })
        if (this.loop) {
            polyline.getLatLngs().push([Array.from(this.stops.values())[0].latitude, Array.from(this.stops.values())[0].longitude])
        }
        return polyline
    }

    toString() {
        return JSON.stringify(this, (key, value) => {
            switch (key) {
                case 'lineOnMap':
                case 'marker':
                    return undefined
                case 'stops':
                    return [...this.stops.values()]
                default:
                    return value
            }
        },
    4
        )
    }

}