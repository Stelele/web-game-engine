import { Renderable } from "./Renderable";

export interface IRenderableSet {
    objects: Renderable[]
    init: () => Promise<void>
    update: () => void
}