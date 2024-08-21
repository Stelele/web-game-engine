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
            let shouldShowBoundingBox = flags & (1<<1);
            if(shouldShowBoundingBox > 0) {
                return vec4f(0.9, 0.1, 0.1, 1);
            }
            discard;
        }
        
        
        let shouldReColor = flags & 1;
        if(shouldReColor > 0) {
            return color;
        }
        
        return pixel;
    }
`