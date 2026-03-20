import { themeForLevel } from "./themes.js";
import { drawBackgroundLayers, drawBackgroundOverlays, drawEdgeRails, drawProps } from "./sceneryDraw.js";
import { lowerBound, upperBound } from "./sceneryMath.js";

const CFG = { propCullPadY: 240, parallax: { default: 0.12 } };

export class Scenery {
    constructor({ track, level }) {
        this.track = track;
        this.level = level;
        this.theme = themeForLevel(level);
        this._themeProps = this.theme?.props || [];
        this._layers = this.theme?.layers || [];
        this.props = this._buildProps();
        this.props.sort((a, b) => a.idx - b.idx);
    }

    _buildProps() {
        const props = [];
        const pointCount = this.track.points?.length || 0;
        if (!pointCount || !this._themeProps.length) return props;

        for (let idx = 24; idx < pointCount; idx += 52) {
            const point = this.track.pointAtIndex(idx);
            const normal = this.track.normalAtIndex(idx);
            const tangent = this.track.tangentAtIndex(idx);
            const side = ((idx / 52) | 0) % 2 === 0 ? 1 : -1;
            const type = this._themeProps[((idx / 52) | 0) % this._themeProps.length];
            const baseOffset = this.track.roadHalfWidth + 168 + (idx % 3) * 20;
            const along = (((idx * 13) % 5) - 2) * 26;
            const scale = type === "shrub" ? 0.74 : type === "boxBuilding" ? 0.8 : 0.76;

            props.push({
                idx,
                type,
                x: point.x + normal.x * baseOffset * side + tangent.x * along,
                y: point.y + normal.y * baseOffset * side + tangent.y * along,
                s: scale,
                flip: side < 0 ? -1 : 1,
            });
        }
        return props;
    }

    drawBackground(ctx, cameraX, cameraY) {
        drawBackgroundLayers(ctx, this.track, this._layers, cameraX, cameraY, CFG.parallax);
        drawBackgroundOverlays(ctx, this.track);
    }

    draw(ctx, cameraX, cameraY, fromIdx, toIdx) {
        drawEdgeRails(ctx, this.track, cameraX, cameraY, fromIdx, toIdx);
        drawProps(ctx, this.track, this.props, cameraX, cameraY, fromIdx, toIdx, CFG.propCullPadY, lowerBound, upperBound);
    }
}
