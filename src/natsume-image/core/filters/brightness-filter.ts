import { BRIGHTNESS_FRAG_SHADER, DEFAULT_VERT_SHADER } from '../shader';
import { blitTexture, createShader } from '../utils';
import { IFilter } from './type.ts';

export class BrightnessFilter implements IFilter {
    private static vertexShader = DEFAULT_VERT_SHADER;
    private static fragmentShader = BRIGHTNESS_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(private brightness: number = 1) {}

    set Brightness(value: number) {
        this.brightness = value;
    }

    get Brightness() {
        return this.brightness;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, BrightnessFilter.vertexShader, BrightnessFilter.fragmentShader);
            if (!program) {
                console.error('[BrightnessFilter] Unable to create shader');
                return;
            }

            this.program = program;
        }

        blitTexture(gl, srcTexture, dstFrameBuffer, this.program, gl.drawingBufferWidth, gl.drawingBufferHeight, () => {
            gl.uniform1f(gl.getUniformLocation(this.program!, 'u_brightness'), this.brightness);
        });
    }
}
