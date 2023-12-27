using OpenTK.Graphics.OpenGL4;
using OpenTK.Windowing.Common;
using OpenTK.Windowing.Desktop;

namespace RayMarching;

public class Game : GameWindow
{
    private string _title;
    private RayMarcher? _rayMarcher;

    public Game(int width, int height, string title) : base(GameWindowSettings.Default, NativeWindowSettings.Default)
    {
        this.Size = (width, height);
        this._title = title;
    }

    protected override void OnLoad()
    {
        base.OnLoad();

        GL.ClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        GL.Enable(EnableCap.DepthTest);

        _rayMarcher = new RayMarcher();
    }

    protected override void OnResize(ResizeEventArgs e)
    {
        base.OnResize(e);

        GL.Viewport(0, 0, e.Width, e.Height);
    }

    protected override void OnUpdateFrame(FrameEventArgs args)
    {
        base.OnUpdateFrame(args);
    }

    protected override void OnRenderFrame(FrameEventArgs args)
    {
        base.OnRenderFrame(args);

        this.Title = string.Format("{0} - FPS: {1:0.00}", _title, 1.0f / args.Time);

        GL.Clear(ClearBufferMask.ColorBufferBit | ClearBufferMask.DepthBufferBit);

        _rayMarcher?.Render(this.Size);

        this.SwapBuffers();
    }
}
