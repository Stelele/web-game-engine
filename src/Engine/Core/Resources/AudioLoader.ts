import { gEngine } from "../EngineCore"

export class AudioLoader {
    private constructor() { }

    private static audioContext: AudioContext
    private static loopSounds: Record<string, AudioBufferSourceNode> = {}

    private static initAudioContext() {
        this.audioContext = new AudioContext()
    }

    public static async loadAudio(clipName: string) {
        if (gEngine.ResourceManager.isAssetLoaded(clipName)) {
            gEngine.ResourceManager.incAssetRefCount(clipName)
            return
        }

        gEngine.ResourceManager.asyncLoadRequested(clipName)

        const response = await fetch(clipName)
        if (!this.audioContext) {
            this.initAudioContext()
        }

        const audio = await this.audioContext.decodeAudioData(await response.arrayBuffer())
        gEngine.ResourceManager.asyncLoadCompleted(clipName, audio)
    }

    public static unloadAudio(clipName: string) {
        gEngine.ResourceManager.unloadAsset(clipName)
    }

    public static playOnce(clipName: string) {
        const clipInfo = gEngine.ResourceManager.retrieveAsset(clipName) as AudioBuffer | undefined
        if (!clipInfo) return
        if (!this.audioContext) {
            this.initAudioContext()
        }

        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = clipInfo
        sourceNode.connect(this.audioContext.destination)
        sourceNode.start(0)
        this.unlockAudioContext()
    }

    public static playOnRepeat(clipName: string) {
        const clipInfo = gEngine.ResourceManager.retrieveAsset(clipName) as AudioBuffer | undefined
        if (!clipInfo) return
        if (!this.audioContext) {
            this.initAudioContext()
        }

        this.stopOnRepeat(clipName)
        this.loopSounds[clipName] = this.audioContext.createBufferSource()
        this.loopSounds[clipName].buffer = clipInfo
        this.loopSounds[clipName].connect(this.audioContext.destination)
        this.loopSounds[clipName].loop = true
        this.loopSounds[clipName].start(0)
        this.unlockAudioContext()
    }

    public static stopOnRepeat(clipName: string) {
        if (!(clipName in this.loopSounds)) return
        this.loopSounds[clipName].stop(0)
        delete this.loopSounds[clipName]
    }

    public static isOnRepeatPlaying(clipName: string) {
        return clipName in this.loopSounds
    }

    private static unlockAudioContext() {
        if (this.audioContext.state === 'suspended') {
            var events = ['touchstart', 'touchend', 'mousedown', 'keydown']
            var unlock = function unlock() {
                events.forEach(function (event) {
                    document.body.removeEventListener(event, unlock)
                });
                AudioLoader.audioContext.resume();
            };

            events.forEach(function (event) {
                document.body.addEventListener(event, unlock, false)
            });
        }
    }
}