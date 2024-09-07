import { IFilter } from './type.ts';
import { SOBEL_EDGE_DETECTION_FRAG_SHADER, SOBEL_EDGE_DETECTION_VERT_SHADER } from '../shader';
import { Color } from '../type';
import { blitTexture, clampColor, createShader } from '../utils';

/**
 * Sobel edge detection filter
 * Sobel 边缘检测滤镜
 * @param {number} intensity - Intensity 强度，范围 0 ~ 1，仅在 edgeOnly 为 false 时生效
 * @param {Color} edgeColor - Edge color 边缘颜色
 * @param {Color} backgroundColor - Background color 背景颜色，仅在 edgeOnly 为 true 时生效
 * @param {boolean} edgeOnly - Edge only 仅显示边缘
 */
export class SobelEdgeDetectionFilter implements IFilter {
    private static vert = SOBEL_EDGE_DETECTION_VERT_SHADER;
    private static frag = SOBEL_EDGE_DETECTION_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(
        private intensity: number = 0.5,
        private edgeColor: Color = { r: 0, g: 0, b: 0 },
        private backgroundColor: Color = { r: 255, g: 255, b: 255 },
        private edgeOnly: boolean = false
    ) {}

    set Intensity(value: number) {
        this.intensity = Math.max(0, Math.min(value, 1));
    }

    get Intensity() {
        return this.intensity;
    }

    set EdgeColor(value: Color) {
        this.edgeColor = clampColor(value);
    }

    get EdgeColor() {
        return this.edgeColor;
    }

    set BackgroundColor(value: Color) {
        this.backgroundColor = clampColor(value);
    }

    get BackgroundColor() {
        return this.backgroundColor;
    }

    set EdgeOnly(value: boolean) {
        this.edgeOnly = value;
    }

    get EdgeOnly() {
        return this.edgeOnly;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, SobelEdgeDetectionFilter.vert, SobelEdgeDetectionFilter.frag);
            if (!program) {
                console.error('[SobelEdgeDetectionFilter] Unable to create shader');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_intensity'), this.intensity);
            gl.uniform3fv(gl.getUniformLocation(this.program!, 'u_edgeColor'), [
                this.edgeColor.r / 255,
                this.edgeColor.g / 255,
                this.edgeColor.b / 255,
            ]);
            gl.uniform3fv(gl.getUniformLocation(this.program!, 'u_backgroundColor'), [
                this.backgroundColor.r / 255,
                this.backgroundColor.g / 255,
                this.backgroundColor.b / 255,
            ]);
            gl.uniform1i(gl.getUniformLocation(this.program!, 'u_edgeOnly'), this.edgeOnly ? 1 : 0);
            gl.uniform2f(
                gl.getUniformLocation(this.program!, 'u_textureSize'),
                gl.drawingBufferWidth,
                gl.drawingBufferHeight
            );
        });
    }
}
