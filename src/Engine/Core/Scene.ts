import { Renderable } from "./Renderables/Renderable"

export interface IScene {
    init: () => Promise<void>
    update: () => void
    getRenderables: () => Renderable[]
}