import { DEFAULT_VERT_SHADER, GREYSCALE_FRAG_SHADER } from '../shader';
import { blitTexture, clamp, createShader } from '../utils';
import { IFilter } from './type.ts';

/**
 * Grey scale filter
 * 灰度滤镜
 * @param {number} greyScale - Grey scale 灰度，范围 0 ~ 1
 */
export class GreyScaleFilter implements IFilter {
    private static vertexShader = DEFAULT_VERT_SHADER;
    private static fragmentShader = GREYSCALE_FRAG_SHADER;

    private program?: WebGLProgram;
    private greyScale: number = 1;

    constructor(greyScale: number = 1) {
        this.greyScale = clamp(greyScale, 0, 1);
    }

    set GreyScale(value: number) {
        this.greyScale = clamp(value, 0, 1);
    }

    get GreyScale() {
        return this.greyScale;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, GreyScaleFilter.vertexShader, GreyScaleFilter.fragmentShader);
            if (!program) {
                console.error('[GreyScaleFilter] Unable to create shader');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_greyScale'), this.greyScale);
        });
    }
}
