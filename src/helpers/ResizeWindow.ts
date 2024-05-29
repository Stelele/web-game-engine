export function resize(canvas: HTMLCanvasElement, _event?: UIEvent) {
    // current screen size
    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const canvasWidth = 600
    const canvasHeight = 600

    // uniform scale for our game
    const scale = Math.min(screenWidth / canvasWidth, screenHeight / canvasHeight);

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * canvasWidth);
    const enlargedHeight = Math.floor(scale * canvasHeight);

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth) / 2;
    const verticalMargin = (screenHeight - enlargedHeight) / 2;

    // now we use css trickery to set the sizes and margins
    canvas.style.width = `${enlargedWidth}px`;
    canvas.style.height = `${enlargedHeight}px`;
    canvas.style.marginLeft = canvas.style.marginRight = `${horizontalMargin}px`;
    canvas.style.marginTop = canvas.style.marginBottom = `${verticalMargin}px`;
}