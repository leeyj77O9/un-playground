using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using Un.Reflection;

namespace Un.Playground.Wasm;

public partial class UnInterop
{
    private static bool _allowEof;

    [JSExport]
    public static void InitPromptHandler()
    {
        // read() at EOF asks the host for another line. The playground answers by
        // aborting this run with NeedInputException, then replays with the new input.
        Native.IO.BrowserPromptHandler = prompt =>
        {
            if (_allowEof) return null;
            throw new Native.NeedInputException(prompt ?? "");
        };
    }

    [JSExport]
    public static void SetAllowEof(string value)
    {
        _allowEof = string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);
    }

    private static NativeAttribute? GetNativeAttr(MemberInfo m) =>
        m.GetCustomAttributes(typeof(NativeAttribute), false).FirstOrDefault() as NativeAttribute;

    // ArgumentTypes는 Self 파라미터를 제외한 순서와 일치한다
    private static object[] BuildNativeParameters(MethodInfo m, NativeAttribute attr)
    {
        var argTypes = attr.ArgumentTypes ?? [];
        var list = new List<object>();
        var index = 0;
        foreach (var p in m.GetParameters())
        {
            if (p.GetCustomAttributes(typeof(Un.Reflection.SelfAttribute), false).Length > 0) continue;
            var j = index++;
            var info = p.GetCustomAttributes(typeof(Un.Reflection.ArgInfoAttribute), false)
                .OfType<Un.Reflection.ArgInfoAttribute>()
                .FirstOrDefault();
            var expectedType = j < argTypes.Length ? argTypes[j] : p.ParameterType.Name;
            list.Add(new
            {
                name = info?.Name ?? p.Name,
                expectedType,
                essential = info?.Essential ?? false,
                optional = info?.Optional ?? p.IsOptional,
                positional = info?.Positional ?? false,
            });
        }
        return list.ToArray();
    }

    private static BuiltinTypeAttribute? GetBuiltinTypeAttr(Type t) =>
        t.GetCustomAttributes(typeof(BuiltinTypeAttribute), false).FirstOrDefault() as BuiltinTypeAttribute;

    private static NativeTypeAttribute? GetNativeTypeAttr(Type t) =>
        t.GetCustomAttributes(typeof(NativeTypeAttribute), false).FirstOrDefault() as NativeTypeAttribute;

    private static Dictionary<string, Type>? GetNativesDict()
    {
        var f = typeof(Global).GetField("natives", BindingFlags.NonPublic | BindingFlags.Static);
        return f?.GetValue(null) as Dictionary<string, Type>;
    }

    [JSExport]
    public static string GetAllNativeFunctions(string _dummy = "")
    {
        try
        {
            var result = new List<object>();
            var natives = GetNativesDict();

            if (natives != null)
            {
                foreach (var kv in natives)
                {
                    foreach (var m in kv.Value.GetMethods(BindingFlags.Public | BindingFlags.Static))
                    {
                        var a = GetNativeAttr(m);
                        if (a == null) continue;
                        result.Add(new
                        {
                            name = a.Name ?? m.Name,
                            module = kv.Key,
                            description = a.Description ?? "",
                            example = a.Example ?? "",
                            returnType = a.ReturnType ?? "",
                            parameters = BuildNativeParameters(m, a)
                        });
                    }
                }
            }

            // builtin
            foreach (var m in typeof(Un.Native.Builtin).GetMethods(BindingFlags.Public | BindingFlags.Static))
            {
                var a = GetNativeAttr(m);
                if (a == null) continue;
                result.Add(new
                {
                    name = a.Name ?? m.Name,
                    module = "builtin",
                    description = a.Description ?? "",
                    example = a.Example ?? "",
                    returnType = a.ReturnType ?? "",
                    parameters = BuildNativeParameters(m, a)
                });
            }

            // types — BuiltinType + NativeType (stream 등)
            foreach (var type in typeof(Global).Assembly.GetTypes()
                .Concat(Assembly.GetExecutingAssembly().GetTypes())
                .Where(t => GetBuiltinTypeAttr(t) != null || GetNativeTypeAttr(t) != null))
            {
                var typeName = (GetBuiltinTypeAttr(type)?.Name ?? GetNativeTypeAttr(type)?.Name)!;
                foreach (var m in type.GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance))
                {
                    var a = GetNativeAttr(m);
                    if (a == null) continue;
                    result.Add(new
                    {
                        name = a.Name ?? m.Name,
                        module = $"type:{typeName}",
                        description = a.Description ?? "",
                        example = a.Example ?? "",
                        returnType = a.ReturnType ?? "",
                        parameters = BuildNativeParameters(m, a)
                    });
                }
            }

            return JsonSerializer.Serialize(result);
        }
        catch (Exception ex) { return JsonSerializer.Serialize(new { error = ex.Message }); }
    }

    [JSExport]
    public static void SetStdin(string input)
    {
        try
        {
            var text = input ?? "";
            // ReadLine은 \n으로 구분, 마지막 줄도 읽히도록 \n 보장
            if (text.Length > 0 && !text.EndsWith("\n")) text += "\n";
            var bytes = System.Text.Encoding.UTF8.GetBytes(text);
            var ms = new MemoryStream(bytes);
            var stream = new Object.IO.Stream(ms);
            Native.IO.SetStdin(stream);
        }
        catch { }
    }

    [JSExport]
    public static string Run(string code)
    {
        var result = PlaygroundRunner.RunCode(code);
        var needsInput = result.Error?.Contains(nameof(Native.NeedInputException), StringComparison.Ordinal) == true;
        return JsonSerializer.Serialize(new
        {
            stdout = result.Stdout,
            error = needsInput ? null : result.Error,
            timedOut = result.TimedOut,
            needsInput
        });
    }
}
