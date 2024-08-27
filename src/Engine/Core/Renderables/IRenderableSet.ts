import { Renderable } from "./Renderable";

export interface IRenderableSet<T extends Renderable = Renderable> {
    objects: T[]
    init: () => Promise<void>
    update: () => void
}