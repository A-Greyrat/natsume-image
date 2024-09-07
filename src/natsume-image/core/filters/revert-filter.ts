import { IFilter } from './type.ts';
import { DEFAULT_VERT_SHADER, REVERT_FRAG_SHADER } from '../shader';
import { blitTexture, createShader } from '../utils';

/**
 * Revert filter
 * 反色滤镜
 */
export class RevertFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = REVERT_FRAG_SHADER;

    private program?: WebGLProgram;

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, RevertFilter.vert, RevertFilter.frag);
            if (!program) {
                console.error('[RevertFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
}
