import { AudioLoader, gEngine } from "../Engine";
import { ResourceManifest } from "./ResourceManifest";
import { Scene1 } from "./Scenes/Scene1";

export async function main() {
    gEngine.setWorldDimensions(640)
    await gEngine.initializeWebGPU("GLCanvas")
    gEngine.GL.clearCanvas([0.9, 0.9, 0.9, 1])

    gEngine.GL.setViewPort({ x: 0.1, y: 0.1, width: 0.8 })

    loadAudio()
    const scene1 = new Scene1()
    gEngine.GL.setScene(scene1)

}

async function loadAudio() {
    const promises: Array<Promise<void>> = []
    for (const group in ResourceManifest) {
        for (const asset in ResourceManifest[group]) {
            if (ResourceManifest[group][asset].type !== "sound") continue
            promises.push(AudioLoader.loadAudio(ResourceManifest[group][asset].url))
        }
    }

    await Promise.all(promises)
    AudioLoader.playOnRepeat(ResourceManifest["background"]["bgClip"].url)
}

