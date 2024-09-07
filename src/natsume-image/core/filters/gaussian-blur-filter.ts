import { IFilter } from './type.ts';
import { blitFrameBuffer, blitTexture, createFrameBuffer, createShader } from '../utils';
import { DEFAULT_FRAG_SHADER, DEFAULT_VERT_SHADER, GAUSSIAN_BLUR_FRAG_SHADER } from '../shader';

/**
 * Gaussian blur filter
 * 高斯模糊滤镜
 * @param {number} radius - Radius 模糊半径
 * @param {number} iteration - Iteration 迭代次数
 * @param {number} downScale - Down scale 降采样比例
 */
export class GaussianBlurFilter implements IFilter {
    private static vert = DEFAULT_VERT_SHADER;
    private static frag = GAUSSIAN_BLUR_FRAG_SHADER;

    private program?: WebGLProgram;
    private blitProgram?: WebGLProgram;

    constructor(
        private radius: number = 1.6,
        private iteration: number = 3,
        private downScale: number = 3
    ) {}

    set Radius(value: number) {
        this.radius = Math.max(0, value);
    }

    get Radius() {
        return this.radius;
    }

    set Iteration(value: number) {
        this.iteration = Math.max(1, parseInt(value.toString(), 10));
    }

    get Iteration() {
        return this.iteration;
    }

    set DownScale(value: number) {
        this.downScale = Math.max(1, value);
    }

    get DownScale() {
        return this.downScale;
    }

    public filter(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) {
        if (!this.program) {
            const program = createShader(gl, GaussianBlurFilter.vert, GaussianBlurFilter.frag);
            if (!program) {
                console.error('[GaussianBlurFilter] Unable to create program');
                return;
            }

            this.program = program;
        }

        if (!this.blitProgram) {
            const program = createShader(gl, DEFAULT_VERT_SHADER, DEFAULT_FRAG_SHADER);
            if (!program) {
                console.error('[GaussianBlurFilter] Unable to create blit program');
                return;
            }

            this.blitProgram = program;
        }

        const rtWidth = gl.drawingBufferWidth / this.downScale;
        const rtHeight = gl.drawingBufferHeight / this.downScale;

        const [fboA, texA] = createFrameBuffer(gl, rtWidth, rtHeight);
        const [fboB, texB] = createFrameBuffer(gl, rtWidth, rtHeight);

        if (!fboA || !fboB || !texA || !texB) {
            console.error('[GaussianBlurFilter] Unable to create frame buffer');
            return;
        }

        const radiusWidth = this.radius / rtWidth;
        const radiusHeight = this.radius / rtHeight;

        // 将源图像绘制到FrameBufferA
        blitTexture(gl, srcTexture, fboA, this.blitProgram, rtWidth, rtHeight);

        // PingPong FrameBuffer，分别进行横向和纵向高斯模糊
        for (let i = 0; i < this.iteration; i++) {
            blitTexture(gl, texA, fboB, this.program, rtWidth, rtHeight, () => {
                gl.uniform2f(gl.getUniformLocation(this.program!, 'u_radius'), radiusWidth, 0);
            });
            blitTexture(gl, texB, fboA, this.program, rtWidth, rtHeight, () => {
                gl.uniform2f(gl.getUniformLocation(this.program!, 'u_radius'), 0, radiusHeight);
            });
        }

        // 将结果绘制到目标FrameBuffer
        blitFrameBuffer(gl, fboA, dstFrameBuffer, rtWidth, rtHeight, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
}
