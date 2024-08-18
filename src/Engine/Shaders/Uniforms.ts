export const Uniforms = /* wgsl */ `
    @group(0) @binding(0) var<uniform> color: vec4f;
    @group(0) @binding(1) var<uniform> transform: mat4x4f;
    @group(0) @binding(2) var<uniform> world: vec2f;
    @group(0) @binding(3) var<uniform> resolution: vec2f;
    @group(0) @binding(4) var<uniform> viewProj: mat4x4f;
`

export const TextureUniforms = /* wgsl */ `
    @group(0) @binding(10) var gSampler: sampler;
    @group(0) @binding(11) var texture: texture_2d<f32>;
    @group(0) @binding(12) var<uniform> flags: u32;
`