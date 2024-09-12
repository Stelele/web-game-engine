import { ShakePoint as ShakePosition } from "../../../Utilities/ShakePosition";
import { Vec2 } from "../../../Utilities/Vec2";
import { Camera } from "./Camera";

export class CameraShake {
    private camera: Camera
    private shake: ShakePosition

    public constructor(state: Camera, xDelta: number, yDelta: number, shakeFrequency: number, shakeDuration: number) {
        this.camera = state
        this.shake = new ShakePosition(xDelta, yDelta, shakeFrequency, shakeDuration)
    }

    public updateShakeState() {
        const s = this.shake.getShakeResults()
        const newCenter = Vec2.add(this.camera.center, s)
        this.camera.setCenterDirectly(newCenter)
    }

    public get shakeDone() { return this.shake.shakeDone }
}