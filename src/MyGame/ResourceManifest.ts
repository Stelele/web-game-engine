import { IResourceManifest } from "../Engine";

export const ResourceManifest: IResourceManifest = {
    "background": {
        "bgClip": { url: "/Sounds/bg_clip.mp3", type: "sound" }
    },
    "scene1": {
        "blueLevelCue": { url: "/Sounds/blue_level_cue.wav", type: "sound" },
        "bird1": { url: "/Images/bird1.png", type: "image" }
    },
    "scene2": {
        "redLevelCue": { url: "/Sounds/my_game_cue.wav", type: "sound" },
        "bird2": { url: "/Images/bird2.png", type: 'image' }
    }
}