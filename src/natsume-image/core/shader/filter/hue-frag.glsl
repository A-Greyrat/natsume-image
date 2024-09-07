#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_hue;

// different from chrome filter，this filter is based on hsv space
// https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/hue-rotate
void main() {
    vec4 color = texture(u_image, v_texCoord);
    // to hsv space(https://www.rapidtables.com/convert/color/hsv-to-rgb.html)
    float cmax = max(color.r, max(color.g, color.b));
    float cmin = min(color.r, min(color.g, color.b));
    float delta = cmax - cmin;

    float hue = delta == 0.0 ? 0.0 : cmax == color.r ? mod((color.g - color.b) / delta, 6.0) : cmax == color.g ? (color.b - color.r) / delta + 2.0 : (color.r - color.g) / delta + 4.0;
    hue *= 60.0;
    hue += u_hue;
    hue = mod(hue, 360.0);

    float saturation = cmax == 0.0 ? 0.0 : delta / cmax;
    float value = cmax;

    // to rgb space(https://www.rapidtables.com/convert/color/rgb-to-hsv.html)
    float c = value * saturation;
    float x = c * (1.0 - abs(mod(hue / 60.0, 2.0) - 1.0));
    float m = value - c;

    vec3 rgb = hue < 60.0 ? vec3(c, x, 0.0) : hue < 120.0 ? vec3(x, c, 0.0) : hue < 180.0 ? vec3(0.0, c, x) : hue < 240.0 ? vec3(0.0, x, c) : hue < 300.0 ? vec3(x, 0.0, c) : vec3(c, 0.0, x);
    fragColor = vec4(rgb + m, color.a);
}
