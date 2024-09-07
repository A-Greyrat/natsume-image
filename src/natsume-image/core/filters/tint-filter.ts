import { IFilter } from './type.ts';
import { DEFAULT_VERT_SHADER, TINT_FRAG_SHADER } from '../shader';
import { Color } from '../type';
import { blitTexture, clampColor, createShader } from '../utils';

/**
 * Tint filter
 * 色调滤镜
 * @param {Color} tint - Tint 色调
 */
export class TintFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = TINT_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private tint: Color = { r: 255, g: 255, b: 255 }) {}

    set Tint(value: Color) {
        this.tint = clampColor(value);
    }

    get Tint() {
        return this.tint;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, TintFilter.vert, TintFilter.frag);
            if (!program) {
                console.error('[TintFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform3fv(gl.getUniformLocation(this.program!, 'u_tint'), [
                this.tint.r / 255,
                this.tint.g / 255,
                this.tint.b / 255,
            ]);
        });
    }
}
