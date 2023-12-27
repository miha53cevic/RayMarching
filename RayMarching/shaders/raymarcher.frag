#version 450 core
out vec4 FragColor;

#define STEPS 80
#define MIN_DISTANCE 0.01
#define MAX_DISTANCE 100.0

uniform vec2 resolution;

// SignDistance Field formulas
// https://iquilezles.org/articles/distfunctions/
float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k )
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
    vec3 q = abs(p) - dimensions;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float GetSceneObjectsDistance(vec3 rayPosition)
{
    // Sfera radijusa 1
    // Ako je rayPosition na rubu sfere onda dobimo 0 i to je intersection, ako je unutar onda je < 0, 
    // ako je > 0 onda je udaljen jos pa budemo povecali krug trazenja itd...
    return length(rayPosition) - 1.0;
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