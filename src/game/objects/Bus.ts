import type Passenger from "@/game/objects/Passenger";
import type Line from "@/game/objects/Line";
import L from "leaflet";
import * as turf from "@turf/turf";
import type Stop from "@/game/objects/Stop";
import {useGameStore} from "@/stores/game";
import {useLinesStore} from "@/stores/lines";
import {useStopsStore} from "@/stores/stops";

type ConnectedLineInfo = {
    passenger: Passenger,
    line: Line,
    stop: Stop
}

export default class Bus {

    public gameStore
    public lineStore
    public stopStore

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
    public connectedLinesInfos: ConnectedLineInfo[] = []
    public atStop: boolean = false
    public onOffStart: number = 0
    public passengerOnOffTime: number = 250


    constructor(line: Line) {
        this.line = line

        this.customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div>
                    <div class='bus-marker-passenger'></div>
                    <div class='bus-marker'>🚌</div>
                </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [25, 25]
        });

        this.gameStore = useGameStore()
        this.lineStore = useLinesStore()
        this.stopStore = useStopsStore()
    }

    update(delta) {

        if (this.gameStore.state === this.gameStore.gameStates.SHOP) {
            return
        }

        if (!this.lastStop) {
            const stops = this.line.getStopsAsArray()
            this.lastStop = stops[stops.length - 1]
            this.nextOrCurrentStop = stops[0]
            this.marker = new L.Marker([this.nextOrCurrentStop.latitude, this.nextOrCurrentStop.longitude], {
                icon: this.customIcon
            })
            if (!this.marker.hasEventListeners('game/bus/updateUi')) {
                this.marker.on('game/bus/updateUi', e => {
                    const stopsDiv = this.marker?.getElement()?.querySelector('.bus-marker-passenger')
                    if (!stopsDiv) { return }
                    stopsDiv.innerHTML = ''
                    stopsDiv.style.backgroundColor = this.line.color
                    const passengersByDestination = Array.from(this.passengers.values()).reduce((acc, passenger) => {
                        const name = passenger.destination.name
                            .replace(' ', '')
                            .slice(0, this.gameStore.busStopsCharLenght)
                            .toUpperCase()
                        if (acc[name]) {
                            acc[name]++
                        } else {
                            acc[name] = 1
                        }
                        return acc
                    }, {})
                    stopsDiv.style.top = -15 * Object.values(passengersByDestination).length + 'px'
                    stopsDiv.style.width = this.gameStore.busStopsCharLenght * 15 + 'px'
                    for (const [stopName, numberOfPassenger] of Object.entries(passengersByDestination)) {
                        const p = document.createElement('div')
                        p.innerText = `${stopName}: ${numberOfPassenger}`
                        stopsDiv.append(p)
                    }
                })
            }
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
                    const passengerToDelete = passengersToUnload.pop()
                    this.passengers.delete(passengerToDelete)
                    this.stopStore.passengers.delete(passengerToDelete)
                    this.onOffStart = 0
                    this.gameStore.passengers++
                    this.marker.fireEvent('game/bus/updateUi')
                    // console.log('passenger unloaded')
                }
                return
            } else {
                // console.log('no one to unload')
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
                    this.nextOrCurrentStop.marker.fireEvent('game/stop/updateUi')
                    this.marker.fireEvent('game/bus/updateUi')
                    this.onOffStart = 0
                    // console.log('passenger loaded')
                }
                return
            } else {
                // console.log('no one to load')
            }
            console.log('load/unload finished')
            this.atStop = false

            // set next stop
            const stops = this.line.getStopsAsArray()
            const currentStopIndex = stops.indexOf(this.nextOrCurrentStop)
            this.lastStop = this.nextOrCurrentStop
            if (this.line.loop) {
                this.nextOrCurrentStop = stops[(currentStopIndex + 1) % stops.length]
            } else {
                const isLastOrFirstStop = currentStopIndex === stops.length - 1 || currentStopIndex === 0
                if (isLastOrFirstStop) {
                    this.direction = !this.direction
                }
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
                // console.log('arrived at position stop', this.nextOrCurrentStop)
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
        const passengers = Array.from(this.nextOrCurrentStop.passengers)
        return this.passengers.size <= 6
            && passengers.filter(passenger => {
                return this.line.getStopsAsArray().includes(passenger.destination)
            })
    }

    setConnectedLinesInfos() {
        this.connectedLinesInfos.length = 0

        const connectedLines = this.lineStore.linesAsArray().filter(line => {
            if (line === this.line) { return false }
            let hasStopInCommon = false
            for (const stop of this.line.stops) {
                if (line.stops.has(stop)) {
                    hasStopInCommon = true
                }
            }
            return hasStopInCommon
        })
        Array.from(this.nextOrCurrentStop.passengers).filter(passenger => {
            for (const line of connectedLines) {
                if (line.stops.has(passenger.destination)) {
                    this.connectedLinesInfos.push({
                        passenger: passenger,
                        line: line,
                        stop: passenger.destination
                    })
                    return true
                }
            }
            return false
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