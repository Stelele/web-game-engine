import { TextureVertexOut } from "./TextureVS";
import { TextureUniforms, Uniforms } from "./Uniforms";

export const TextureFS = /* wgsl */ `
    ${TextureVertexOut}
    ${Uniforms}
    ${TextureUniforms}

    @fragment
    fn fs(in: VertexOut) -> @location(0) vec4f {
        var sample = textureSample(texture, gSampler, in.texUV);
        if(sample.a <= 0.05) {
            discard;
        }
        
        return sample;
    }
`