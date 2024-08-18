import { Uniforms } from "./Uniforms";
import { worldToClipSpaceTransformation } from "./Utilities";

export const SimpleVS = /* wgsl */ `
    struct VertexIn {
        @location(0) pos: vec2f,
        @builtin(vertex_index) index: u32
    }
    ${Uniforms}
    ${worldToClipSpaceTransformation}

    @vertex
    fn vs(in: VertexIn) -> @builtin(position) vec4f {
        return worldToClipSpaceTransformation(in.pos);
    }

    
`