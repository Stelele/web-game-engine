import { gEngine } from "../EngineCore";

export enum TextFileType {
    XMLFile = 0,
    TextFile = 1,
}

export class TextFileLoader {
    private constructor() { }

    public static async loadTextFile(fileName: string, fileType: TextFileType, callbackFunc?: (fileName: string) => void) {
        if (gEngine.ResourceManager.isAssetLoaded(fileName)) {
            if (callbackFunc) {
                callbackFunc(fileName)
            }

            return
        }

        gEngine.ResourceManager.asyncLoadRequested(fileName)
        const response = await fetch(fileName)

        let fileContent: string | Document
        if (fileType === TextFileType.XMLFile) {
            const parser = new DOMParser()
            fileContent = parser.parseFromString(await response.text(), "text/xml")
        } else {
            fileContent = await response.text()
        }

        gEngine.ResourceManager.asyncLoadCompleted(fileName, fileContent)

        if (callbackFunc) {
            callbackFunc(fileName)
        }
    }

    public static fetchTextFile(fileName: string) {
        return gEngine.ResourceManager.retrieveAsset<string | XMLDocument>(fileName)
    }

    public static async unloadTextfile(fileName: string) {
        gEngine.ResourceManager.unloadAsset(fileName)
    }
}