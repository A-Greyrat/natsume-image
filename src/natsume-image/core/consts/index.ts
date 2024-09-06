export const DEFAULT_VERT_SHADER = `#version 300 es
    precision mediump float;
    // Notice: 如果需要自定义Vertex, 请确保position和uv输入正确
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    
    void main() {
        v_texCoord = vec2(a_texCoord.x, a_texCoord.y);
        gl_Position = vec4(a_position.xy, 0.0, 1.0);
    }
`;

export const DEFAULT_FRAG_SHADER = `#version 300 es
    precision mediump float;
    uniform sampler2D u_image;
    in vec2 v_texCoord;
    out vec4 fragColor;
    
    void main() {
        fragColor = texture(u_image, v_texCoord);
    }
`;
