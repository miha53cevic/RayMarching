#version 450 core
out vec4 FragColor;

#define STEPS 80
#define MIN_DISTANCE 0.01
#define MAX_DISTANCE 100.0

uniform vec2 resolution;
uniform float time;

// SignDistance Field formulas
// https://iquilezles.org/articles/distfunctions/
float smoothMin( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float smoothMax( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

float signedDistanceSphere(vec3 rayPosition, float radius)
{
    return length(rayPosition) - radius;
}

float signedDistanceBox(vec3 rayPosition, vec3 dimensions)
{
    vec3 q = abs(rayPosition) - dimensions;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

// translatacija je samo mijenjanje pozicije ray odnosno dobiva se osjecaj da se cijeli world mice od kamere
vec3 translate(vec3 rayPosition, vec3 translation)
{
    return rayPosition + translation;
}

// Kod skaliranja potrebno je nakon jos podijliti sa skaliranim faktorom rezultat
vec3 scale(vec3 rayPosition, float scale)
{
    return rayPosition * scale;
}

mat2 rotate2D(float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

vec3 rotate(vec3 rayPosition, vec3 axis, float angle)
{
    vec3 q = rayPosition;
    if (axis == vec3(1, 0, 0))      q.yz *= rotate2D(angle);
    else if (axis == vec3(0, 1, 0)) q.xz *= rotate2D(angle);
    else if (axis == vec3(0, 0, 1)) q.xy *= rotate2D(angle);
    return q;
}

// Modfactor odreduje udaljenost grupiranja, a fract je samo mod(, 1.0) i radi se kod njega - 0.5
vec3 infinity(vec3 rayPosition, float modFactor)
{
    return mod(rayPosition, modFactor) - (modFactor / 2); // oduzimamo 0.5 jer inace bi samo 1/4 mogli vidjeti jer je ostalo clipped, ako je pocetni objekt u sredini
}

vec3 pallete(float t, int variant)
{
    switch(variant)
    {
        case 0: 
            return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0) * t + vec3(0,0.33,0.67)));
            break;
        case 1: 
            return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0) * t + vec3(0,0.1,0.2)));
            break;
        case 2: 
            return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0) * t + vec3(0.3,0.2,0.2)));
            break;
        case 3: 
            return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0,1.0,0.5) * t + vec3(0.8,0.9,0.3)));
            break;
    }
}

vec3 pallete2(float t)
{
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.1, 0.2);
    return a + b * cos(6.28318 * (c * t + d));
}

float GetSceneObjectsDistance(vec3 rayPosition)
{
    float ground = rayPosition.y + 1.0; // + x.xx pomaknuti pod ispod kamere jer je na istoj razini kak i kamera

    float sphere = signedDistanceSphere(translate(rayPosition, vec3(sin(time) * 4, 0, 0)), 1);
    float cube = signedDistanceBox(infinity(rayPosition, 1.0), vec3(0.1));

    vec3 rotationX = rotate(rayPosition, vec3(1,0,0), time);
    vec3 rotationXY = rotate(rotationX, vec3(0,1,0), time);
    float rotatedCube = signedDistanceBox(rotationXY, vec3(1));

    // TODO return objectId with distance for object based coloring later
    return min(
        ground,
        min(
            smoothMin(sphere, cube, 2.0),
            rotatedCube
        )
    );
}

void RayMarching(vec2 uv)
{
    vec3 rayOrigin = vec3(0, 0, -3);
    vec3 rayDirection = normalize(vec3(uv, 1));

    float totalDistanceTraveled = 0.0;

    vec3 outputColor = vec3(0);
    for (int i = 0; i < STEPS; i++)
    {
        vec3 rayPosition = rayOrigin + rayDirection * totalDistanceTraveled;
        
        float distanceToNearestObject = GetSceneObjectsDistance(rayPosition);

        totalDistanceTraveled += distanceToNearestObject;

        // Color ground different
        if (distanceToNearestObject == rayPosition.y + 1.0)
        {
            float scale = 0.25;
            vec3 flooredPosition = floor(rayPosition / scale);
            float checkerboard = flooredPosition.x + flooredPosition.y + flooredPosition.z;
            checkerboard /= 2.0; // x.5 for odd and x.0 for even
            float patternMask = fract(checkerboard); // equals mod(x,1.0), returns fractional part (.5 or .0)
            patternMask *= 2.0; // gray tiles become black
            outputColor = vec3(1) * patternMask;
        }
        else outputColor = pallete(totalDistanceTraveled * 0.1, 1);

        // Prvi slucaj jako smo blizu objektu, pa stalno je distance do njega manji i manji, ali ga nikad ne udarimo, drugi nismo nasli nikaj
        // na dovoljno velikom prostoru (kruznici radijusa distanceToNearestObject)
        if (distanceToNearestObject <= MIN_DISTANCE || distanceToNearestObject >= MAX_DISTANCE) break;
    }
    //outputColor = vec3(totalDistanceTraveled * 0.1); // svjetlije ako je udaljenost velika od objekta

    FragColor = vec4(outputColor, 1.0);
}

void main(void)
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord / resolution - 0.5) * 2.0; // center so 0,0 is middle (opengl uses bottom left as 0,0 -> top right w,h)
    uv *= resolution.x / resolution.y; // fix perspective for x > y screens

    RayMarching(uv);
}