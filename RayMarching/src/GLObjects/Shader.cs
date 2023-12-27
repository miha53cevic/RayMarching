using OpenTK.Graphics.OpenGL4;
using OpenTK.Mathematics;

namespace RayMarching.GLO;

class Shader : IDisposable
{
    private int _handle = -1;
    private bool disposedValue = false;

    public Shader(string vertexPath, string fragmentPath)
    {
        string vertexShaderSrc = File.ReadAllText(vertexPath);
        string fragmentShaderSrc = File.ReadAllText(fragmentPath);

        int vertexShader = GL.CreateShader(ShaderType.VertexShader);
        GL.ShaderSource(vertexShader, vertexShaderSrc);

        int fragmentShader = GL.CreateShader(ShaderType.FragmentShader);
        GL.ShaderSource(fragmentShader, fragmentShaderSrc);


        int success;
        GL.CompileShader(vertexShader);
        GL.GetShader(vertexShader, ShaderParameter.CompileStatus, out success);
        if (success == 0)
        {
            string infoLog = GL.GetShaderInfoLog(vertexShader);
            Console.WriteLine(infoLog);
        }

        GL.CompileShader(fragmentShader);
        GL.GetShader(fragmentShader, ShaderParameter.CompileStatus, out success);
        if (success == 0)
        {
            string infoLog = GL.GetShaderInfoLog(fragmentShader);
            Console.WriteLine(infoLog);
        }

        _handle = GL.CreateProgram();
        GL.AttachShader(_handle, vertexShader);
        GL.AttachShader(_handle, fragmentShader);
        GL.LinkProgram(_handle);

        GL.GetProgram(_handle, GetProgramParameterName.LinkStatus, out success);

        // Cleanup, since they are linked now to the shader program
        GL.DetachShader(_handle, vertexShader);
        GL.DetachShader(_handle, fragmentShader);
        GL.DeleteShader(vertexShader);
        GL.DeleteShader(fragmentShader);

        GL.GetProgram(_handle, GetProgramParameterName.ActiveUniforms, out int count);
        Console.WriteLine(string.Format("[Shader]: Loaded {0} uniforms", count));
    }

    public void Use()
    {
        GL.UseProgram(_handle);
    }

    public int GetUniformLocation(string name)
    {
        if (_handle == -1)
        {
            throw new Exception("[Shader]: _handle is -1");
        }

        int location = GL.GetUniformLocation(_handle, name);
        if (location == -1)
        {
            throw new Exception(string.Format("[Shader]: Found no location for the uniform: {0}", name));
        }

        return location;
    }

    public void SetMatrix4(int location, Matrix4 mat)
    {
        Use();
        GL.UniformMatrix4(location, true, ref mat);
    }

    public void SetInt(int location, int data)
    {
        Use();
        GL.Uniform1(location, data);
    }

    public void SetFloat(int location, float data)
    {
        Use();
        GL.Uniform1(location, data);
    }

    public void SetVector3(int location, Vector3 data)
    {
        Use();
        GL.Uniform3(location, data);
    }

    public void SetVector2(int location, Vector2 data)
    {
        Use();
        GL.Uniform2(location, data);
    }

    protected virtual void Dispose(bool disposing)
    {
        // If disposed is called twice, only run if value has not been already disposed
        if (!disposedValue)
        {
            // If the user called Dispose() on the object
            if (disposing)
            {
                GL.DeleteProgram(_handle);
            }
            else throw new Exception("GPU Resource leak! Did you forget to call Dispose()?"); // If the deconstructor called Dispose()

            disposedValue = true;
        }
    }

    ~Shader()
    {
        // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        Dispose(disposing: false);
    }

    public void Dispose()
    {
        // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
