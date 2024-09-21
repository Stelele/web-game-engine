import { gEngine, IRenderingPassInfoRequest, IScene, Renderable, TextRenderable, TextureRenderable } from "../../Engine";
import { Camera } from "../../Engine/Core/Rendering/Camera/Camera";
import { ResourceManifest } from "../ResourceManifest";
import { Hero } from "../Sprites/Hero";
import { Minion } from "../Sprites/Minion";
import { Portal } from "../Sprites/Portal";

export class Scene1 implements IScene {
    private isLoading = false
    private background!: TextureRenderable
    private hero!: Hero
    private minionLeft!: Minion
    private minionRight!: Minion
    private portal!: Portal
    private text!: TextRenderable

    private camera: Camera
    private camera2!: Camera
    private camera3!: Camera
    private focusObject!: Renderable
    private unFocusObject!: Renderable

    public constructor() {
        this.isLoading = true
        this.camera = new Camera("Scene 1")
        this.init()
    }

    public async init() {
        this.background = new TextureRenderable("Background")
            .setTexture(1024, 1024, ResourceManifest['scene1']['bg'].url)
        this.background.setPos({
            x: (gEngine.width / 2) - (this.background.width / 2),
            y: (gEngine.height / 2) - (this.background.height / 2)
        })

        this.hero = new Hero()
        this.hero.setPos({
            x: gEngine.width / 2 - this.hero.width / 2,
            y: gEngine.height / 2 - this.hero.height / 2,
        })

        this.portal = new Portal()
        this.portal.setPos({
            x: gEngine.width / 2 - this.portal.width / 2,
            y: 3 * gEngine.height / 4 - this.portal.height / 2,
        })

        this.minionLeft = new Minion()
        this.minionLeft.setPos({
            x: gEngine.width / 4,
            y: 3 * gEngine.height / 4 - this.minionLeft.height / 2
        })

        this.minionRight = new Minion()
        this.minionRight.setPos({
            x: 3 * gEngine.width / 4,
            y: 3 * gEngine.height / 4 - this.minionRight.height / 2
        })

        this.text = new TextRenderable("Helper text")
            .setFont(25)
            .setText("L/R: Left or Right Minion; H: Dye; P: Portal")
        this.text.setColor([255, 0, 0, 255])
        this.text.setPos({
            x: gEngine.width / 2 - this.text.width / 2,
            y: gEngine.height - this.text.height
        })

        this.focusObject = this.hero
        this.unFocusObject = this.portal
        this.camera.panWith(this.focusObject, 0.9)

        this.camera2 = new Camera("Camera 2", {
            cx: this.portal.cx,
            cy: this.portal.cy,
            width: 2 * this.portal.width,
            height: 2 * this.portal.height
        })
        this.camera3 = new Camera("Camera 3", {
            cx: this.minionLeft.cx,
            cy: this.minionLeft.cy,
            width: 2 * this.minionLeft.width,
            height: 2 * this.minionLeft.height,
        })

        this.isLoading = false
    }

    public update() {
        if (this.isLoading) return

        this.camera.panWith(this.focusObject, 0.9)
        this.camera.clampAtBoundary(this.unFocusObject, 0.9)

        if (gEngine.Input.keys['l']) {
            this.focusObject = this.minionLeft
            this.camera.panTo([this.focusObject.cx, this.focusObject.cy])
        }
        if (gEngine.Input.keys['r']) {
            this.focusObject = this.minionRight
            this.camera.panTo([this.focusObject.cx, this.focusObject.cy])
        }
        if (gEngine.Input.keys['p']) {
            this.focusObject = this.portal
            this.unFocusObject = this.hero
            this.camera.panTo([this.focusObject.cx, this.focusObject.cy])
        }
        if (gEngine.Input.keys['h']) {
            this.focusObject = this.hero
            this.unFocusObject = this.portal
            this.camera.panTo([this.focusObject.cx, this.focusObject.cy])
        }
        if (gEngine.Input.keys['n']) {
            this.camera.zoomBy(0.95)
        }
        if (gEngine.Input.keys['m']) {
            this.camera.zoomBy(1.05)
        }
        if (gEngine.Input.keys['j']) {
            this.camera.zoomTowards([this.focusObject.cx, this.focusObject.cy], 0.95)
        }
        if (gEngine.Input.keys['k']) {
            this.camera.zoomTowards([this.focusObject.cx, this.focusObject.cy], 1.05)
        }
        if (gEngine.Input.keys['q']) {
            this.camera.shake(10, 6, 10, 300)
        }

        this.hero.update()
        this.portal.update()
        this.camera.update()
        this.camera2.setCenterDirectly([this.portal.cx, this.portal.cy])
        this.camera2.update()
        this.camera3.setCenterDirectly([this.minionLeft.cx, this.minionLeft.cy])
        this.camera3.update()
    }

    public getRenderables() {
        return [
            this.background,
            this.hero,
            this.portal,
            this.minionLeft,
            this.minionRight,
            this.text
        ]
    }

    public getRenderingPassesInfo(): IRenderingPassInfoRequest[] {
        if (this.isLoading) return []
        return [
            {
                camera: this.camera,
                renderables: this.getRenderables(),
                viewPort: { x: 0.1, y: 0.2, width: 0.8 }
            },
            {
                camera: this.camera2,
                renderables: [this.background, this.portal],
                viewPort: { x: 0.1, y: 0, width: 0.2 }
            },
            {
                camera: this.camera3,
                renderables: [this.background, this.minionLeft],
                viewPort: { x: 0.7, y: 0, width: 0.2 }
            },
        ]
    }
}