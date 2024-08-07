import { TextureVertexOut } from "./TextureVS";
import { TextureUniforms, Uniforms } from "./Uniforms";

export const TextureFS = /* wgsl */ `
    ${TextureVertexOut}
    ${Uniforms}
    ${TextureUniforms}

    @fragment
    fn fs(in: VertexOut) -> @location(0) vec4f {
        return textureSample(texture, gSampler, in.texUV);
    }
`