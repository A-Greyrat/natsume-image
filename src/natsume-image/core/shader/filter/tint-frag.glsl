#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec3 u_tint;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    fragColor = vec4(color.rgb * u_tint, color.a);
}
