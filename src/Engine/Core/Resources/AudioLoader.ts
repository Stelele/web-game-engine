import { ResourceMap } from "./ResourceMap"

export class Audio {
    private audioContext: AudioContext
    private bufferSource!: AudioBufferSourceNode
    private repeat = false

    public constructor(private clipInfo: AudioBuffer) {
        this.audioContext = new AudioContext()
    }

    public playOnce() {
        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = this.clipInfo
        sourceNode.connect(this.audioContext.destination)
        sourceNode.start(0)
        this.unlockAudioContext()
    }

    public playOnRepeat() {
        this.stopOnRepeat()
        this.repeat = true
        this.bufferSource = this.audioContext.createBufferSource()
        this.bufferSource.buffer = this.clipInfo
        this.bufferSource.connect(this.audioContext.destination)
        this.bufferSource.loop = true
        this.bufferSource.start(0)
        this.unlockAudioContext()
    }

    public stopOnRepeat() {
        if (!this.repeat) return
        this.bufferSource.stop(0)
        this.repeat = false
    }

    public isOnRepeatPlaying() {
        return this.repeat
    }

    private unlockAudioContext() {
        if (this.audioContext.state === 'suspended') {
            var events = ['touchstart', 'touchend', 'mousedown', 'keydown']

            var unlock = (audio: Audio) => {
                events.forEach((event) => {
                    document.body.removeEventListener(event, () => unlock(audio))
                })
                audio.audioContext.resume()
            };

            events.forEach((event) => {
                document.body.addEventListener(event, () => unlock(this), false)
            });
        }
    }
}

export class AudioLoader {
    private constructor() { }

    private static audioContext: AudioContext

    private static initAudioContext() {
        this.audioContext = new AudioContext()
    }

    public static async loadAudio(clipName: string) {
        if (ResourceMap.isAssetLoaded(clipName)) {
            ResourceMap.incAssetRefCount(clipName)
            return
        }

        ResourceMap.asyncLoadRequested(clipName)

        const response = await fetch(clipName)
        if (!this.audioContext) {
            this.initAudioContext()
        }

        const audio = await this.audioContext.decodeAudioData(await response.arrayBuffer())
        ResourceMap.asyncLoadCompleted(clipName, audio)
    }

    public static unloadAudio(clipName: string) {
        ResourceMap.unloadAsset(clipName)
    }

    public static fetchAudio(clipName: string) {
        const clip = ResourceMap.retrieveAsset<AudioBuffer>(clipName)
        if (!clip) return
        return new Audio(clip)
    }


}