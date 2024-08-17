import { TextureVertexOut } from "./TextureVS";
import { TextureUniforms, Uniforms } from "./Uniforms";

export const TextureFS = /* wgsl */ `
    ${TextureVertexOut}
    ${Uniforms}
    ${TextureUniforms}

    @fragment
    fn fs(in: VertexOut) -> @location(0) vec4f {
        var pixel = textureSample(texture, gSampler, in.texUV);
        if(pixel.a <= 0.05) {
            discard;
        }

        var test = flags & 1;
        if(test == 0) {
            return pixel;
        }
        
        return color;
    }
`