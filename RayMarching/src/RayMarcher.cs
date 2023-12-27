using OpenTK.Graphics.OpenGL4;
using OpenTK.Mathematics;

namespace RayMarching;

public class RayMarcher
{
    private readonly GLO.Shader _shader;
    private readonly GLO.VAO _vao;
    private readonly GLO.VBO _vbo;

    private readonly static float[] _rectangleVerticies = {
        -1.0f,  1.0f,
        -1.0f, -1.0f,
         1.0f, -1.0f,

        -1.0f,  1.0f,
         1.0f, -1.0f,
         1.0f,  1.0f
    };

    public RayMarcher()
    {
        _shader = new GLO.Shader("../../../shaders/raymarcher.vert", "../../../shaders/raymarcher.frag");
        _vao = new GLO.VAO();
        _vbo = new GLO.VBO();

        _vao.Bind();
        _vbo.SetBufferData(_rectangleVerticies, BufferUsageHint.StaticDraw);
        _vao.Unbind();

        _vao.DefineVertexAttribPointer(_vbo, 0, 2, 2 * sizeof(float), 0);
    }

    public void Render(Vector2i resolution)
    {
        _shader.Use();
        _shader.SetVector2(_shader.GetUniformLocation("resolution"), resolution);
        _vao.Bind();
        GL.DrawArrays(PrimitiveType.Triangles, 0, 6);
    }
}
