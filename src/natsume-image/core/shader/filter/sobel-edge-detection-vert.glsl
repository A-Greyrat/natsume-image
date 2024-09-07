#version 300 es
precision mediump float;
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
out vec2[9] v_uv;

uniform vec2 u_textureSize;

void main() {
    v_texCoord = vec2(a_texCoord.x, a_texCoord.y);
    gl_Position = vec4(a_position.xy, 0.0, 1.0);

    vec2 texel = vec2(1.0 / u_textureSize.x, 1.0 / u_textureSize.y);
    v_uv[0] = v_texCoord + texel * vec2(-1.0, -1.0);
    v_uv[1] = v_texCoord + texel * vec2(0.0, -1.0);
    v_uv[2] = v_texCoord + texel * vec2(1.0, -1.0);
    v_uv[3] = v_texCoord + texel * vec2(-1.0, 0.0);
    v_uv[4] = v_texCoord + texel * vec2(0.0, 0.0);
    v_uv[5] = v_texCoord + texel * vec2(1.0, 0.0);
    v_uv[6] = v_texCoord + texel * vec2(-1.0, 1.0);
    v_uv[7] = v_texCoord + texel * vec2(0.0, 1.0);
    v_uv[8] = v_texCoord + texel * vec2(1.0, 1.0);
}
