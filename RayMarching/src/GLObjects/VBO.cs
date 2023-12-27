using OpenTK.Graphics.OpenGL4;

namespace RayMarching.GLO;

class VBO
{
    private readonly int _VBO;

    public VBO()
    {
        _VBO = GL.GenBuffer();
    }

    public void SetBufferData(float[] data, BufferUsageHint usage)
    {
        GL.BindBuffer(BufferTarget.ArrayBuffer, _VBO);
        GL.BufferData(BufferTarget.ArrayBuffer, data.Length * sizeof(float), data, usage);
    }

    public int GetVBO() { return _VBO; }
}
