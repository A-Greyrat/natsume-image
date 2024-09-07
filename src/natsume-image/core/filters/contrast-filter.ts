import { IFilter } from './type.ts';
import { CONTRAST_FRAG_SHADER, DEFAULT_VERT_SHADER } from '../shader';
import { blitTexture, createShader } from '../utils';

/**
 * Contrast filter
 * 对比度滤镜
 * @param {number} contrast - Contrast 对比度
 */
export class ContrastFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = CONTRAST_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private contrast: number = 1) {}

    set Contrast(value: number) {
        this.contrast = Math.max(0, value);
    }

    get Contrast() {
        return this.contrast;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, ContrastFilter.vert, ContrastFilter.frag);
            if (!program) {
                console.error('[ContrastFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_contrast'), this.contrast);
        });
    }
}
