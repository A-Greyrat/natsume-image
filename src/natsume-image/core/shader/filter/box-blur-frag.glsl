#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_radius;

void main() {
    vec4 d = u_radius.xyxy * vec4(-1.0, -1.0, 1.0, 1.0);

    vec4 color = texture(u_image, v_texCoord + d.xy) * 0.25;
    color += texture(u_image, v_texCoord + d.zy) * 0.25;
    color += texture(u_image, v_texCoord + d.xw) * 0.25;
    color += texture(u_image, v_texCoord + d.zw) * 0.25;

    fragColor = color;
}
