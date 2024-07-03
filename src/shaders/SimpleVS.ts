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
        pos *= transform.scale;
        pos = rotate(pos, transform.rotate);
        pos += transform.translate;

        return vec4f(pos, .0, 1.);
    }

    fn rotate(uv: vec2f, theta: f32) -> vec2f {
        let r = mat2x2f(
            cos(theta), sin(theta),
           -sin(theta), cos(theta)
        );

        return r * uv;
    }
`