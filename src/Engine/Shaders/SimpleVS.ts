import { Uniforms } from "./Uniforms";

export const SimpleVS = /* wgsl */ `
    struct VertexIn {
        @location(0) pos: vec2f,
        @builtin(vertex_index) index: u32
    }
    ${Uniforms}

    @vertex
    fn vs(in: VertexIn) -> @builtin(position) vec4f {
        var pos = in.pos;
        pos = (transform * vec3f(pos, 1.)).xy;
        pos = ((2 * pos / world) - 1) * vec2f(1, -1); 
        
        return vec4f(pos, .0, 1.);
    }

    
`