import type Stop from "@/game/objects/Stop";
import L from "leaflet";
import * as turf from "@turf/turf";
import Bus from "@/game/objects/Bus";

export default class Line {

    public id: any;
    public active = false
    public loop: boolean = false;

    public color: string = '#338866';
    public lineLayer: L.Layer|null = null;
    public layerGroup = new L.LayerGroup()

    public bus: Bus = new Bus(this);
    public stops: Set<Stop> = new Set();

    public weight = 20

    constructor(id: number, color: string|null) {
        this.id = id
        this.color = color ?? this.color
    }

    removeFromMap() {
        this.bus.removeFromMap()
        this.stops.clear()
        this.layerGroup.clearLayers()
        this.lineLayer = null;
        this.active = false
        this.loop = false
    }

    getStopsCoords() {
        const coords = []
        for (const stop of this.stops.values()) {
            coords.push([stop.latitude, stop.longitude])
        }
        if (this.loop) {
            coords.push([Array.from(this.stops.values())[0].latitude, Array.from(this.stops.values())[0].longitude])
        }
        return coords
    }

    getStopsAsArray() {
        return Array.from(this.stops)
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

    findClosestSegment(clickLatLng) {
        // Convert the click location to a Turf point
        const clickPoint = turf.point(clickLatLng);

        // Initialize variables to store the minimum distance and index
        let minDistance = Infinity;
        let closestSegment = null;
        let closestSegmentIndex = -1;

        // Iterate through each segment of the polyline
        const coords = this.getStopsCoords()
        for (let i = 0; i < coords.length - 1; i++) {
            // Create a Turf line segment between two consecutive points
            const segment = turf.lineString([
                coords[i],
                coords[i + 1]
            ]);

            // Calculate the distance from the click point to the segment
            const distance = turf.pointToLineDistance(clickPoint, segment, { units: 'meters' });

            // Update if the distance is the smallest found so far
            if (distance < minDistance) {
                minDistance = distance;
                closestSegment = segment;
                closestSegmentIndex = i;
            }
        }

        return {
            index1: closestSegmentIndex,
            index2: closestSegmentIndex + 1,
            segment: closestSegment
        };
    }

    update(delta) {
        this.bus.update(delta)
    }

    toString() {
        return JSON.stringify(this, (key, value) => {
            if (key.endsWith('Store')) {
                return undefined
            }

            switch (key) {
                case 'lineLayer':
                case 'layerGroup':
                case 'marker':
                case 'customIcon':
                case 'line':
                case 'destination':
                case 'gameStore':
                case 'gameStore':
                    return undefined
                case 'stops':
                case 'passengers':
                    return [...value.values()]
                default:
                    return value
            }
        },
    4
        )
    }

}