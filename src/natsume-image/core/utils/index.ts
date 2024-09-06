export const createFrameBuffer = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    width: number,
    height: number,
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
    notBindTexture = false,
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
 * @param setUniforms 设置shader uniform
 */
export const blitTexture = (
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    srcTex: WebGLTexture,
    dstFbo: WebGLFramebuffer,
    shader: WebGLProgram,
    width: number,
    height: number,
    setUniforms = () => {
    },
) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
    gl.viewport(0, 0, width, height);
    gl.useProgram(shader);
    setUniforms();
    gl.bindTexture(gl.TEXTURE_2D, srcTex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
