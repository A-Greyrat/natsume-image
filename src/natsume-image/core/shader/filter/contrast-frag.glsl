#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_contrast;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    fragColor = vec4((color.rgb - 0.5) * u_contrast + 0.5, color.a);
}
