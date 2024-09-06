import { blitTexture, createFrameBuffer, createShader } from './utils';
import { DEFAULT_FRAG_SHADER, DEFAULT_VERT_SHADER } from './consts';

export class ImageCanvas {
    private glCanvas: HTMLCanvasElement | OffscreenCanvas | null;
    private gl: WebGL2RenderingContext | WebGLRenderingContext | null;
    private frameBufferA: WebGLFramebuffer | null = null;
    private frameBufferB: WebGLFramebuffer | null = null;
    private frameBufferTextureA: WebGLTexture | null = null;
    private frameBufferTextureB: WebGLTexture | null = null;
    private glTexture: WebGLTexture | null = null;
    private biltShader: WebGLProgram | null = null;
    private img: TexImageSource | null = null;

    private static instance: ImageCanvas;

    private initWebGLContext() {
        if (!this.gl) {
            throw new Error('[ImageCanvas] Unable to get WebGL context');
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // 禁用深度测试、剔除面
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        // 启用混合
        this.gl.enable(this.gl.BLEND);
        // 混合模式为SRC_ALPHA, ONE_MINUS_SRC_ALPHA
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        // 翻转Y轴
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);

        this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);

        // 帧缓冲
        const [fa, ta] = createFrameBuffer(this.gl, this.glCanvas.width, this.glCanvas.height);
        const [fb, tb] = createFrameBuffer(this.gl, this.glCanvas.width, this.glCanvas.height);

        if (!fa || !fb || !ta || !tb) {
            throw new Error('[ImageCanvas] Unable to create frame buffer');
        }

        this.frameBufferA = fa;
        this.frameBufferB = fb;
        this.frameBufferTextureA = ta;
        this.frameBufferTextureB = tb;

        if (!this.img) {
            throw new Error('[ImageCanvas] Image not found');
        }

        // 创建纹理
        this.glTexture = this.gl.createTexture()!;
        if (!this.glTexture) {
            throw new Error('[ImageCanvas] Unable to create texture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.img);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        // 创建顶点缓冲
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        // 创建纹理缓冲
        const textureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.biltShader = createShader(this.gl, DEFAULT_VERT_SHADER, DEFAULT_FRAG_SHADER)!;
        if (!this.biltShader) {
            throw new Error('[ImageCanvas] Unable to create shader');
        }

        this.gl.useProgram(this.biltShader);

        const positionLocation = this.gl.getAttribLocation(this.biltShader, 'a_position');
        const textureLocation = this.gl.getAttribLocation(this.biltShader, 'a_texCoord');

        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.enableVertexAttribArray(textureLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureBuffer);
        this.gl.vertexAttribPointer(textureLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    private updateWebGLContext() {
        blitTexture(this.gl, this.glTexture, this.frameBufferA, this.biltShader, this.glCanvas.width, this.glCanvas.height);

        // let srcFrameBuffer = this.frameBufferA;
        // let dstFrameBuffer = this.frameBufferB;
        let srcTexture = this.frameBufferTextureA;
        // let dstTexture = this.frameBufferTextureB;

        // for (let i = 0; i < this.filters.length; i++) {
        //     this.filters[i](srcTexture, dstFrameBuffer);
        //     // PingPong FrameBuffer
        //     const tempFbo = srcFrameBuffer;
        //     srcFrameBuffer = dstFrameBuffer;
        //     dstFrameBuffer = tempFbo;
        //
        //     const tempTex = srcTexture;
        //     srcTexture = dstTexture;
        //     dstTexture = tempTex;
        // }

        // Draw to canvas
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
        this.gl.useProgram(this.biltShader);
        this.gl.bindTexture(this.gl.TEXTURE_2D, srcTexture);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    }

    constructor() {
        this.glCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
        this.gl = this.glCanvas.getContext('webgl2') || this.glCanvas.getContext('webgl')!;
        if (!this.gl) {
            throw new Error('[ImageCanvas] Unable to get WebGL context');
        }

        this.initWebGLContext();
    }

    public static getInstance(): ImageCanvas {
        if (!ImageCanvas.instance) {
            ImageCanvas.instance = new ImageCanvas();
        }
        return ImageCanvas.instance;
    }

}