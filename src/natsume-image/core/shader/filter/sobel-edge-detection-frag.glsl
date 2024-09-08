#version 300 es
precision mediump float;
in vec2 v_texCoord;
in vec2[9] v_uv;

out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_intensity;
uniform vec3 u_edgeColor;
uniform vec3 u_backgroundColor;
uniform int u_edgeOnly;

float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

float sobel() {
    const float gx[9] = float[9](
        -1.0, 0.0, 1.0,
        -2.0, 0.0, 2.0,
        -1.0, 0.0, 1.0
    );

    const float gy[9] = float[9](
        -1.0, -2.0, -1.0,
        0.0, 0.0, 0.0,
        1.0, 2.0, 1.0
    );

    float color = 0.0, edgeX = 0.0, edgeY = 0.0;

    for (int i = 0; i < 9; i++) {
        color = luminance(texture(u_image, v_uv[i]).rgb);
        edgeX += color * gx[i];
        edgeY += color * gy[i];
    }

    return 1.0 - sqrt(edgeX * edgeX + edgeY * edgeY);
}

void main() {
    float edge = sobel();
    edge = smoothstep(0.0, 1.0, edge);
    vec4 t = texture(u_image, v_texCoord);
    vec3 color = t.rgb;
    vec3 withEdgeColor = mix(mix(u_edgeColor, color, edge), color, 1.0 - u_intensity);
    vec3 onlyEdgeColor = mix(u_edgeColor, u_backgroundColor, edge);

    fragColor = vec4(mix(withEdgeColor, onlyEdgeColor, float(u_edgeOnly)), t.a);
}
