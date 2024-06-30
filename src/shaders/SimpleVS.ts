import { Uniforms } from "./Uniforms";

export const SimpleVS = /* wgsl */ `
    struct VertexIn {
        @location(0) pos: vec2f,
        @builtin(vertex_index) index: u32
    }

    ${Uniforms}

    @vertex
    fn vs(in: VertexIn) -> @builtin(position) vec4f {
        return vec4f(in.pos, .0, 1.);
    }
`