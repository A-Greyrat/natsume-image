import { IFilter } from './type.ts';
import { blitTexture, createShader } from '../utils';
import { DEFAULT_VERT_SHADER, HUE_FRAG_SHADER } from '../shader';

/**
 * Hue filter
 * 色相滤镜
 * @param {number} hue - Hue 色相旋转角度
 */
export class HueFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = HUE_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private hue: number = 0) {}

    set Hue(value: number) {
        this.hue = value;
    }

    get Hue() {
        return this.hue;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, HueFilter.vert, HueFilter.frag);
            if (!program) {
                console.error('[HueFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_hue'), this.hue);
        });
    }
}
