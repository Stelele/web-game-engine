export class MapEntry {
    constructor(public asset: unknown, public refCount: number = 0) { }
}

export class ResourceMap {
    private constructor() { }

    private static resourceMap: Record<string, MapEntry> = {}
    private static outstandingLoadsNum = 0
    private static loadCompleteCallback?: () => void = undefined

    private static checkForAllLoadCompleted() {
        if (this.outstandingLoadsNum === 0 && this.loadCompleteCallback !== undefined) {
            const funcToCall = this.loadCompleteCallback
            this.loadCompleteCallback = undefined
            funcToCall()
        }
    }

    public static setLoadCompleteCallback(func: () => void) {
        this.loadCompleteCallback = func
        this.checkForAllLoadCompleted()
    }

    public static asyncLoadRequested(rName: string) {
        this.resourceMap[rName] = new MapEntry(rName)
        this.outstandingLoadsNum += 1
    }

    public static asyncLoadCompleted(rName: string, loadedAsset: unknown) {
        if (!this.isAssetLoaded(rName)) {
            throw new Error(`gEngine.asyncLoadCompleted: ['${rName}'] not in map!`)
        }

        this.resourceMap[rName].asset = loadedAsset
        this.resourceMap[rName].refCount += 1
        this.outstandingLoadsNum -= 1
        this.checkForAllLoadCompleted()
    }

    public static isAssetLoaded(rName: string) {
        return rName in this.resourceMap
    }

    public static retrieveAsset<T>(rName: string) {
        if (rName in this.resourceMap) {
            this.resourceMap[rName].refCount += 1
            return this.resourceMap[rName].asset as T
        }

        return undefined
    }

    public static incAssetRefCount(rName: string) {
        this.resourceMap[rName].refCount += 1
    }

    public static unloadAsset(rName: string) {
        if (!(rName in this.resourceMap)) {
            return
        }

        this.resourceMap[rName].refCount -= 1
        if (this.resourceMap[rName].refCount > 0) {
            return
        }

        delete this.resourceMap[rName]
    }
}