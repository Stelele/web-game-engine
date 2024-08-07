export const Uniforms = /* wgsl */ `
    @group(0) @binding(0) var<uniform> color: vec4f;
    @group(0) @binding(1) var<uniform> transform: mat3x3f;
    @group(0) @binding(2) var<uniform> world: vec2f;
`

export const TextureUniforms = /* wgsl */ `
    @group(0) @binding(3) var gSampler: sampler;
    @group(0) @binding(4) var texture: texture_2d<f32>;
`