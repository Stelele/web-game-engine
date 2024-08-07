export interface IResourceManifest {
    [key: string]: Record<string, IResource>
}

export interface IResource {
    url: string
    type: "sound" | "text" | "image"
}