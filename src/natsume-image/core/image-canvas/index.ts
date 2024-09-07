import { blitTexture, createFrameBuffer, initWebGLContext } from '../utils';
import { IFilter } from '../filters';

export class ImageCanvas {
    // canvas
    private readonly glCanvas: HTMLCanvasElement | OffscreenCanvas;
    // WebGL上下文
    private readonly gl: WebGL2RenderingContext | WebGLRenderingContext;
    // 原图数据
    private img: TexImageSource;
    private width: number;
    private height: number;

    // 用于PingPong的FrameBuffer和Texture
    private frameBufferA: WebGLFramebuffer;
    private frameBufferB: WebGLFramebuffer;
    private frameBufferTextureA: WebGLTexture;
    private frameBufferTextureB: WebGLTexture;
    private readonly glTexture: WebGLTexture;

    // 用于绘制的Shader
    private readonly blitShader: WebGLProgram;

    private filters: IFilter[] = [];

    public updateSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.glCanvas.width = width;
        this.glCanvas.height = height;

        const [fa, ta] = createFrameBuffer(this.gl, width, height);
        const [fb, tb] = createFrameBuffer(this.gl, width, height);

        if (!fa || !fb || !ta || !tb) {
            console.error('[ImageCanvas] Unable to create frame buffer');
            return;
        }

        this.frameBufferA = fa;
        this.frameBufferB = fb;
        this.frameBufferTextureA = ta;
        this.frameBufferTextureB = tb;

        this.updateWebGLContext();
    }

    private updateWebGLContext() {
        blitTexture(
            this.gl,
            this.glTexture,
            this.frameBufferA,
            this.blitShader,
            this.width,
            this.height
        );

        let srcFrameBuffer = this.frameBufferA;
        let dstFrameBuffer = this.frameBufferB;
        let srcTexture = this.frameBufferTextureA;
        let dstTexture = this.frameBufferTextureB;

        for (let i = 0; i < this.filters.length; i++) {
            this.filters[i].filter(this.gl, srcTexture, dstFrameBuffer);

            // PingPong FrameBuffer
            const tempFbo = srcFrameBuffer;
            srcFrameBuffer = dstFrameBuffer;
            dstFrameBuffer = tempFbo;

            const tempTex = srcTexture;
            srcTexture = dstTexture;
            dstTexture = tempTex;
        }

        // Draw to canvas
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.useProgram(this.blitShader);
        this.gl.bindTexture(this.gl.TEXTURE_2D, srcTexture);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    public updateImage(img: TexImageSource) {
        this.img = img;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.updateWebGLContext();
    }

    public async getImageSrc(): Promise<string> {
        if (this.glCanvas instanceof HTMLCanvasElement) {
            return Promise.resolve(this.glCanvas.toDataURL());
        } else {
            const canvas = this.glCanvas as OffscreenCanvas;
            const blob = await canvas.convertToBlob();
            return URL.createObjectURL(blob);
        }
    }

    public getCanvas(): HTMLCanvasElement | OffscreenCanvas {
        return this.glCanvas;
    }

    /**
     * 强制更新，在外部修改了Filter后调用
     */
    public forceUpdate() {
        this.updateWebGLContext();
    }

    public addFilter(filter: IFilter) {
        this.filters.push(filter);
        this.updateWebGLContext();
    }

    public resetFilters(filters: IFilter[]) {
        this.filters = filters;
        this.updateWebGLContext();
    }

    private constructor(
        img: TexImageSource,
        width: number,
        height: number,
        mode: 'webgl' | 'offscreen' = 'webgl',
        canvas?: HTMLCanvasElement
    ) {
        const options = {
            antialias: true,
            depth: false,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
            stencil: true,
        };

        this.glCanvas = mode === 'webgl' ? canvas! : new OffscreenCanvas(width, height);
        this.glCanvas.width = width;
        this.glCanvas.height = height;

        const gl = this.glCanvas.getContext('webgl2', options) || this.glCanvas.getContext('webgl', options);
        if (!gl) {
            throw new Error('[ImageCanvas] Unable to get WebGL context');
        }

        this.gl = gl as WebGL2RenderingContext | WebGLRenderingContext;
        this.img = img;
        this.width = width;
        this.height = height;

        const { frameBufferA, frameBufferB, frameBufferTextureA, frameBufferTextureB, glTexture, blitShader } =
            initWebGLContext(this.gl, this.img, this.width, this.height);

        this.frameBufferA = frameBufferA;
        this.frameBufferB = frameBufferB;
        this.frameBufferTextureA = frameBufferTextureA;
        this.frameBufferTextureB = frameBufferTextureB;
        this.glTexture = glTexture;
        this.blitShader = blitShader;
    }

    /**
     * 创建基于离屏Canvas的ImageCanvas实例，用于只生成图片不需要显示的场景 \
     * 如果使用离屏模式导出图片再用img标签显示，主要的性能瓶颈在于CPU与GPU之间的数据传输 \
     * 需要显示的场景建议使用createInstance方法，直接在Canvas上绘制
     * @param img
     * @param width
     * @param height
     */
    public static createInstanceOffScreen(img: TexImageSource, width: number, height: number): ImageCanvas | null {
        try {
            return new ImageCanvas(img, width, height, 'offscreen');
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * 创建基于Canvas的ImageCanvas实例
     * @param canvas
     * @param img
     * @param width
     * @param height
     */
    public static createInstance(
        canvas: HTMLCanvasElement,
        img: TexImageSource,
        width: number,
        height: number
    ): ImageCanvas | null {
        try {
            return new ImageCanvas(img, width, height, 'webgl', canvas);
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
