import { IResourceManifest } from "../Engine";

export const ResourceManifest: IResourceManifest = {
    "background": {
        "bgClip": { url: "/Sounds/bg_clip.mp3", type: "sound" }
    },
    "scene1": {
        "blueLevelCue": { url: "/Sounds/blue_level_cue.wav", type: "sound" },
        "minion_collector": { url: "/Images/minion_collector.png", type: "image" },
        "minion_portal": { url: "/Images/minion_portal.png", type: "image" },
        "minion_sprite": { url: "/Images/minion_sprite.png", type: "image" },
        "consolas72": { url: "/Images/consolas-72.png", type: "image" },
        "defaultFont": { url: "/Fonts/system_default_font", type: "font" },
        "segment7-96": { url: "/Fonts/segment7-96", type: "font" }
    },
    "scene2": {
        "redLevelCue": { url: "/Sounds/my_game_cue.wav", type: "sound" },
        "minion_collector": { url: "/Images/minion_collector.jpg", type: "image" },
        "minion_portal": { url: "/Images/minion_portal.jpg", type: "image" },
        "minion_sprite": { url: "/Images/minion_sprite.png", type: "image" },
    }
}