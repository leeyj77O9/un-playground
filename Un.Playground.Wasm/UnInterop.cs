using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using Un.Reflection;

namespace Un.Playground.Wasm;

public partial class UnInterop
{
    [JSExport]
    public static void InitPromptHandler()
    {
        // No-op for now — read()는 SetStdin으로 미리 채워진 stdin을 사용
        // 그때그때 입력이 필요하면 window.prompt 대신 ResultPanel 입력창을 사용
    }

    [JSExport]
    public static string GetVersion() => "2026-08-31T00:00 refactor-cleanup";

    private static NativeAttribute? GetNativeAttr(MemberInfo m) =>
        m.GetCustomAttributes(typeof(NativeAttribute), false).FirstOrDefault() as NativeAttribute;

    private static BuiltinTypeAttribute? GetBuiltinTypeAttr(Type t) =>
        t.GetCustomAttributes(typeof(BuiltinTypeAttribute), false).FirstOrDefault() as BuiltinTypeAttribute;

    private static NativeTypeAttribute? GetNativeTypeAttr(Type t) =>
        t.GetCustomAttributes(typeof(NativeTypeAttribute), false).FirstOrDefault() as NativeTypeAttribute;

    private static Dictionary<string, Type>? GetNativesDict()
    {
        var f = typeof(Global).GetField("natives", BindingFlags.NonPublic | BindingFlags.Static);
        return f?.GetValue(null) as Dictionary<string, Type>;
    }

    private static Type? FindBuiltinType(string name) =>
        typeof(Global).Assembly.GetTypes()
            .Concat(Assembly.GetExecutingAssembly().GetTypes())
            .FirstOrDefault(t => GetBuiltinTypeAttr(t)?.Name == name || GetNativeTypeAttr(t)?.Name == name);

    [JSExport]
    public static string GetHoverInfo(string word)
    {
        try
        {
            var priority = new[] { "IO", "Builtin", "Stream", "Math", "Iter" };
            var allTypes = typeof(Global).Assembly.GetTypes()
                .Concat(Assembly.GetExecutingAssembly().GetTypes())
                .OrderBy(t => {
                    var idx = Array.IndexOf(priority, t.Name);
                    return idx >= 0 ? idx : 100;
                });
            foreach (var t in allTypes)
            {
                foreach (var m in t.GetMethods(BindingFlags.Public | BindingFlags.Static))
                {
                    var attr = GetNativeAttr(m);
                    if (attr == null) continue;
                    var name = attr.Name ?? m.Name;
                    if (name == word || m.Name == word)
                    {
                        return JsonSerializer.Serialize(new
                        {
                            name,
                            description = attr.Description ?? "",
                            example = attr.Example ?? "",
                            returnType = attr.ReturnType ?? "",
                            argumentTypes = attr.ArgumentTypes ?? Array.Empty<string>(),
                            method = m.Name,
                            type = t.Name
                        });
                    }
                }
            }
            return "null";
        }
        catch (Exception ex) { return JsonSerializer.Serialize(new { error = ex.Message }); }
    }

    [JSExport]
    public static string GetModuleMembers(string moduleName)
    {
        try
        {
            if (moduleName.StartsWith("type:"))
            {
                var typeName = moduleName.Substring(5);
                var type = FindBuiltinType(typeName);
                if (type != null)
                {
                    var members = type.GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance)
                        .Select(m => GetNativeAttr(m))
                        .Where(a => a != null)
                        .Select(a => new { name = a!.Name, description = a!.Description, returnType = a!.ReturnType })
                        .ToArray();

                    if (members.Length == 0)
                    {
                        var dictField = typeof(Global).GetField("originalClasses", BindingFlags.NonPublic | BindingFlags.Static);
                        var origDict = dictField?.GetValue(null) as Dictionary<string, Dictionary<string, Un.Object.Obj>>;
                        if (origDict != null && origDict.TryGetValue(typeName, out var attrs))
                        {
                            members = attrs.Select(kv => {
                                var m = type.GetMethods(BindingFlags.Public | BindingFlags.Static)
                                    .FirstOrDefault(x => x.Name == kv.Key || GetNativeAttr(x)?.Name == kv.Key);
                                var a = m != null ? GetNativeAttr(m) : null;
                                return new { name = kv.Key, description = a?.Description ?? "", returnType = a?.ReturnType ?? "" };
                            }).ToArray();
                        }
                    }
                    return JsonSerializer.Serialize(members);
                }
                return "[]";
            }

            var natives = GetNativesDict();
            if (natives != null && natives.TryGetValue(moduleName, out var t2))
            {
                var members = t2.GetMethods(BindingFlags.Public | BindingFlags.Static)
                    .Select(m => GetNativeAttr(m))
                    .Where(a => a != null)
                    .Select(a => new { name = a!.Name, description = a!.Description, returnType = a!.ReturnType })
                    .ToArray();
                return JsonSerializer.Serialize(members);
            }

            if (moduleName == "builtin")
            {
                var bt = typeof(Un.Native.Builtin);
                var members = bt.GetMethods(BindingFlags.Public | BindingFlags.Static)
                    .Select(m => GetNativeAttr(m))
                    .Where(a => a != null)
                    .Select(a => new { name = a!.Name, description = a!.Description, returnType = a!.ReturnType })
                    .ToArray();
                return JsonSerializer.Serialize(members);
            }

            return "[]";
        }
        catch (Exception ex) { return JsonSerializer.Serialize(new { error = ex.Message }); }
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
                            parameters = m.GetParameters()
                                .Where(p => p.GetCustomAttributes(typeof(Un.Reflection.SelfAttribute), false).Length == 0)
                                .Select(p => new { name = p.Name, expectedType = p.Name }).ToArray()
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
                    parameters = Array.Empty<object>()
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
                        parameters = Array.Empty<object>()
                    });
                }
            }

            return JsonSerializer.Serialize(result);
        }
        catch (Exception ex) { return JsonSerializer.Serialize(new { error = ex.Message }); }
    }

    [JSExport]
    public static string GetBuiltinTypes(string _dummy = "")
    {
        try
        {
            var list = new List<object>();
            var known = new HashSet<string>();
            foreach (var t in typeof(Global).Assembly.GetTypes()
                .Concat(Assembly.GetExecutingAssembly().GetTypes())
                .Where(t => GetBuiltinTypeAttr(t) != null))
            {
                var attr = GetBuiltinTypeAttr(t)!;
                known.Add(attr.Name);
                list.Add(new { name = attr.Name, description = attr.Description ?? "", example = attr.Example ?? "" });
            }
            foreach (var fb in new[] { "json", "type", "any" })
                if (!known.Contains(fb))
                    list.Add(new { name = fb, description = $"Builtin type {fb}.", example = $"x: {fb}" });
            return JsonSerializer.Serialize(list);
        }
        catch (Exception ex) { return JsonSerializer.Serialize(new { error = ex.Message }); }
    }

    [JSExport]
    public static string Diagnose(string code)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code)) return "[]";
            var source = new Source("memory://playground.un", code);
            var lexer = new Lexer(source);
            var tokens = lexer.Lex();
            var scope = new Scope(Global.GetGlobalScope());
            var context = new Context(scope, source, []);
            var parser = new Parser(tokens, context);
            parser.Parse();
            return "[]";
        }
        catch (Error e)
        {
            var diag = new[]
            {
                new {
                    message = e.Message,
                    header = e.Header,
                    start = e.Start,
                    length = e.Lenght,
                    line = e.File.GetLine(e.Start),
                    column = e.File.GetColumn(e.Start)
                }
            };
            return JsonSerializer.Serialize(diag);
        }
        catch (Exception ex)
        {
            var diag = new[] { new { message = ex.Message, header = "error", start = 0, length = 1, line = 1, column = 1 } };
            return JsonSerializer.Serialize(diag);
        }
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
        return JsonSerializer.Serialize(new
        {
            stdout = result.Stdout,
            error = result.Error,
            timedOut = result.TimedOut
        });
    }
}
