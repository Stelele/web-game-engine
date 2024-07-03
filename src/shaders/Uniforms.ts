export const Uniforms = /* wgsl */ `
    struct Transform {
        rotate:  f32,
        translate: vec2f,
        scale: vec2f,
    }

    @group(0) @binding(0) var<uniform> color: vec4f;
    @group(0) @binding(1) var<uniform> transform: Transform;
`