export interface IFilter {
    /**
     * Filter
     * @param srcTexture 源纹理
     * @param dstFrameBuffer 目标FrameBuffer
     */
    filter: (
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        srcTexture: WebGLTexture,
        dstFrameBuffer: WebGLFramebuffer
    ) => void;
}
