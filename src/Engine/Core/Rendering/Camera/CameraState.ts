import { Interpolate, InterpolateV2 } from "../../../Utilities/Interpolate"

export class CameraState {
    private readonly cycles = 300
    private readonly rate = 0.1
    private _center: InterpolateV2
    private _width: Interpolate
    private _height: Interpolate

    public constructor(center: number[], width: number, height: number) {
        this._center = new InterpolateV2(center, this.cycles, this.rate)
        this._width = new Interpolate(width, this.cycles, this.rate)
        this._height = new Interpolate(height, this.cycles, this.rate)
    }

    public get center() { return this._center.value }
    public get width() { return this._width.value }
    public get height() { return this._height.value }

    public setCenter(value: number[]) {
        this._center.setFinalValue(value)
    }

    public setCenterDirectly(value: number[]) {
        this._center.setValueDirectly(value)
    }

    public setDimensions(width: number, height: number) {
        this._width.setFinalValue(width)
        this._height.setFinalValue(height)
    }

    public updateCameraState() {
        this._center.updateInterpolation()
        this._width.updateInterpolation()
        this._height.updateInterpolation()
    }

    public configInterpolation(stiffness: number, duration: number) {
        this._center.configInterpolation(stiffness, duration)
        this._width.configInterpolation(stiffness, duration)
        this._height.configInterpolation(stiffness, duration)
    }
}