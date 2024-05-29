export const CellShader = /* wgsl */ `
    struct VertextOutput{
        @builtin(position) pos: vec4f,
        @location(0) cell: vec2f,
    };

    struct VertextInput {
        @location(0) pos: vec2f,
        @builtin(instance_index) instance: u32,
    };

    @group(0) @binding(0) var<uniform> grid: vec2f;

    @vertex
    fn vertexMain(input: VertextInput) -> VertextOutput {
        let i = f32(input.instance);
        let cell = vec2f(i % grid.x, floor(i / grid.x));
        let cellOffset = cell / grid * 2;
        let gridPos = ((input.pos + 1) / grid ) - 1 + cellOffset;
        
        var output: VertextOutput;
        output.pos = vec4f(gridPos, 0, 1);
        output.cell = cell;
        return output;
    }

    @fragment
    fn fragmentMain(input: VertextOutput) -> @location(0) vec4f {
        let c = input.cell / grid;
        return vec4f(c, 1 - c.y, 1);
    }
`