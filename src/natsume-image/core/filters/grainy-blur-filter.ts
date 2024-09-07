import { IFilter } from './type.ts';
import { DEFAULT_VERT_SHADER, GRAINY_BLUR_FRAG_SHADER } from '../shader';
import { blitFrameBuffer, blitTexture, createFrameBuffer, createShader } from '../utils';

/**
 * Grainy blur filter
 * 粒状模糊滤镜
 * @param {number} radius - Radius 半径
 * @param {number} iteration - Iteration 迭代次数
 * @param {number} downScale - Down scale 降采样比例
 */
export class GrainyBlurFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = GRAINY_BLUR_FRAG_SHADER;

    private program?: WebGLProgram;

    constructor(
        private radius: number = 16,
        private iteration: number = 8,
        private downScale: number = 2
    ) {}

    set Radius(value: number) {
        this.radius = Math.max(0, value);
    }

    get Radius() {
        return this.radius;
    }

    set Iteration(value: number) {
        this.iteration = value;
    }

    get Iteration() {
        return Math.max(1, this.iteration);
    }

    set DownScale(value: number) {
        this.downScale = value;
    }

    get DownScale() {
        return Math.max(1, this.downScale);
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, GrainyBlurFilter.vert, GrainyBlurFilter.frag);
            if (!program) {
                console.error('[GrainyBlurFilter] Unable to create shader');
                return;
            }

            this.program = program;
        }

        const rtWidth = gl.drawingBufferWidth / this.downScale;
        const rtHeight = gl.drawingBufferHeight / this.downScale;

        const radiusWidth = this.radius / gl.drawingBufferWidth;
        const radiusHeight = this.radius / gl.drawingBufferHeight;

        if (this.downScale === 1) {
            blitTexture(
                gl,
                srcTexture,
                dstFrameBuffer,
                this.program,
                gl.drawingBufferWidth,
                gl.drawingBufferHeight,
                () => {
                    gl.uniform2f(gl.getUniformLocation(this.program!, 'u_radius'), radiusWidth, radiusHeight);
                    gl.uniform1f(gl.getUniformLocation(this.program!, 'u_iteration'), this.iteration);
                }
            );
        } else {
            // 创建一个缓冲区
            const [fbo] = createFrameBuffer(gl, rtWidth, rtHeight);

            if (!fbo) {
                console.error('[GrainyBlurFilter] Unable to create frame buffer');
                return;
            }

            blitTexture(gl, srcTexture, fbo, this.program, rtWidth, rtHeight, () => {
                gl.uniform2f(gl.getUniformLocation(this.program!, 'u_radius'), radiusWidth, radiusHeight);
                gl.uniform1f(gl.getUniformLocation(this.program!, 'u_iteration'), this.iteration);
            });
            blitFrameBuffer(gl, fbo, dstFrameBuffer, rtWidth, rtHeight, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }
}
