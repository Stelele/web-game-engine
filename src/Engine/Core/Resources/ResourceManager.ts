import { AudioLoader } from "./AudioLoader";
import { FontLoader } from "./FontLoader";
import { ImageLoader } from "./ImageLoader";
import { IResource, IResourceManifest } from "./IResourceManifest";
import { TextFileLoader, TextFileType } from "./TextFileLoader";

export class ResourceManager {
    private constructor() { }

    public static get Audio() {
        return AudioLoader
    }

    public static get Font() {
        return FontLoader
    }

    public static get Image() {
        return ImageLoader
    }

    public static get TextFile() {
        return TextFileLoader
    }

    public static async loadResourcesFromManifest(manifest: IResourceManifest) {
        const promises: Promise<unknown>[] = []
        for (const batch in manifest) {
            for (const asset in manifest[batch]) {
                promises.push(this.loadResource(manifest[batch][asset]))
            }
        }

        await Promise.all(promises)
    }

    public static async loadResource(resource: IResource) {
        if (resource.type === 'font') {
            await this.Font.loadBitmapFont(resource.url)
            return
        }

        if (resource.type === 'image') {
            await this.Image.loadImageAsBitMap(resource.url)
            return
        }

        if (resource.type === 'sound') {
            await this.Audio.loadAudio(resource.url)
            return
        }

        if (resource.type === 'text') {
            const format = resource.format === 'text' ? TextFileType.TextFile : TextFileType.XMLFile
            await this.TextFile.loadTextFile(resource.url, format)
            return
        }
    }
}