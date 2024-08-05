import { Renderable } from "./Renderable"

export interface IScene {
    init: () => Promise<void>
    update: () => void
    getRenderables: () => Renderable[]
}