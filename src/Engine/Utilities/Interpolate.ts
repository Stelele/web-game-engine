import { Vec2 } from "./Vec2"

export class Interpolate {
    private currentValue: number
    private finalValue: number
    private cycles: number
    private cyclesLeft: number
    private rate: number

    public constructor(value: number, cycles: number, rate: number) {
        this.currentValue = value
        this.finalValue = value
        this.cycles = cycles
        this.rate = rate
        this.cyclesLeft = 0
    }

    private interpolateValue() {
        this.currentValue = this.currentValue + this.rate * (this.finalValue - this.currentValue)
    }

    public get Value() { return this.currentValue }

    public configInterpolation(stiffness: number, duration: number) {
        this.rate = stiffness
        this.cycles = duration
    }

    public setFinalValue(value: number) {
        this.finalValue = value
        this.cyclesLeft = this.cycles
    }

    public updateInterpolation() {
        if (this.cyclesLeft <= 0) return
        this.cyclesLeft -= 1
        if (this.cyclesLeft === 0) {
            this.currentValue = this.finalValue
        } else {
            this.interpolateValue()
        }
    }
}

export class InterpolateV2 {
    private currentValue: number[]
    private finalValue: number[]
    private cycles: number
    private rate: number
    private cyclesLeft = 0

    public constructor(value: number[], cycles: number, rate: number) {
        this.currentValue = value
        this.finalValue = value
        this.cycles = cycles
        this.rate = rate
        this.cyclesLeft = 0
    }

    private interpolateValue() {
        this.currentValue = Vec2.lerp(this.currentValue, this.finalValue, this.rate)
    }

    public get Value() { return this.currentValue }

    public configInterpolation(stiffness: number, duration: number) {
        this.rate = stiffness
        this.cycles = duration
    }

    public setFinalValue(value: number[]) {
        this.finalValue = value
        this.cyclesLeft = this.cycles
    }

    public updateInterpolation() {
        if (this.cyclesLeft <= 0) return
        this.cyclesLeft -= 1
        if (this.cyclesLeft === 0) {
            this.currentValue = this.finalValue
        } else {
            this.interpolateValue()
        }
    }
}