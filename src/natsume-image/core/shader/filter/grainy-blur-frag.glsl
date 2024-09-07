#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_radius;
uniform float u_iteration;

// random number generator
float rand(vec2 n) {
    return sin(dot(n, vec2(1233.224, 1743.335)));
}

void main() {
    vec2 randomOffset = vec2(0.0);
    vec4 color = vec4(0.0);
    float random = rand(v_texCoord);
    int iteration = int(u_iteration);
    for (int i = 0; i < iteration; i++) {
        random = fract(43758.5453 * random + 0.61432);
        randomOffset.x = (random - 0.5) * 2.0;
        random = fract(43758.5453 * random + 0.61432);
        randomOffset.y = (random - 0.5) * 2.0;

        color += texture(u_image, v_texCoord + randomOffset * u_radius);
    }

    fragColor = color / u_iteration;
}
