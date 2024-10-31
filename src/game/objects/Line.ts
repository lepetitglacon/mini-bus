import type Stop from "@/game/objects/Stop";
import L from "leaflet";
import {computed, type ComputedRef} from "vue";

export default class Line {

    public id: any;
    public active = false
    public loop: boolean = false;
    public color: string = '#338866';
    public stops: Set<Stop> = new Set();

    constructor(id: number) {
        this.id = id
    }

    resetFromDrawing() {
        if (!this.active) {
            this.stops.clear()
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
            weight: 10
        })
        if (this.loop) {
            polyline.getLatLngs().push([Array.from(this.stops.values())[0].latitude, Array.from(this.stops.values())[0].longitude])
        }
        return polyline
    }

    static getPolylineFromCoords(coords) {
        return L.polyline(coords, {
            color: this.color,
            stroke: true,
            weight: 10
        })
    }

    addToLayer(layer) {

        coords.push([closestPointInfo.stop.latitude, closestPointInfo.stop.longitude])
        const polyline = L.polyline(coords, { color: 'red', stroke: true, weight: 10 })
    }

    toString() {
        return JSON.stringify(this, (key, value) => {
            if (key === 'stops') {
                return [...this.stops.values()]
            } else if (key === 'marker') {
                return undefined
            } else {
                return value
            }
        },
    4
        )
    }

}