import { Uniforms } from "./Uniforms";

export const SimpleFS = /* wgsl */ `
    ${Uniforms}

    @fragment
    fn fs() -> @location(0) vec4f {
        return color;
    }
`