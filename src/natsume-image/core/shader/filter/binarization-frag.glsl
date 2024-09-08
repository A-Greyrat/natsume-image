#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;
uniform sampler2D u_image;
uniform float u_threshold;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    float binarized = step(u_threshold, luminance);
    fragColor = vec4(vec3(binarized), color.a);
}
