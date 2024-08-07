import { gEngine } from "../EngineCore";

export class ImageLoader {
    private constructor() { }

    public static async loadImageAsBitMap(imageName: string) {
        if (gEngine.ResourceManager.isAssetLoaded(imageName)) {
            gEngine.ResourceManager.incAssetRefCount(imageName)
            return
        }

        gEngine.ResourceManager.asyncLoadRequested(imageName)

        const response = await fetch(imageName)
        const blob = await response.blob()

        const bitMap = await createImageBitmap(blob, { colorSpaceConversion: 'none' })

        gEngine.ResourceManager.asyncLoadCompleted(imageName, bitMap)
    }

    public static unloadImage(imageName: string) {
        gEngine.ResourceManager.unloadAsset(imageName)
    }

    public static fetchImage(imageName: string) {
        return gEngine.ResourceManager.retrieveAsset<ImageBitmap>(imageName)
    }
}