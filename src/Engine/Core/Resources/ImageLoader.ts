import { ResourceMap } from "./ResourceMap";

export class ImageLoader {
    private constructor() { }

    public static async loadImageAsBitMap(imageName: string) {
        if (ResourceMap.isAssetLoaded(imageName)) {
            ResourceMap.incAssetRefCount(imageName)
            return
        }

        ResourceMap.asyncLoadRequested(imageName)

        const response = await fetch(imageName)
        const blob = await response.blob()

        const bitMap = await createImageBitmap(blob, { colorSpaceConversion: 'none' })

        ResourceMap.asyncLoadCompleted(imageName, bitMap)
    }

    public static unloadImage(imageName: string) {
        ResourceMap.unloadAsset(imageName)
    }

    public static fetchImage(imageName: string) {
        return ResourceMap.retrieveAsset<ImageBitmap>(imageName)
    }
}