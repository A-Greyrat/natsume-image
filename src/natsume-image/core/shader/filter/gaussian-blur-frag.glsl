#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_radius;

void main() {
    // 高斯卷积核 [1, 6, 15, 20, 15, 6, 1]

    vec2 offset[7] = vec2[](
        vec2(0.0, 0.0),
        vec2(1.0, 1.0),
        vec2(2.0, 2.0),
        vec2(3.0, 3.0),
        vec2(-1.0, -1.0),
        vec2(-2.0, -2.0),
        vec2(-3.0, -3.0)
    );

    vec4 color = vec4(0.0);
    color += texture(u_image, v_texCoord + offset[0] * u_radius) * 0.3125;
    color += texture(u_image, v_texCoord + offset[1] * u_radius) * 0.234375;
    color += texture(u_image, v_texCoord + offset[2] * u_radius) * 0.09375;
    color += texture(u_image, v_texCoord + offset[3] * u_radius) * 0.015625;
    color += texture(u_image, v_texCoord + offset[4] * u_radius) * 0.234375;
    color += texture(u_image, v_texCoord + offset[5] * u_radius) * 0.09375;
    color += texture(u_image, v_texCoord + offset[6] * u_radius) * 0.015625;

    fragColor = color;
}
