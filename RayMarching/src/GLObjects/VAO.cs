using OpenTK.Graphics.OpenGL4;

namespace RayMarching.GLO;

class VAO
{
    private readonly int _VAO; // readonly: can only be assigned in field or constructor

    public VAO()
    {
        _VAO = GL.GenVertexArray();
    }

    public void Bind() { GL.BindVertexArray(_VAO); }
    public void Unbind() { GL.BindVertexArray(0); }

    // size is vector size (vec3 has 3, vec2 has 2)
    public void DefineVertexAttribPointer(VBO vbo, int attributeID, int size, int stride, int offset)
    {
        Bind();
        GL.BindBuffer(BufferTarget.ArrayBuffer, vbo.GetVBO());
        GL.VertexAttribPointer(attributeID, size, VertexAttribPointerType.Float, false, stride, offset);
        GL.EnableVertexAttribArray(attributeID);
        Unbind();
    }

    public int GetVAO() { return _VAO; }
}
