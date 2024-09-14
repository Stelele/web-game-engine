import { IRenderingPassInfoRequest } from "./RenderingPassInfo"

export interface IScene {
    init: () => Promise<void>
    update: () => void
    getRenderingPassesInfo: () => IRenderingPassInfoRequest[]
}