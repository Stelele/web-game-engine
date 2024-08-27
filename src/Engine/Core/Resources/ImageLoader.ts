import { ResourceMap } from "./ResourceMap";

export class ImageLoader {
    private constructor() { }

    public static async loadImageAsBitMap(imageName: string) {
        const imData = `${imageName}_data`
        if (ResourceMap.isAssetLoaded(imageName)) {
            ResourceMap.incAssetRefCount(imageName)
            ResourceMap.incAssetRefCount(imData)
            return
        }

        ResourceMap.asyncLoadRequested(imageName)
        ResourceMap.asyncLoadRequested(imData)

        const response = await fetch(imageName)
        const blob = await response.blob()

        const bitMap = await createImageBitmap(blob, { colorSpaceConversion: 'none' })

        ResourceMap.asyncLoadCompleted(imageName, bitMap)
        ResourceMap.asyncLoadCompleted(imData, this.getImageData(bitMap))
    }

    public static unloadImage(imageName: string) {
        ResourceMap.unloadAsset(imageName)
        ResourceMap.unloadAsset(`${imageName}_data`)
    }

    public static fetchImage(imageName: string) {
        return ResourceMap.retrieveAsset<ImageBitmap>(imageName)
    }

    public static fetchImageData(imageName: string) {
        return ResourceMap.retrieveAsset<ImageData>(`${imageName}_data`)
    }

    private static getImageData(image: ImageBitmap) {
        const canvas = document.createElement('canvas')

        canvas.width = image.width
        canvas.height = image.height

        const context = canvas.getContext('2d')
        context?.drawImage(image, 0, 0)

        return context?.getImageData(0, 0, canvas.width, canvas.height)

    }
}