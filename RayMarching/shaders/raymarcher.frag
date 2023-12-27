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

float GetSceneObjectsDistance(vec3 rayPosition)
{
    // translatacija je samo mijenjanje pozicije ray odnosno dobiva se osjecaj da se cijeli world mice od kamere
    vec3 sideToSideTranslation = vec3(rayPosition.x + sin(time) * 4, rayPosition.yz);
    float sphere = signedDistanceSphere(sideToSideTranslation, 1);

    // Kod skaliranja potrebno je nakon jos podijliti sa skaliranim faktorom rezultat
    vec3 scaled = vec3(rayPosition.xyz) * 2; // skaliranje je obrnuto takoder, puta 2 stvara dva puta manje
    float cube = signedDistanceBox(scaled, vec3(1)) / 2;

    float ground = rayPosition.y + 0.75; // + 0.75 pomaknuti pod ispod kamere jer je na istoj razini kak i kamera

    return min(
        ground,
        smoothMin(sphere, cube, 2.0)
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

        outputColor = vec3(i) / STEPS; // render svjetlije ovisno o daljini od ruba objekta

        // Prvi slucaj jako smo blizu objektu, pa stalno je distance do njega manji i manji, ali ga nikad ne udarimo, drugi nismo nasli nikaj
        // na dovoljno velikom prostoru (kruznici radijusa distanceToNearestObject)
        if (distanceToNearestObject <= MIN_DISTANCE || distanceToNearestObject >= MAX_DISTANCE) break;
    }

    FragColor = vec4(outputColor, 1.0);
}

void main(void)
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord / resolution - 0.5) * 2.0; // center so 0,0 is middle (opengl uses bottom left as 0,0 -> top right w,h)
    uv *= resolution.x / resolution.y; // fix perspective for x > y screens

    RayMarching(uv);
}