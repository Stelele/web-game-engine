export const worldToClipSpaceTransformation = /* wgsl */ `
    fn worldToClipSpaceTransformation(cord: vec2f) -> vec4f {
        var pos = viewProj * transform * vec4f(cord, 0, 1);
        return vec4f(pos.x, -pos.y, pos.z, pos.w);
    }
`