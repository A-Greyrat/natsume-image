import { IFilter } from './type.ts';
import { DEFAULT_VERT_SHADER, SATURATION_FRAG_SHADER } from '../shader';
import { blitTexture, createShader } from '../utils';

export class SaturationFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = SATURATION_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private saturation: number = 1) {}

    set Saturation(value: number) {
        this.saturation = Math.max(0, value);
    }

    get Saturation() {
        return this.saturation;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, SaturationFilter.vert, SaturationFilter.frag);
            if (!program) {
                console.error('[SaturationFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_saturation'), this.saturation);
        });
    }
}
