import { TextureUniforms, Uniforms } from "./Uniforms";
import { worldToClipSpaceTransformation } from "./Utilities";

export const TextureVertexOut = /* wgsl */ `
    struct VertexOut {
        @builtin(position) pos: vec4f,
        @location(0) texUV: vec2f
    }
`

export const TexturevS = /* wgsl */ `
    struct VertexIn {
        @location(0) pos: vec2f,
        @location(1) texUV: vec2f,
        @builtin(vertex_index) index: u32
    }

    ${TextureVertexOut}
    ${Uniforms}
    ${TextureUniforms}
    ${worldToClipSpaceTransformation}

    @vertex
    fn vs(in: VertexIn) -> VertexOut {
        var pos = worldToClipSpaceTransformation(in.pos);
        
        var out: VertexOut;
        out.pos = worldToClipSpaceTransformation(in.pos);
        out.texUV = in.texUV;

        return out;
    } 
`