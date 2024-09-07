#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_greyScale;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    fragColor = vec4(mix(vec3(gray), color.rgb, 1.0 - clamp(u_greyScale, 0.0, 1.0)), color.a);
}
