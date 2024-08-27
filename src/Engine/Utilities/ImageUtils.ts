import { AnimatedTextureRenderable, BoundingCollisionStatus, ImageLoader, TextureRenderable } from "../Core";
import { IAtlasElementInfo, IAtlasInfo } from "../Core/Types/Atlas";
import { Mat4 } from "./Mat4";

function getImageData(atlas: IAtlasInfo, info: IAtlasElementInfo) {
    const imageData = ImageLoader.fetchImageData(atlas.image) as ImageData

    const data = []
    for (let i = 0; i < info.height; i++) {
        for (let j = 0; j < info.width; j++) {
            const y = info.y + i
            const x = info.x + j
            const offset = (y * atlas.width) + x

            for (let k = 0; k < 4; k++) {
                data.push(imageData.data[offset + k] / 255)
            }
        }
    }

    return data
}

export function isPPCollision(a: AnimatedTextureRenderable | TextureRenderable, b: AnimatedTextureRenderable | TextureRenderable, windowSize = [2, 2]) {
    const aImData = getImageData(a.textureInfo, a.imageInfo)
    const bImData = getImageData(b.textureInfo, b.imageInfo)

    let smallObjData: number[]
    let smallObj: AnimatedTextureRenderable | TextureRenderable
    let bigObjData: number[]
    let bigObj: AnimatedTextureRenderable | TextureRenderable

    if (aImData.length > bImData.length) {
        smallObjData = bImData
        smallObj = b
        bigObjData = aImData
        bigObj = a
    } else {
        smallObjData = aImData
        smallObj = a
        bigObjData = bImData
        bigObj = b
    }

    const smallScale = [smallObj.scaledWidth / smallObj.imageInfo.width, smallObj.scaledHeight / smallObj.imageInfo.height, 1]
    const smallRot = smallObj.rotation
    const smallPos = [smallObj.x, smallObj.y, 0]
    const smallMat = Mat4.matMul(
        Mat4.scaleMat(smallScale),
        Mat4.matMul(
            Mat4.rotateZMat(-smallRot),
            Mat4.translateMat(smallPos)
        )
    )

    const bigScale = [bigObj.scaledWidth / bigObj.imageInfo.width, bigObj.scaledHeight / bigObj.imageInfo.height, 1]
    const bigRot = bigObj.rotation
    const bigPos = [bigObj.x, bigObj.y, 0]
    const bigMat = Mat4.inverse(
        Mat4.matMul(
            Mat4.scaleMat(bigScale),
            Mat4.matMul(
                Mat4.rotateZMat(-bigRot),
                Mat4.translateMat(bigPos)
            )
        )
    )
    const bigMask = createTransperancyMask(bigObjData, bigObj.imageInfo.width, bigObj.imageInfo.height)

    for (let i = 0; i < smallObj.imageInfo.width; i++) {
        for (let j = 0; j < smallObj.imageInfo.height; j++) {
            const spOff = ((i * smallObj.imageInfo.width) + j) * 4
            if (smallObjData[spOff + 3] < 0.05) continue

            const wcS = Mat4.vec4Mul(smallMat, [i, j, 0, 1])
            const wcSToB = Mat4.vec4Mul(bigMat, wcS)

            const isPosInvalid = wcSToB[0] < 0 ||
                wcSToB[0] >= bigObj.imageInfo.width ||
                wcSToB[1] < 0 ||
                wcSToB[1] >= bigObj.imageInfo.height

            if (isPosInvalid) continue

            const bX = Math.floor(wcSToB[0])
            const bY = Math.floor(wcSToB[1])
            const bOff = (bY * bigObj.imageInfo.width) + bX
            if (
                windowSize[0] === 0 &&
                windowSize[1] === 0 &&
                !bigMask[bOff]
            ) {
                continue
            }

            let region = []
            for (let z = -windowSize[1]; z <= windowSize[1]; z++) {
                for (let k = -windowSize[0]; k <= windowSize[0]; k++) {
                    const off = ((bY + z) * bigObj.imageInfo.width) + bX + k
                    region.push(bigMask[off])
                }
            }
            region = region.filter((x) => x !== undefined)

            const count = region.reduce((col, val) => {
                col[val ? 'y' : 'n'] += 1
                return col
            }, { y: 0, n: 0 })

            if (count['n'] >= count['y']) continue

            const proportion = (count['y'] - count['n']) / (count['y'] + count['n'])
            if (proportion <= 0.9) continue

            return true
        }
    }

    return false

}

function createTransperancyMask(data: number[], width: number, height: number) {
    const mask = []
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let isOpaque = false

            const offset = ((i * width) + j) * 4
            if (data[offset + 3] > 0.1) {
                isOpaque = true
            }

            mask.push(isOpaque)
        }
    }

    return mask
}