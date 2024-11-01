import type Passenger from "@/game/objects/Passenger";
import type Line from "@/game/objects/Line";
import L from "leaflet";
import * as turf from "@turf/turf";
import type Stop from "@/game/objects/Stop";
import {useGameStore} from "@/stores/game";

export default class Bus {

    public active = false
    public line: Line

    public marker: L.Marker|null
    public customIcon: L.DivIcon

    public passengers: Set<Passenger> = new Set()
    public speed: number = 30
    public distanceTravelled: number = 0
    public direction: boolean = false

    public nextOrCurrentStop: Stop|null = null
    public lastStop: Stop|null = null
    public currentStop: Stop|null = null
    public atStop: boolean = false
    public onOffStart: number = 0
    public passengerOnOffTime: number = 250

    constructor(line: Line) {
        this.line = line

        this.customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class='bus-marker'>🚌</div>
            `,
            iconSize: [0, 0],
            iconAnchor: [25, 25]
        });
    }

    update() {
        if (!this.lastStop) {
            const stops = this.line.getStopsAsArray()
            this.lastStop = stops[stops.length - 1]
            this.nextOrCurrentStop = stops[0]
            this.marker = new L.Marker([this.nextOrCurrentStop.latitude, this.nextOrCurrentStop.longitude], {
                icon: this.customIcon
            })
            this.line.layerGroup.addLayer(this.marker)
            this.atStop = true
        }

        if (this.atStop) {
            const passengersToUnload = this.getPassengerToUnLoad()
            if (passengersToUnload.length) {
                if (this.onOffStart === 0) {
                    this.onOffStart = performance.now()
                }
                if (this.onOffStart + this.passengerOnOffTime < performance.now()) {
                    passengersToUnload.pop()
                    this.passengers = new Set(passengersToUnload)
                    this.onOffStart = 0
                    this.gameStorePassengers = this.gameStorePassengers + 1
                    console.log('passenger unloaded')
                }
                return
            } else {
                console.log('no one to unload')
            }
            const passengersToLoad = this.getPassengerToLoad()
            if (passengersToLoad.length) {
                if (this.onOffStart === 0) {
                    this.onOffStart = performance.now()
                }
                if (this.onOffStart + this.passengerOnOffTime < performance.now()) {
                    const passenger = passengersToLoad.pop()
                    this.passengers.add(passenger)
                    this.nextOrCurrentStop.passengers.delete(passenger)
                    this.nextOrCurrentStop.marker.fireEvent('game:change')
                    this.onOffStart = 0
                    console.log('passenger loaded')
                }
                return
            } else {
                console.log('no one to load')
            }
            console.log('load/unload finished')
            this.atStop = false

            // set next stop
            if (this.line.loop) {

            } else {
                const stops = this.line.getStopsAsArray()
                const currentStopIndex = stops.indexOf(this.nextOrCurrentStop)
                this.lastStop = this.nextOrCurrentStop
                const isLastOrFirstStop = currentStopIndex === stops.length - 1 || currentStopIndex === 0
                if (isLastOrFirstStop) {
                    this.direction = !this.direction
                }
                console.log(this.direction)
                this.nextOrCurrentStop = stops[this.direction ? currentStopIndex + 1 : currentStopIndex - 1]
            }
        }

        if (!this.atStop && this.marker && this.lastStop && this.nextOrCurrentStop) {
            const currentMarkerLatlng = this.marker?.getLatLng()
            const currentMarkerLatlngAsArray = [currentMarkerLatlng?.lat, currentMarkerLatlng.lng]
            const lineCoords = [
                [this.lastStop.latitude, this.lastStop.longitude],
                [this.nextOrCurrentStop.latitude, this.nextOrCurrentStop.longitude]
            ]
            const turfLine = turf.lineString(lineCoords)

            lineCoords[0] = currentMarkerLatlngAsArray
            const distance = 0.001
            const along = turf.along(turfLine, distance)
            const newMarkerLatLng = [along.geometry.coordinates[0], along.geometry.coordinates[1]]
            this.marker?.setLatLng(newMarkerLatLng)

            const options = {precision: 6}
            if (turf.booleanEqual(turf.point(newMarkerLatLng), turf.point(lineCoords[1]), options)) {
                console.log('arrived at position stop', this.nextOrCurrentStop)
                this.atStop = true
            }

        }
    }

    getPassengerToUnLoad() {
        return Array.from(this.passengers).filter(passenger => {
            return passenger.destination === this.nextOrCurrentStop
        })
    }

    getPassengerToLoad() {
        return Array.from(this.nextOrCurrentStop.passengers).filter(passenger => {
            return this.line.getStopsAsArray().includes(passenger.destination)
        })
    }

    removeFromMap() {
        if (this.passengers.size > 0) {
            return false
        }
        this.lastStop = null
        this.nextOrCurrentStop = null
        this.atStop = false
        this.marker = null
    }

    static isIteratorEmpty(iterator) {
        for (const _ of iterator) {
            return false
        }
        return true
    }

    toString() {
        return 'BUS'
        // return JSON.stringify(this, (key, value) => {
        //     switch (key) {
        //         case 'line':
        //         case 'marker':
        //         case 'customIcon':
        //             return undefined
        //         default:
        //             return value
        //     }
        // },
        // 4
        // )
    }

}