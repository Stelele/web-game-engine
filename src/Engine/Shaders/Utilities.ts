export const worldToClipSpaceTransformation = /* wgsl */ `
    fn worldToClipSpaceTransformation(cord: vec2f) -> vec2f {
        var pos = (transform * vec3f(cord, 1.)).xy;
        pos = ((2 * pos / world) - 1) * vec2f(1, -1);

        return pos;
    }
`