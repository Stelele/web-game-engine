import { Camera, Renderable } from "../Rendering";
import { IObjectInfo } from "./ObjectInfo";
import { IViewPortInfoRequest } from "./ViewPort";

export interface IRenderingPassInfoRequest {
    camera: Camera
    renderables: Renderable[]
    viewPort: IViewPortInfoRequest
}

export interface IRenderingPassInfo {
    vpMatUniform: GPUBuffer
    camera: Camera
    objectInfos: IObjectInfo[]
    viewPort: IViewPortInfoRequest
}