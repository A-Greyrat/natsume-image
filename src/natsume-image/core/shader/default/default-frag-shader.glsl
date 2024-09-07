#version 300 es
precision mediump float;
uniform sampler2D u_image;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    // 默认什么都不做，直接输出原像素
    fragColor = texture(u_image, v_texCoord);
}
