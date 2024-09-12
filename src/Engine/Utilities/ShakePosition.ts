export class ShakePoint {
    private xMag: number
    private yMag: number
    private cycles: number
    private omega: number
    private cyclesLeft: number

    public constructor(xDelta: number, yDelta: number, shakeFrequency: number, shakeDuration: number) {
        this.xMag = xDelta
        this.yMag = yDelta
        this.cycles = shakeDuration
        this.cyclesLeft = shakeDuration
        this.omega = 2 * Math.PI * shakeFrequency
    }

    private get nextDampedHarmonic() {
        const frac = this.cyclesLeft / this.cycles
        return frac * frac * Math.cos((1 - frac) * this.omega)
    }

    public get shakeDone() { return this.cyclesLeft <= 0 }

    public getShakeResults() {
        this.cyclesLeft -= 1

        let fx = 0
        let fy = 0
        if (!this.shakeDone) {
            const v = this.nextDampedHarmonic
            fx = Math.random() > 0.5 ? -v : v
            fy = Math.random() > 0.5 ? -v : v
        }

        const cx = this.xMag * fx
        const cy = this.yMag * fy

        return [cx, cy]
    }
}