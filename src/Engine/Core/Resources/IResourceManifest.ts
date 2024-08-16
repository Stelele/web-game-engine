export interface IResourceManifest {
    [key: string]: Record<string, IResource>
}

interface IResourceBase {
    url: string
}

export type IResource = IResourceBase & (
    { type: "sound" } |
    { type: "text"; format: "text" | "xml" } |
    { type: "image" } |
    { type: "font" }
) 
