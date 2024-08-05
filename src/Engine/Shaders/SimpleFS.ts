import { Uniforms } from "./Uniforms";

export const SimpleFS = /* wgsl */ `
    ${Uniforms}

    @fragment
    fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
        return color;
    }
`