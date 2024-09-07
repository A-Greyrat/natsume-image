import { IFilter } from './type.ts';
import { blitTexture, clamp, createShader } from '../utils';
import { BINARIZATION_FRAG_SHADER, DEFAULT_VERT_SHADER } from '../shader';

/**
 * Binarization filter
 * 二值化滤镜
 * @param {number} threshold - Threshold 阈值，范围 0 ~ 1
 */
export class BinarizationFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = BINARIZATION_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private threshold: number = 0.5) {}

    set Threshold(value: number) {
        this.threshold = clamp(value, 0, 1);
    }

    get Threshold() {
        return this.threshold;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, BinarizationFilter.vert, BinarizationFilter.frag);
            if (!program) {
                console.error('[BinarizationFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_threshold'), this.threshold);
        });
    }
}
