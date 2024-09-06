import { Renderable } from "../Rendering/Renderables/Renderable"

export interface IScene {
    init: () => Promise<void>
    update: () => void
    getRenderables: () => Renderable[]
}