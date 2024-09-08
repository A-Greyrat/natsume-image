import { DEFAULT_FRAG_SHADER, DEFAULT_VERT_SHADER } from '../shader';
import { Color } from '../type';

export const initWebGLContext = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    img: TexImageSource,
    width: number,
    height: number
) => {
    gl.clearColor(1.0, 1.0, 1.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 禁用深度测试、剔除面
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    // 启用混合
    gl.enable(gl.BLEND);
    // 翻转Y轴
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 预乘alpha
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    // mipmap的质量
    gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);

    gl.viewport(0, 0, width, height);

    // 帧缓冲
    const [fa, ta] = createFrameBuffer(gl, width, height);
    const [fb, tb] = createFrameBuffer(gl, width, height);

    if (!fa || !fb || !ta || !tb) {
        throw new Error('[ImageCanvas] Unable to create frame buffer');
    }

    // 创建纹理
    const glTexture = gl.createTexture();
    if (!glTexture) {
        throw new Error('[ImageCanvas] Unable to create texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // 生成mipmap
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    // 创建顶点缓冲
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 创建纹理缓冲
    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const blitShader = createShader(gl, DEFAULT_VERT_SHADER, DEFAULT_FRAG_SHADER)!;
    if (!blitShader) {
        throw new Error('[ImageCanvas] Unable to create shader');
    }

    gl.useProgram(blitShader);

    const positionLocation = gl.getAttribLocation(blitShader, 'a_position');
    const textureLocation = gl.getAttribLocation(blitShader, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(textureLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 0, 0);

    return {
        glTexture,
        frameBufferA: fa,
        frameBufferB: fb,
        frameBufferTextureA: ta,
        frameBufferTextureB: tb,
        blitShader,
    };
};

export const createFrameBuffer = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    width: number,
    height: number
): [WebGLFramebuffer | null, WebGLTexture | null] => {
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('[createFrameBuffer]: Framebuffer is not complete.');
        return [null, null];
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return [frameBuffer, texture];
};

export const createShader = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    vert: string,
    frag: string,
    notBindTexture = false
): WebGLProgram | null => {
    const vertexShaderObj = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShaderObj) {
        console.error('[createShader] Unable to create vertex shader');
        return null;
    }
    gl.shaderSource(vertexShaderObj, vert);
    gl.compileShader(vertexShaderObj);

    if (!gl.getShaderParameter(vertexShaderObj, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShaderObj));
        return null;
    }

    const fragShaderObj = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragShaderObj) {
        console.error('[createShader] Unable to create fragment shader');
        return null;
    }

    gl.shaderSource(fragShaderObj, frag);
    gl.compileShader(fragShaderObj);

    if (!gl.getShaderParameter(fragShaderObj, gl.COMPILE_STATUS)) {
        console.error('[Compile Error]: ' + gl.getShaderInfoLog(fragShaderObj));
        return null;
    }

    const shader = gl.createProgram();
    if (!shader) {
        throw new Error('[createShader] Unable to create shader');
    }
    gl.attachShader(shader, vertexShaderObj);
    gl.attachShader(shader, fragShaderObj);
    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        console.error('[Link Error] ' + gl.getProgramInfoLog(shader));
        return null;
    }

    if (!notBindTexture) {
        gl.useProgram(shader);
        gl.uniform1i(gl.getUniformLocation(shader, 'u_image'), 0);
    }
    return shader;
};

/**
 * 将纹理绘制到FBO上
 * @param gl webgl上下文
 * @param srcTex 源纹理
 * @param dstFbo 目标FBO
 * @param shader shader
 * @param width 宽度
 * @param height 高度
 * @param setUniforms 设置shader uniform 变量
 */
export const blitTexture = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    srcTex: WebGLTexture,
    dstFbo: WebGLFramebuffer,
    shader: WebGLProgram,
    width: number,
    height: number,
    setUniforms = () => {}
) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
    gl.viewport(0, 0, width, height);
    gl.useProgram(shader);
    setUniforms();
    gl.bindTexture(gl.TEXTURE_2D, srcTex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
};

/**
 * 将src的内容拷贝到dst
 * webgl2 only
 * webgl也有方法，待开发
 * @param gl
 * @param src
 * @param dst
 * @param srcWidth
 * @param srcHeight
 * @param dstWidth
 * @param dstHeight
 */
export const blitFrameBuffer = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    src: WebGLFramebuffer,
    dst: WebGLFramebuffer,
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number
) => {
    if (gl instanceof WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst);
        gl.blitFramebuffer(0, 0, srcWidth, srcHeight, 0, 0, dstWidth, dstHeight, gl.COLOR_BUFFER_BIT, gl.LINEAR);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
        console.error('blitFrameBuffer is only available in WebGL2');
    }
};

export const clampColor = (color: Color): Color => {
    return {
        r: clamp(color.r, 0, 255),
        g: clamp(color.g, 0, 255),
        b: clamp(color.b, 0, 255),
    };
};
