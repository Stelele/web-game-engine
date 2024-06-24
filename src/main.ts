import { Renderer } from "./Renderer";

const canvas = document.getElementById("GLCanvas") as HTMLCanvasElement

const render = new Renderer(canvas)
render.init()
