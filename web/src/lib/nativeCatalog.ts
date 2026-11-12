// Generated from un/docs/rust-migration/NATIVE_INVENTORY.md by web/scripts/gen-native-catalog.mjs.
// Do not edit by hand — regenerate after the inventory changes.
// The Rust playground ships no reflection metadata, so this static catalog is
// what the editor uses for autocomplete and signature help.
import type { UnNativeFunctionMetadata } from './playground'

export const NATIVE_FUNCTION_CATALOG: UnNativeFunctionMetadata[] = [
  {
    name: "len",
    module: "builtin",
    description: "Returns the number of items in a collection.",
    example: "write(len(items))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "collection",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "exit",
    module: "builtin",
    description: "Stops the current UN program with an exit code.",
    example: "exit(0)",
    returnType: "none",
    parameters: [
      {
        name: "code",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "type",
    module: "builtin",
    description: "Returns the UN type of a value.",
    example: "write(type(value))",
    returnType: "type",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hash",
    module: "builtin",
    description: "Returns a hash value for an object.",
    example: "write(hash(value))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "throw",
    module: "builtin",
    description: "Raises a named runtime error.",
    example: "throw(\"invalid state\")",
    returnType: "error",
    parameters: [
      {
        name: "message",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "throw_if",
    module: "builtin",
    description: "Raises a named runtime error if the condition is true.",
    example: "throw_if(condition, \"invalid state\")",
    returnType: "error",
    parameters: [
      {
        name: "condition",
        expectedType: "bool",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "message",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "throw_unless",
    module: "builtin",
    description: "Raises a named runtime error if the condition is false.",
    example: "throw_unless(condition, \"invalid state\")",
    returnType: "error",
    parameters: [
      {
        name: "condition",
        expectedType: "bool",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "message",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "chr",
    module: "builtin",
    description: "Converts an ASCII/Unicode code point to a single-character string.",
    example: "chr(65) // \"A\\",
    returnType: "str",
    parameters: [
      {
        name: "code",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "ord",
    module: "builtin",
    description: "Converts a single-character string to its ASCII/Unicode code point.",
    example: "ord(\"A\") // 65",
    returnType: "int",
    parameters: [
      {
        name: "ch",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "bin",
    module: "builtin",
    description: "Converts an integer to a binary string with '0b' prefix.",
    example: "bin(10) // \"0b1010\\",
    returnType: "str",
    parameters: [
      {
        name: "value",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "oct",
    module: "builtin",
    description: "Converts an integer to an octal string with '0o' prefix.",
    example: "oct(10) // \"0o12\\",
    returnType: "str",
    parameters: [
      {
        name: "value",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hex",
    module: "builtin",
    description: "Converts an integer to a hexadecimal string with '0x' prefix.",
    example: "hex(255) // \"0xff\\",
    returnType: "str",
    parameters: [
      {
        name: "value",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "repr",
    module: "builtin",
    description: "Convert to repr string.",
    example: "repr(io.write)",
    returnType: "str",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "ascii",
    module: "builtin",
    description: "Convert to ascii for char",
    example: "ascii('a')",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "year",
    module: "type:date",
    description: "Returns the result of date.year().",
    example: "date.year()",
    returnType: "int",
    parameters: []
  },
  {
    name: "month",
    module: "type:date",
    description: "Returns the result of date.month().",
    example: "date.month()",
    returnType: "int",
    parameters: []
  },
  {
    name: "day",
    module: "type:date",
    description: "Returns the result of date.day().",
    example: "date.day()",
    returnType: "int",
    parameters: []
  },
  {
    name: "hour",
    module: "type:date",
    description: "Returns the result of date.hour().",
    example: "date.hour()",
    returnType: "int",
    parameters: []
  },
  {
    name: "minute",
    module: "type:date",
    description: "Returns the result of date.minute().",
    example: "date.minute()",
    returnType: "int",
    parameters: []
  },
  {
    name: "second",
    module: "type:date",
    description: "Returns the result of date.second().",
    example: "date.second()",
    returnType: "int",
    parameters: []
  },
  {
    name: "ms",
    module: "type:date",
    description: "Returns the result of date.ms().",
    example: "date.ms()",
    returnType: "int",
    parameters: []
  },
  {
    name: "timestamp",
    module: "type:date",
    description: "Returns the result of date.timestamp().",
    example: "date.timestamp()",
    returnType: "int",
    parameters: []
  },
  {
    name: "timestamp_ms",
    module: "type:date",
    description: "Returns the result of date.timestamp ms().",
    example: "date.timestamp_ms()",
    returnType: "int",
    parameters: []
  },
  {
    name: "format",
    module: "type:date",
    description: "Returns the result of date.format().",
    example: "date.format(format)",
    returnType: "str",
    parameters: [
      {
        name: "format",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_years",
    module: "type:date",
    description: "Adds years to a date value.",
    example: "date.add_years(years)",
    returnType: "date",
    parameters: [
      {
        name: "years",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_months",
    module: "type:date",
    description: "Adds months to a date value.",
    example: "date.add_months(months)",
    returnType: "date",
    parameters: [
      {
        name: "months",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_days",
    module: "type:date",
    description: "Adds days to a date value.",
    example: "date.add_days(days)",
    returnType: "date",
    parameters: [
      {
        name: "days",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_hours",
    module: "type:date",
    description: "Adds hours to a date value.",
    example: "date.add_hours(hours)",
    returnType: "date",
    parameters: [
      {
        name: "hours",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_minutes",
    module: "type:date",
    description: "Adds minutes to a date value.",
    example: "date.add_minutes(minutes)",
    returnType: "date",
    parameters: [
      {
        name: "minutes",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_seconds",
    module: "type:date",
    description: "Adds seconds to a date value.",
    example: "date.add_seconds(seconds)",
    returnType: "date",
    parameters: [
      {
        name: "seconds",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add_ms",
    module: "type:date",
    description: "Adds ms to a date value.",
    example: "date.add_ms(milliseconds)",
    returnType: "date",
    parameters: [
      {
        name: "milliseconds",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "weekday",
    module: "type:date",
    description: "Returns the result of date.weekday().",
    example: "date.weekday()",
    returnType: "int",
    parameters: []
  },
  {
    name: "day_of_year",
    module: "type:date",
    description: "Returns the result of date.day of year().",
    example: "date.day_of_year()",
    returnType: "int",
    parameters: []
  },
  {
    name: "days_in_month",
    module: "type:date",
    description: "Returns the result of date.days in month().",
    example: "date.days_in_month()",
    returnType: "int",
    parameters: []
  },
  {
    name: "is_leap_year",
    module: "type:date",
    description: "Checks whether a date value leap year.",
    example: "date.is_leap_year()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "date",
    module: "type:date",
    description: "Returns the result of date.date().",
    example: "date.date()",
    returnType: "date",
    parameters: []
  },
  {
    name: "before",
    module: "type:date",
    description: "Returns the result of date.before().",
    example: "date.before(other)",
    returnType: "bool",
    parameters: [
      {
        name: "other",
        expectedType: "date",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "after",
    module: "type:date",
    description: "Returns the result of date.after().",
    example: "date.after(other)",
    returnType: "bool",
    parameters: [
      {
        name: "other",
        expectedType: "date",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "compare",
    module: "type:date",
    description: "Returns the result of date.compare().",
    example: "date.compare(other)",
    returnType: "int",
    parameters: [
      {
        name: "other",
        expectedType: "date",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "to_utc",
    module: "type:date",
    description: "Converts a date value to utc.",
    example: "date.to_utc()",
    returnType: "date",
    parameters: []
  },
  {
    name: "to_local",
    module: "type:date",
    description: "Converts a date value to local.",
    example: "date.to_local()",
    returnType: "date",
    parameters: []
  },
  {
    name: "add",
    module: "type:dict",
    description: "Adds a value to data.",
    example: "data.add(key, value)",
    returnType: "none",
    parameters: [
      {
        name: "key",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "remove",
    module: "type:dict",
    description: "Removes a value from a dict value.",
    example: "data.remove(key)",
    returnType: "any",
    parameters: [
      {
        name: "key",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "get",
    module: "type:dict",
    description: "Gets a value from data.",
    example: "data.get(key, defaultValue)",
    returnType: "any",
    parameters: [
      {
        name: "key",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "default_value",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "contains_key",
    module: "type:dict",
    description: "Returns the result of data.contains key().",
    example: "data.contains_key(key)",
    returnType: "bool",
    parameters: [
      {
        name: "key",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "contains_value",
    module: "type:dict",
    description: "Returns the result of data.contains value().",
    example: "data.contains_value(value)",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "clear",
    module: "type:dict",
    description: "Removes all values from data.",
    example: "data.clear()",
    returnType: "none",
    parameters: []
  },
  {
    name: "keys",
    module: "type:dict",
    description: "Returns the result of data.keys().",
    example: "data.keys()",
    returnType: "list",
    parameters: []
  },
  {
    name: "values",
    module: "type:dict",
    description: "Returns the result of data.values().",
    example: "data.values()",
    returnType: "list",
    parameters: []
  },
  {
    name: "spawn",
    module: "flow",
    description: "Creates a worker pool with an optional worker count.",
    example: "workers = spawn(4)",
    returnType: "pool",
    parameters: [
      {
        name: "worker_count",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "lock",
    module: "flow",
    description: "Creates a lock for coordinating concurrent work.",
    example: "guard = lock()",
    returnType: "lock",
    parameters: []
  },
  {
    name: "exists",
    module: "fs",
    description: "Checks whether a file or directory exists.",
    example: "write(exists(\"notes.txt\"))",
    returnType: "bool",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "file",
    module: "fs",
    description: "Checks whether a path is an existing file.",
    example: "write(file(\"notes.txt\"))",
    returnType: "bool",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "dir",
    module: "fs",
    description: "Checks whether a path is an existing directory.",
    example: "write(dir(\"data\"))",
    returnType: "bool",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "read",
    module: "fs",
    description: "Reads all text from a file.",
    example: "text = read(\"notes.txt\")",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "write",
    module: "fs",
    description: "Writes text to a file, replacing existing content.",
    example: "write(\"notes.txt\", \"Hello\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "append",
    module: "fs",
    description: "Appends text to a file.",
    example: "append(\"notes.txt\", \"\\nNext line\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "delete",
    module: "fs",
    description: "Deletes a file or directory.",
    example: "delete(\"old.txt\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "copy",
    module: "fs",
    description: "Copies a file to a destination path.",
    example: "copy(\"from.txt\", \"to.txt\")",
    returnType: "none",
    parameters: [
      {
        name: "source",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "destination",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "move",
    module: "fs",
    description: "Moves a file to a destination path.",
    example: "move(\"draft.txt\", \"archive/draft.txt\")",
    returnType: "none",
    parameters: [
      {
        name: "source",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "destination",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "rename",
    module: "fs",
    description: "Renames a file within its current directory.",
    example: "rename(\"draft.txt\", \"final.txt\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "touch",
    module: "fs",
    description: "Creates a file when it does not exist.",
    example: "touch(\"notes.txt\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "mkdir",
    module: "fs",
    description: "Creates a directory and missing parent directories.",
    example: "mkdir(\"data/output\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "rmdir",
    module: "fs",
    description: "Deletes a directory, optionally including its contents.",
    example: "rmdir(\"cache\", true)",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "recursive",
        expectedType: "bool",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "list",
    module: "fs",
    description: "Lists file-system entries in a directory.",
    example: "items = list(\"data\")",
    returnType: "list",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "files",
    module: "fs",
    description: "Lists files in a directory.",
    example: "items = files(\"data\")",
    returnType: "list",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "dirs",
    module: "fs",
    description: "Lists subdirectories in a directory.",
    example: "items = dirs(\"data\")",
    returnType: "list",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "walk",
    module: "fs",
    description: "Lists file-system entries recursively.",
    example: "items = walk(\"data\")",
    returnType: "list",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "size",
    module: "fs",
    description: "Returns the byte size of a file.",
    example: "write(size(\"notes.txt\"))",
    returnType: "int",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "created",
    module: "fs",
    description: "Returns a path creation time in UTC.",
    example: "write(created(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "modified",
    module: "fs",
    description: "Returns a path last-modified time in UTC.",
    example: "write(modified(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "accessed",
    module: "fs",
    description: "Returns a path last-accessed time in UTC.",
    example: "write(accessed(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "readonly",
    module: "fs",
    description: "Checks whether a file is read-only.",
    example: "write(readonly(\"notes.txt\"))",
    returnType: "bool",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hidden",
    module: "fs",
    description: "Checks whether a path has the hidden attribute.",
    example: "write(hidden(\"notes.txt\"))",
    returnType: "bool",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "join",
    module: "fs",
    description: "Joins path segments using the platform separator.",
    example: "path = join(\"data\", \"notes.txt\")",
    returnType: "str",
    parameters: [
      {
        name: "paths",
        expectedType: "tuple",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "parent",
    module: "fs",
    description: "Returns the parent directory of a path.",
    example: "write(parent(\"data/notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "name",
    module: "fs",
    description: "Returns the file name portion of a path.",
    example: "write(name(\"data/notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "stem",
    module: "fs",
    description: "Returns a file name without its extension.",
    example: "write(stem(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "ext",
    module: "fs",
    description: "Returns the extension portion of a path.",
    example: "write(ext(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "absolute",
    module: "fs",
    description: "Returns the absolute form of a path.",
    example: "write(absolute(\"notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "relative",
    module: "fs",
    description: "Returns a path relative to another directory.",
    example: "write(relative(\"data\", \"data/notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "from",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "to",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "normalize",
    module: "fs",
    description: "Normalizes a path to its absolute form.",
    example: "write(normalize(\"data/../notes.txt\"))",
    returnType: "str",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "cwd",
    module: "fs",
    description: "Returns the current working directory.",
    example: "write(cwd())",
    returnType: "str",
    parameters: []
  },
  {
    name: "chdir",
    module: "fs",
    description: "Changes the current working directory.",
    example: "chdir(\"data\")",
    returnType: "none",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "temp",
    module: "fs",
    description: "Returns the system temporary directory.",
    example: "write(temp())",
    returnType: "str",
    parameters: []
  },
  {
    name: "home",
    module: "fs",
    description: "Returns the current user's home directory.",
    example: "write(home())",
    returnType: "str",
    parameters: []
  },
  {
    name: "exe",
    module: "fs",
    description: "Returns the current process executable path.",
    example: "write(exe())",
    returnType: "str",
    parameters: []
  },
  {
    name: "app",
    module: "fs",
    description: "Returns the application base directory.",
    example: "write(app())",
    returnType: "str",
    parameters: []
  },
  {
    name: "connect",
    module: "http",
    description: "Creates an HTTP client object.",
    example: "client = connect()",
    returnType: "http_client",
    parameters: []
  },
  {
    name: "set_header",
    module: "type:http_client",
    description: "Sets header on a http_client value.",
    example: "client.set_header(key, value)",
    returnType: "none",
    parameters: [
      {
        name: "key",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "clear_headers",
    module: "type:http_client",
    description: "Returns the result of client.clear headers().",
    example: "client.clear_headers()",
    returnType: "none",
    parameters: []
  },
  {
    name: "get",
    module: "type:http_client",
    description: "Gets a value from client.",
    example: "client.get(url)",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "get_async",
    module: "type:http_client",
    description: "Asynchronously sends a GET request and returns its response text.",
    example: "body = client.get_async(\"https://example.com\")",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "delete",
    module: "type:http_client",
    description: "Deletes a value from client.",
    example: "client.delete(url)",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "delete_async",
    module: "type:http_client",
    description: "Asynchronously sends a DELETE request and returns its response text.",
    example: "body = client.delete_async(\"https://example.com/item\")",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "post",
    module: "type:http_client",
    description: "Returns the result of client.post().",
    example: "client.post(url, body)",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "post_async",
    module: "type:http_client",
    description: "Asynchronously sends a POST request with text content.",
    example: "body = client.post_async(\"https://example.com\", \"data\")",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "put",
    module: "type:http_client",
    description: "Returns the result of client.put().",
    example: "client.put(url, body)",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "put_async",
    module: "type:http_client",
    description: "Asynchronously sends a PUT request with text content.",
    example: "body = client.put_async(\"https://example.com\", \"data\")",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "patch",
    module: "type:http_client",
    description: "Returns the result of client.patch().",
    example: "client.patch(url, body)",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "patch_async",
    module: "type:http_client",
    description: "Asynchronously sends a PATCH request with text content.",
    example: "body = client.patch_async(\"https://example.com\", \"data\")",
    returnType: "str",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "body",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "head",
    module: "type:http_client",
    description: "Returns the result of client.head().",
    example: "client.head(url)",
    returnType: "int",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "head_async",
    module: "type:http_client",
    description: "Asynchronously sends a HEAD request and returns its status code.",
    example: "status = client.head_async(\"https://example.com\")",
    returnType: "int",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "options",
    module: "type:http_client",
    description: "Returns the result of client.options().",
    example: "client.options(url)",
    returnType: "list",
    parameters: [
      {
        name: "url",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "options_async",
    module: "type:http_client",
    description: "Asynchronously lists HTTP methods allowed by an endpoint.",
    example: "methods = client.options_async(\"https://example.com\")",
    returnType: "list",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "attr",
    module: "inspect",
    description: "Lists available attributes for a value.",
    example: "write(attr(value))",
    returnType: "list",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "global",
    module: "inspect",
    description: "Returns the global namespace object.",
    example: "write(global())",
    returnType: "dict",
    parameters: []
  },
  {
    name: "getattr",
    module: "inspect",
    description: "Reads an attribute with an optional default.",
    example: "name = getattr(user, \"name\", \"guest\")",
    returnType: "any",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "default_value",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "hasattr",
    module: "inspect",
    description: "Checks whether an object has an attribute.",
    example: "write(hasattr(user, \"name\"))",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "setattr",
    module: "inspect",
    description: "Sets an attribute on an object.",
    example: "setattr(user, \"name\", \"Ada\")",
    returnType: "any",
    parameters: [
      {
        name: "value",
        expectedType: "object",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "new_value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "delattr",
    module: "inspect",
    description: "Deletes an attribute from an object.",
    example: "delattr(user, \"name\")",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "object",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "meta",
    module: "inspect",
    description: "Reads metadata from an object.",
    example: "write(meta(value, \"type\"))",
    returnType: "any",
    parameters: [
      {
        name: "value",
        expectedType: "object",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "write",
    module: "io",
    description: "Writes values to standard output.",
    example: "write(\"Hello\", \"UN\")",
    returnType: "none",
    parameters: [
      {
        name: "values",
        expectedType: "tuple",
        essential: false,
        optional: false,
        positional: true
      },
      {
        name: "sep",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "end",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "stream",
        expectedType: "stream",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "read",
    module: "io",
    description: "Reads one line from an input stream.",
    example: "name = read(\"Name: \")",
    returnType: "str",
    parameters: [
      {
        name: "prompt",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "input",
        expectedType: "stream",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "output",
        expectedType: "stream",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "open",
    module: "io",
    description: "Opens a sandbox-relative file stream.",
    example: "stream = open(\"notes.txt\", \"r\")",
    returnType: "stream",
    parameters: [
      {
        name: "path",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "mode",
        expectedType: "str",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "clear",
    module: "io",
    description: "Clears the active output stream.",
    example: "clear()",
    returnType: "none",
    parameters: []
  },
  {
    name: "array",
    module: "iter",
    description: "Creates an array from a value and dimensions.",
    example: "items = array(1, 3)",
    returnType: "list",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "size",
        expectedType: "int",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "range",
    module: "iter",
    description: "Creates a sequence of integers.",
    example: "for index in range(0, 3)\\n    write(index)",
    returnType: "iter",
    parameters: [
      {
        name: "start",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "end",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "step",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "counter",
    module: "iter",
    description: "Creates an unbounded integer counter.",
    example: "numbers = counter(0)",
    returnType: "counter",
    parameters: [
      {
        name: "start",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "reverse",
    module: "iter",
    description: "Iterates over values in reverse order.",
    example: "items = reverse(values)",
    returnType: "reverse",
    parameters: [
      {
        name: "obj",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "repeat",
    module: "iter",
    description: "Repeats an iterable a fixed number of times.",
    example: "items = repeat(values, 3)",
    returnType: "repeat",
    parameters: [
      {
        name: "obj",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "count",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "zip",
    module: "iter",
    description: "Combines corresponding values from iterables.",
    example: "pairs = zip(first, second)",
    returnType: "list",
    parameters: [
      {
        name: "iterables",
        expectedType: "iter",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "enumerate",
    module: "iter",
    description: "Pairs iterable values with their indexes.",
    example: "for pair in enumerate(items)\\n    write(pair)",
    returnType: "iter",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sum",
    module: "iter",
    description: "Adds all values in an iterable.",
    example: "write(sum(values))",
    returnType: "any",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "max",
    module: "iter",
    description: "Returns the greatest value in an iterable.",
    example: "write(max(values))",
    returnType: "any",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "min",
    module: "iter",
    description: "Returns the smallest value in an iterable.",
    example: "write(min(values))",
    returnType: "any",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "filter",
    module: "iter",
    description: "Keeps iterable values for which a predicate returns true.",
    example: "positives = filter(is_positive, values)",
    returnType: "list",
    parameters: [
      {
        name: "predicate",
        expectedType: "func",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "map",
    module: "iter",
    description: "Transforms every value in an iterable.",
    example: "doubled = map(double, values)",
    returnType: "list",
    parameters: [
      {
        name: "transform",
        expectedType: "func",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "take",
    module: "iter",
    description: "Takes a number of values from an iterable.",
    example: "first = take(3, values)",
    returnType: "list",
    parameters: [
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "skip",
    module: "iter",
    description: "Skips a number of values in an iterable.",
    example: "rest = skip(2, values)",
    returnType: "list",
    parameters: [
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "chain",
    module: "iter",
    description: "Concatenates multiple iterables into one sequence.",
    example: "items = chain(first, second)",
    returnType: "list",
    parameters: [
      {
        name: "iterables",
        expectedType: "iter",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "flatten",
    module: "iter",
    description: "Flattens nested iterable values.",
    example: "flat = flatten(groups)",
    returnType: "list",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "all",
    module: "iter",
    description: "Checks whether every iterable item matches a predicate.",
    example: "all(is_valid, values)",
    returnType: "bool",
    parameters: [
      {
        name: "predicate",
        expectedType: "func",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "any",
    module: "iter",
    description: "Checks whether at least one iterable item matches a predicate.",
    example: "any(is_ready, tasks)",
    returnType: "bool",
    parameters: [
      {
        name: "predicate",
        expectedType: "func",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "count",
    module: "iter",
    description: "Counts iterable items that match a predicate.",
    example: "write(count(is_even, values))",
    returnType: "int",
    parameters: [
      {
        name: "predicate",
        expectedType: "func",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sorted",
    module: "iter",
    description: "Returns iterable values in sorted order.",
    example: "ordered = sorted(values)",
    returnType: "list",
    parameters: [
      {
        name: "iterable",
        expectedType: "iter",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "take",
    module: "type:iter",
    description: "Returns the result of iterator.take().",
    example: "iterator.take(n)",
    returnType: "iter",
    parameters: [
      {
        name: "n",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "skip",
    module: "type:iter",
    description: "Returns the result of iterator.skip().",
    example: "iterator.skip(n)",
    returnType: "iter",
    parameters: [
      {
        name: "n",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "count",
    module: "type:iter",
    description: "Returns the result of iterator.count().",
    example: "iterator.count()",
    returnType: "int",
    parameters: []
  },
  {
    name: "to_list",
    module: "type:iter",
    description: "Converts a iter value to list.",
    example: "iterator.to_list()",
    returnType: "list",
    parameters: []
  },
  {
    name: "to_tuple",
    module: "type:iter",
    description: "Converts a iter value to tuple.",
    example: "iterator.to_tuple()",
    returnType: "tuple",
    parameters: []
  },
  {
    name: "map",
    module: "type:iter",
    description: "Returns the result of iterator.map().",
    example: "iterator.map(fn)",
    returnType: "iter",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "filter",
    module: "type:iter",
    description: "Returns the result of iterator.filter().",
    example: "iterator.filter(fn)",
    returnType: "iter",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "any",
    module: "type:iter",
    description: "Returns the result of iterator.any().",
    example: "iterator.any(fn)",
    returnType: "bool",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "all",
    module: "type:iter",
    description: "Returns the result of iterator.all().",
    example: "iterator.all(fn)",
    returnType: "bool",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sum",
    module: "type:iter",
    description: "Returns the result of iterator.sum().",
    example: "iterator.sum()",
    returnType: "any",
    parameters: []
  },
  {
    name: "first",
    module: "type:iter",
    description: "Returns the result of iterator.first().",
    example: "iterator.first()",
    returnType: "any",
    parameters: []
  },
  {
    name: "last",
    module: "type:iter",
    description: "Returns the result of iterator.last().",
    example: "iterator.last()",
    returnType: "any",
    parameters: []
  },
  {
    name: "add",
    module: "type:list",
    description: "Adds a value to items.",
    example: "items.add(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "extend",
    module: "type:list",
    description: "Adds values to items.",
    example: "items.extend(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "insert",
    module: "type:list",
    description: "Inserts a value into items.",
    example: "items.insert(obj, index)",
    returnType: "none",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "index",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "extend_insert",
    module: "type:list",
    description: "Returns the result of items.extend insert().",
    example: "items.extend_insert(obj, index)",
    returnType: "list",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "index",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "remove",
    module: "type:list",
    description: "Removes a value from a list value.",
    example: "items.remove(obj)",
    returnType: "bool",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "remove_at",
    module: "type:list",
    description: "Removes  at from a list value.",
    example: "items.remove_at(index)",
    returnType: "any",
    parameters: [
      {
        name: "index",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "index_of",
    module: "type:list",
    description: "Finds a value index in items.",
    example: "items.index_of(obj)",
    returnType: "int",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "contains",
    module: "type:list",
    description: "Checks whether items contains a value.",
    example: "items.contains(obj)",
    returnType: "bool",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "order",
    module: "type:list",
    description: "Returns the result of items.order().",
    example: "items.order(fn)",
    returnType: "list",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sort",
    module: "type:list",
    description: "Sorts items in place.",
    example: "items.sort()",
    returnType: "none",
    parameters: []
  },
  {
    name: "reverse",
    module: "type:list",
    description: "Reverses the order of items.",
    example: "items.reverse()",
    returnType: "none",
    parameters: []
  },
  {
    name: "binary_search",
    module: "type:list",
    description: "Returns the result of items.binary search().",
    example: "items.binary_search(obj)",
    returnType: "int",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "lower_bound",
    module: "type:list",
    description: "Returns the result of items.lower bound().",
    example: "items.lower_bound(obj)",
    returnType: "int",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "upper_bound",
    module: "type:list",
    description: "Returns the result of items.upper bound().",
    example: "items.upper_bound(obj)",
    returnType: "int",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hpush",
    module: "type:list",
    description: "Returns the result of items.hpush().",
    example: "items.hpush(obj)",
    returnType: "none",
    parameters: [
      {
        name: "obj",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hpop",
    module: "type:list",
    description: "Returns the result of items.hpop().",
    example: "items.hpop()",
    returnType: "any",
    parameters: []
  },
  {
    name: "pop",
    module: "type:list",
    description: "Returns the result of items.pop().",
    example: "items.pop(index)",
    returnType: "any",
    parameters: [
      {
        name: "index",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "map",
    module: "type:list",
    description: "Returns the result of items.map().",
    example: "items.map(type)",
    returnType: "list",
    parameters: [
      {
        name: "type",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "resize",
    module: "type:list",
    description: "Returns the result of items.resize().",
    example: "items.resize()",
    returnType: "none",
    parameters: []
  },
  {
    name: "acquire",
    module: "type:lock",
    description: "Returns the result of guard.acquire().",
    example: "guard.acquire()",
    returnType: "none",
    parameters: []
  },
  {
    name: "try_acquire",
    module: "type:lock",
    description: "Returns the result of guard.try acquire().",
    example: "guard.try_acquire()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "release",
    module: "type:lock",
    description: "Returns the result of guard.release().",
    example: "guard.release()",
    returnType: "none",
    parameters: []
  },
  {
    name: "dispose",
    module: "type:lock",
    description: "Returns the result of guard.dispose().",
    example: "guard.dispose()",
    returnType: "none",
    parameters: []
  },
  {
    name: "round",
    module: "math",
    description: "Rounds a number to a number of digits.",
    example: "write(round(3.14159, 2))",
    returnType: "int | float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "digit",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "abs",
    module: "math",
    description: "Returns the absolute value of a number.",
    example: "write(abs(-5))",
    returnType: "int | float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "ceil",
    module: "math",
    description: "Rounds a number upward.",
    example: "write(ceil(2.1))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "floor",
    module: "math",
    description: "Rounds a number downward.",
    example: "write(floor(2.9))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "trunc",
    module: "math",
    description: "Removes the fractional part of a number.",
    example: "write(trunc(2.9))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sign",
    module: "math",
    description: "Returns the sign of a number.",
    example: "write(sign(-3))",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sqrt",
    module: "math",
    description: "Returns the square root of a number.",
    example: "write(sqrt(9))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "cbrt",
    module: "math",
    description: "Returns the cube root of a number.",
    example: "write(cbrt(27))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "pow",
    module: "math",
    description: "Raises a number to an exponent.",
    example: "write(pow(2, 8))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "exponent",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "exp",
    module: "math",
    description: "Returns e raised to a power.",
    example: "write(exp(2))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "log",
    module: "math",
    description: "Returns a logarithm with an optional base.",
    example: "write(log(8, 2))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "base",
        expectedType: "int | float",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "log2",
    module: "math",
    description: "Returns the base-2 logarithm.",
    example: "write(log2(8))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "log10",
    module: "math",
    description: "Returns the base-10 logarithm.",
    example: "write(log10(100))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sin",
    module: "math",
    description: "Returns the sine of an angle.",
    example: "write(sin(0))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "cos",
    module: "math",
    description: "Returns the cosine of an angle.",
    example: "write(cos(0))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "tan",
    module: "math",
    description: "Returns the tangent of an angle.",
    example: "write(tan(0))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "asin",
    module: "math",
    description: "Returns the arcsine of a number.",
    example: "write(asin(0))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "acos",
    module: "math",
    description: "Returns the arccosine of a number.",
    example: "write(acos(0))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "atan",
    module: "math",
    description: "Returns the arctangent of a number.",
    example: "write(atan(1))",
    returnType: "float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "atan2",
    module: "math",
    description: "Returns the angle for y and x coordinates.",
    example: "write(atan2(y, x))",
    returnType: "float",
    parameters: [
      {
        name: "y",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "x",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "hypot",
    module: "math",
    description: "Returns the hypotenuse for two coordinates.",
    example: "write(hypot(3, 4))",
    returnType: "float",
    parameters: [
      {
        name: "x",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "y",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "clamp",
    module: "math",
    description: "Limits a number to a minimum and maximum.",
    example: "write(clamp(score, 0, 100))",
    returnType: "int | float",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "min",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "max",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "gcd",
    module: "math",
    description: "Returns the greatest common divisor.",
    example: "write(gcd(12, 18))",
    returnType: "int",
    parameters: [
      {
        name: "a",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "b",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "lcm",
    module: "math",
    description: "Returns the least common multiple.",
    example: "write(lcm(4, 6))",
    returnType: "int",
    parameters: [
      {
        name: "a",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "b",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "is_nan",
    module: "math",
    description: "Checks whether a number is not-a-number.",
    example: "write(is_nan(value))",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "is_infinite",
    module: "math",
    description: "Checks whether a number is infinite.",
    example: "write(is_infinite(value))",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "is_finite",
    module: "math",
    description: "Checks whether a number is finite.",
    example: "write(is_finite(value))",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "int | float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "pi",
    module: "math",
    description: "Returns the mathematical constant pi.",
    example: "write(pi())",
    returnType: "float",
    parameters: []
  },
  {
    name: "e",
    module: "math",
    description: "Returns Euler's number.",
    example: "write(e())",
    returnType: "float",
    parameters: []
  },
  {
    name: "tau",
    module: "math",
    description: "Returns the mathematical constant tau.",
    example: "write(tau())",
    returnType: "float",
    parameters: []
  },
  {
    name: "env",
    module: "os",
    description: "Reads an environment variable by name.",
    example: "write(env(\"HOME\"))",
    returnType: "str",
    parameters: [
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "setenv",
    module: "os",
    description: "Sets an environment variable.",
    example: "setenv(\"MODE\", \"test\")",
    returnType: "none",
    parameters: [
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "value",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "unsetenv",
    module: "os",
    description: "Removes an environment variable.",
    example: "unsetenv(\"MODE\")",
    returnType: "none",
    parameters: [
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "environ",
    module: "os",
    description: "Returns all environment variables as text entries.",
    example: "values = environ()",
    returnType: "list",
    parameters: []
  },
  {
    name: "expand_vars",
    module: "os",
    description: "Expands environment-variable placeholders in text.",
    example: "path = expand_vars(\"$HOME/data\")",
    returnType: "str",
    parameters: [
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "pid",
    module: "os",
    description: "Returns the current process identifier.",
    example: "write(pid())",
    returnType: "int",
    parameters: []
  },
  {
    name: "name",
    module: "os",
    description: "Returns the current operating-system name.",
    example: "write(name())",
    returnType: "str",
    parameters: []
  },
  {
    name: "arch",
    module: "os",
    description: "Returns the operating-system architecture.",
    example: "write(arch())",
    returnType: "str",
    parameters: []
  },
  {
    name: "version",
    module: "os",
    description: "Returns the operating-system version.",
    example: "write(version())",
    returnType: "str",
    parameters: []
  },
  {
    name: "cpuCount",
    module: "os",
    description: "Returns the available processor count.",
    example: "write(cpuCount())",
    returnType: "int",
    parameters: []
  },
  {
    name: "is64bit",
    module: "os",
    description: "Checks whether the operating system is 64-bit.",
    example: "write(is64bit())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "hostname",
    module: "os",
    description: "Returns the current machine host name.",
    example: "write(hostname())",
    returnType: "str",
    parameters: []
  },
  {
    name: "username",
    module: "os",
    description: "Returns the current operating-system user name.",
    example: "write(username())",
    returnType: "str",
    parameters: []
  },
  {
    name: "args",
    module: "os",
    description: "Returns the process command-line arguments.",
    example: "values = args()",
    returnType: "list",
    parameters: []
  },
  {
    name: "sep",
    module: "os",
    description: "Returns the directory separator character.",
    example: "write(sep())",
    returnType: "str",
    parameters: []
  },
  {
    name: "pathsep",
    module: "os",
    description: "Returns the path-list separator character.",
    example: "write(pathsep())",
    returnType: "str",
    parameters: []
  },
  {
    name: "linesep",
    module: "os",
    description: "Returns the environment line separator.",
    example: "write(linesep())",
    returnType: "str",
    parameters: []
  },
  {
    name: "tickCount",
    module: "os",
    description: "Returns elapsed system ticks in milliseconds.",
    example: "write(tickCount())",
    returnType: "int",
    parameters: []
  },
  {
    name: "exit",
    module: "os",
    description: "Stops the current process with an optional exit code.",
    example: "exit(0)",
    returnType: "list",
    parameters: [
      {
        name: "code",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "exec",
    module: "os",
    description: "Runs a shell command and returns its standard output.",
    example: "output = exec(\"echo hello\")",
    returnType: "str",
    parameters: [
      {
        name: "command",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "submit",
    module: "type:pool",
    description: "Returns the result of workers.submit().",
    example: "workers.submit(fn, args)",
    returnType: "any",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "args",
        expectedType: "any",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "map",
    module: "type:pool",
    description: "Returns the result of workers.map().",
    example: "workers.map(fn, vargs)",
    returnType: "list",
    parameters: [
      {
        name: "fn",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "vargs",
        expectedType: "any",
        essential: false,
        optional: false,
        positional: true
      }
    ]
  },
  {
    name: "close",
    module: "type:pool",
    description: "Closes workers.",
    example: "workers.close()",
    returnType: "none",
    parameters: []
  },
  {
    name: "random",
    module: "random",
    description: "Creates a random-number generator object.",
    example: "generator = random()",
    returnType: "random",
    parameters: []
  },
  {
    name: "next",
    module: "random",
    description: "Returns a non-negative pseudo-random integer.",
    example: "write(next())",
    returnType: "int",
    parameters: []
  },
  {
    name: "int",
    module: "random",
    description: "Returns a random integer in an inclusive range.",
    example: "value = int(1, 6)",
    returnType: "random",
    parameters: [
      {
        name: "min",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "max",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "float",
    module: "random",
    description: "Returns a random floating-point value, optionally within a range.",
    example: "value = float(0.0, 1.0)",
    returnType: "float",
    parameters: [
      {
        name: "min",
        expectedType: "float",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "max",
        expectedType: "float",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "bool",
    module: "random",
    description: "Returns a pseudo-random boolean value.",
    example: "write(bool())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "bytes",
    module: "random",
    description: "Returns a list of pseudo-random byte values.",
    example: "values = bytes(16)",
    returnType: "list",
    parameters: [
      {
        name: "length",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "shuffle",
    module: "random",
    description: "Shuffles a list in place.",
    example: "shuffle(items)",
    returnType: "none",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "choice",
    module: "random",
    description: "Returns a random value from a list.",
    example: "item = choice(items)",
    returnType: "any",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "choices",
    module: "random",
    description: "Returns multiple random values from a list with replacement.",
    example: "items = choices(values, 3)",
    returnType: "list",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sample",
    module: "random",
    description: "Returns unique random values from a list.",
    example: "items = sample(values, 3)",
    returnType: "list",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "chance",
    module: "random",
    description: "Returns true according to a probability from zero to one.",
    example: "if chance(0.25)\\n    write(\"selected\")",
    returnType: "bool",
    parameters: [
      {
        name: "probability",
        expectedType: "float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "seed",
    module: "random",
    description: "Sets the shared pseudo-random generator seed.",
    example: "seed(42)",
    returnType: "none",
    parameters: [
      {
        name: "seed",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "uuid",
    module: "random",
    description: "Returns a new UUID string.",
    example: "id = uuid()",
    returnType: "str",
    parameters: []
  },
  {
    name: "str",
    module: "random",
    description: "Returns an alphanumeric pseudo-random string.",
    example: "token = string(12)",
    returnType: "str",
    parameters: [
      {
        name: "length",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "weighted",
    module: "random",
    description: "Returns a list value selected by matching numeric weights.",
    example: "item = weighted(values, weights)",
    returnType: "any",
    parameters: [
      {
        name: "values",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "weights",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "range",
    module: "random",
    description: "Returns a shuffled list of integers in a range.",
    example: "values = range(1, 10)",
    returnType: "list",
    parameters: [
      {
        name: "start",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "end",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "value",
    module: "random",
    description: "Returns a random value from an enum instance.",
    example: "status = value(Status)",
    returnType: "enum",
    parameters: [
      {
        name: "obj",
        expectedType: "enum",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "next",
    module: "type:random",
    description: "Returns a non-negative pseudo-random integer.",
    example: "write(generator.next())",
    returnType: "int",
    parameters: []
  },
  {
    name: "int",
    module: "type:random",
    description: "Returns a random integer in an inclusive range.",
    example: "value = generator.int(1, 6)",
    returnType: "int",
    parameters: [
      {
        name: "min",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "max",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "float",
    module: "type:random",
    description: "Returns a random floating-point value, optionally within a range.",
    example: "value = generator.float(0.0, 1.0)",
    returnType: "float",
    parameters: [
      {
        name: "min",
        expectedType: "float",
        essential: false,
        optional: true,
        positional: false
      },
      {
        name: "max",
        expectedType: "float",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "bool",
    module: "type:random",
    description: "Returns a pseudo-random boolean value.",
    example: "write(generator.bool())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "bytes",
    module: "type:random",
    description: "Returns a list of pseudo-random byte values.",
    example: "values = generator.bytes(16)",
    returnType: "list",
    parameters: [
      {
        name: "length",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "shuffle",
    module: "type:random",
    description: "Shuffles a list in place.",
    example: "generator.shuffle(items)",
    returnType: "none",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "choice",
    module: "type:random",
    description: "Returns a random value from a list.",
    example: "item = generator.choice(items)",
    returnType: "any",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "choices",
    module: "type:random",
    description: "Returns multiple random values from a list with replacement.",
    example: "items = generator.choices(values, 3)",
    returnType: "list",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sample",
    module: "type:random",
    description: "Returns unique random values from a list.",
    example: "items = generator.sample(values, 3)",
    returnType: "list",
    parameters: [
      {
        name: "obj",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "count",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "chance",
    module: "type:random",
    description: "Returns true according to a probability from zero to one.",
    example: "generator.chance(0.25)",
    returnType: "bool",
    parameters: [
      {
        name: "probability",
        expectedType: "float",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "seed",
    module: "type:random",
    description: "Sets this generator's pseudo-random seed.",
    example: "generator.seed(42)",
    returnType: "none",
    parameters: [
      {
        name: "seed",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "uuid",
    module: "type:random",
    description: "Returns a new UUID string.",
    example: "id = generator.uuid()",
    returnType: "str",
    parameters: []
  },
  {
    name: "str",
    module: "type:random",
    description: "Returns an alphanumeric pseudo-random string.",
    example: "token = generator.string(12)",
    returnType: "str",
    parameters: [
      {
        name: "length",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "weighted",
    module: "type:random",
    description: "Returns a list value selected by matching numeric weights.",
    example: "item = generator.weighted(values, weights)",
    returnType: "any",
    parameters: [
      {
        name: "values",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "weights",
        expectedType: "list",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "range",
    module: "type:random",
    description: "Returns a shuffled list of integers in a range.",
    example: "values = generator.range(1, 10)",
    returnType: "list",
    parameters: [
      {
        name: "start",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "end",
        expectedType: "int",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "value",
    module: "type:random",
    description: "Returns a random value from an enum instance.",
    example: "status = generator.value(Status)",
    returnType: "any",
    parameters: [
      {
        name: "obj",
        expectedType: "enum",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "test",
    module: "re",
    description: "Checks whether text matches a pattern.",
    example: "write(test(\"\\d+\", text))",
    returnType: "bool",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "match",
    module: "re",
    description: "Matches a pattern at the start of text.",
    example: "write(match(\"^UN\", text))",
    returnType: "any",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "search",
    module: "re",
    description: "Searches text for a pattern match.",
    example: "write(search(\"UN\", text))",
    returnType: "any",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "find_all",
    module: "re",
    description: "Finds every regular-expression match.",
    example: "matches = find_all(\"\\d+\", text)",
    returnType: "list",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "groups",
    module: "re",
    description: "Returns capture groups from a match.",
    example: "write(groups(pattern, text))",
    returnType: "tuple",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "replace",
    module: "re",
    description: "Replaces the first pattern match.",
    example: "result = replace(\"cat\", text, \"dog\")",
    returnType: "str",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "replacement",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "replace_all",
    module: "re",
    description: "Replaces every pattern match.",
    example: "result = replace_all(\"\\s+\", text, \" \")",
    returnType: "str",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "replacement",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "split",
    module: "re",
    description: "Splits text on a regular-expression pattern.",
    example: "parts = split(\",\\s*\", text)",
    returnType: "list",
    parameters: [
      {
        name: "pattern",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "escape",
    module: "re",
    description: "Escapes text for a regular expression.",
    example: "write(escape(\"a+b\"))",
    returnType: "str",
    parameters: [
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "add",
    module: "type:set",
    description: "Adds a value to values.",
    example: "values.add(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "remove",
    module: "type:set",
    description: "Removes a value from a set value.",
    example: "values.remove(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "contains",
    module: "type:set",
    description: "Checks whether values contains a value.",
    example: "values.contains(value)",
    returnType: "boolean",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "clear",
    module: "type:set",
    description: "Removes all values from values.",
    example: "values.clear()",
    returnType: "none",
    parameters: []
  },
  {
    name: "clone",
    module: "type:set",
    description: "Returns the result of values.clone().",
    example: "values.clone()",
    returnType: "set",
    parameters: []
  },
  {
    name: "union",
    module: "type:set",
    description: "Returns the result of values.union().",
    example: "values.union(other)",
    returnType: "set",
    parameters: [
      {
        name: "other",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "intersect",
    module: "type:set",
    description: "Returns the result of values.intersect().",
    example: "values.intersect(other)",
    returnType: "set",
    parameters: [
      {
        name: "other",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "difference",
    module: "type:set",
    description: "Returns the result of values.difference().",
    example: "values.difference(other)",
    returnType: "set",
    parameters: [
      {
        name: "other",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "start",
    module: "type:stopwatch",
    description: "Starts timer.",
    example: "timer.start()",
    returnType: "none",
    parameters: []
  },
  {
    name: "stop",
    module: "type:stopwatch",
    description: "Stops timer.",
    example: "timer.stop()",
    returnType: "none",
    parameters: []
  },
  {
    name: "reset",
    module: "type:stopwatch",
    description: "Resets timer.",
    example: "timer.reset()",
    returnType: "none",
    parameters: []
  },
  {
    name: "lap",
    module: "type:stopwatch",
    description: "Returns the result of timer.lap().",
    example: "timer.lap()",
    returnType: "int",
    parameters: []
  },
  {
    name: "restart",
    module: "type:stopwatch",
    description: "Restarts timer.",
    example: "timer.restart()",
    returnType: "none",
    parameters: []
  },
  {
    name: "is_running",
    module: "type:stopwatch",
    description: "Checks whether a stopwatch value running.",
    example: "timer.is_running()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "tick",
    module: "type:stopwatch",
    description: "Returns the result of timer.tick().",
    example: "timer.tick()",
    returnType: "int",
    parameters: []
  },
  {
    name: "ms",
    module: "type:stopwatch",
    description: "Returns the result of timer.ms().",
    example: "timer.ms()",
    returnType: "int",
    parameters: []
  },
  {
    name: "seconds",
    module: "type:stopwatch",
    description: "Returns the result of timer.seconds().",
    example: "timer.seconds()",
    returnType: "float",
    parameters: []
  },
  {
    name: "minutes",
    module: "type:stopwatch",
    description: "Returns the result of timer.minutes().",
    example: "timer.minutes()",
    returnType: "float",
    parameters: []
  },
  {
    name: "hours",
    module: "type:stopwatch",
    description: "Returns the result of timer.hours().",
    example: "timer.hours()",
    returnType: "float",
    parameters: []
  },
  {
    name: "elapsed",
    module: "type:stopwatch",
    description: "Returns the result of timer.elapsed().",
    example: "timer.elapsed()",
    returnType: "date",
    parameters: []
  },
  {
    name: "is_empty",
    module: "type:str",
    description: "Checks whether a str value empty.",
    example: "text.is_empty()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "is_number",
    module: "type:str",
    description: "Checks whether a str value number.",
    example: "text.is_number()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "is_alphabet",
    module: "type:str",
    description: "Checks whether a str value alphabet.",
    example: "text.is_alphabet()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "index_of",
    module: "type:str",
    description: "Finds a value index in text.",
    example: "text.index_of(value)",
    returnType: "int",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "contains",
    module: "type:str",
    description: "Checks whether text contains a value.",
    example: "text.contains(value)",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "starts_with",
    module: "type:str",
    description: "Returns the result of text.starts with().",
    example: "text.starts_with(value)",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "ends_with",
    module: "type:str",
    description: "Returns the result of text.ends with().",
    example: "text.ends_with(value)",
    returnType: "bool",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "to_upper",
    module: "type:str",
    description: "Converts a str value to upper.",
    example: "text.to_upper()",
    returnType: "str",
    parameters: []
  },
  {
    name: "to_lower",
    module: "type:str",
    description: "Converts a str value to lower.",
    example: "text.to_lower()",
    returnType: "str",
    parameters: []
  },
  {
    name: "split",
    module: "type:str",
    description: "Returns the result of text.split().",
    example: "text.split(sep)",
    returnType: "list",
    parameters: [
      {
        name: "sep",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "trim",
    module: "type:str",
    description: "Returns the result of text.trim().",
    example: "text.trim(chars)",
    returnType: "str",
    parameters: [
      {
        name: "chars",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "join",
    module: "type:str",
    description: "Returns the result of text.join().",
    example: "text.join(values)",
    returnType: "str",
    parameters: [
      {
        name: "values",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "center",
    module: "type:str",
    description: "Returns the result of text.center().",
    example: "text.center(width, fill)",
    returnType: "str",
    parameters: [
      {
        name: "width",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "fill",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "left",
    module: "type:str",
    description: "Returns the result of text.left().",
    example: "text.left(width, fill)",
    returnType: "str",
    parameters: [
      {
        name: "width",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "fill",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "right",
    module: "type:str",
    description: "Returns the result of text.right().",
    example: "text.right(width, fill)",
    returnType: "str",
    parameters: [
      {
        name: "width",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "fill",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "replace",
    module: "type:str",
    description: "Returns the result of text.replace().",
    example: "text.replace(oldValue, newValue)",
    returnType: "str",
    parameters: [
      {
        name: "old_value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      },
      {
        name: "new_value",
        expectedType: "any",
        essential: false,
        optional: true,
        positional: false
      }
    ]
  },
  {
    name: "find",
    module: "type:str",
    description: "Returns the result of text.find().",
    example: "text.find(subStr)",
    returnType: "int",
    parameters: [
      {
        name: "sub_str",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "read",
    module: "type:stream",
    description: "Reads all remaining text from a stream.",
    example: "stream.read()",
    returnType: "str",
    parameters: []
  },
  {
    name: "read_line",
    module: "type:stream",
    description: "Reads the next line from a stream.",
    example: "line = stream.read_line()",
    returnType: "str",
    parameters: []
  },
  {
    name: "write",
    module: "type:stream",
    description: "Writes a value to a stream without a trailing line break.",
    example: "stream.write(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "write_line",
    module: "type:stream",
    description: "Writes a value and a trailing line break to a stream.",
    example: "stream.write_line(value)",
    returnType: "none",
    parameters: [
      {
        name: "value",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "flush",
    module: "type:stream",
    description: "Flushes buffered stream output.",
    example: "stream.flush()",
    returnType: "none",
    parameters: []
  },
  {
    name: "close",
    module: "type:stream",
    description: "Closes and disposes a stream.",
    example: "stream.close()",
    returnType: "none",
    parameters: []
  },
  {
    name: "seek",
    module: "type:stream",
    description: "Seeks to an absolute byte position in a stream.",
    example: "stream.seek(0)",
    returnType: "none",
    parameters: [
      {
        name: "position",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "position",
    module: "type:stream",
    description: "Returns the current byte position in a stream.",
    example: "write(stream.position())",
    returnType: "int",
    parameters: []
  },
  {
    name: "set_position",
    module: "type:stream",
    description: "Sets the current byte position in a stream.",
    example: "stream.set_position(0)",
    returnType: "none",
    parameters: [
      {
        name: "position",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "length",
    module: "type:stream",
    description: "Returns the stream length in bytes.",
    example: "write(stream.length())",
    returnType: "int",
    parameters: []
  },
  {
    name: "eof",
    module: "type:stream",
    description: "Checks whether a readable stream reached end of file.",
    example: "write(stream.eof())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "can_read",
    module: "type:stream",
    description: "Checks whether a stream supports reading.",
    example: "write(stream.can_read())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "can_write",
    module: "type:stream",
    description: "Checks whether a stream supports writing.",
    example: "write(stream.can_write())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "can_seek",
    module: "type:stream",
    description: "Checks whether a stream supports seeking.",
    example: "write(stream.can_seek())",
    returnType: "bool",
    parameters: []
  },
  {
    name: "env\", Description = \"Reads an environment variable by name.\", Example = \"write(sys.env(\\\"HOME\\\"))\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    module: "sys",
    description: "Reads an environment variable by name.\", Example = \"write(sys.env(\"HOME\"))\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    example: "write(sys.env(\"HOME\"))\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    returnType: "str\", ArgumentTypes = new[] { \"str\" }",
    parameters: [
      {
        name: "name",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "environ\", Description = \"Returns all environment variables as text entries.\", Example = \"values = sys.environ()\", ReturnType = \"list",
    module: "sys",
    description: "Returns all environment variables as text entries.\", Example = \"values = sys.environ()\", ReturnType = \"list",
    example: "values = sys.environ()\", ReturnType = \"list",
    returnType: "list",
    parameters: []
  },
  {
    name: "expand_vars\", Description = \"Expands environment-variable placeholders in text.\", Example = \"path = sys.expand_vars(\\\"$HOME/data\\\")\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    module: "sys",
    description: "Expands environment-variable placeholders in text.\", Example = \"path = sys.expand_vars(\"$HOME/data\")\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    example: "path = sys.expand_vars(\"$HOME/data\")\", ReturnType = \"str\", ArgumentTypes = new[] { \"str\" }",
    returnType: "str\", ArgumentTypes = new[] { \"str\" }",
    parameters: [
      {
        name: "text",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "pid\", Description = \"Returns the current process identifier.\", Example = \"write(sys.pid())\", ReturnType = \"int",
    module: "sys",
    description: "Returns the current process identifier.\", Example = \"write(sys.pid())\", ReturnType = \"int",
    example: "write(sys.pid())\", ReturnType = \"int",
    returnType: "int",
    parameters: []
  },
  {
    name: "name\", Description = \"Returns the current operating-system name.\", Example = \"write(sys.name())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the current operating-system name.\", Example = \"write(sys.name())\", ReturnType = \"str",
    example: "write(sys.name())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "arch\", Description = \"Returns the operating-system architecture.\", Example = \"write(sys.arch())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the operating-system architecture.\", Example = \"write(sys.arch())\", ReturnType = \"str",
    example: "write(sys.arch())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "version\", Description = \"Returns the operating-system version.\", Example = \"write(sys.version())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the operating-system version.\", Example = \"write(sys.version())\", ReturnType = \"str",
    example: "write(sys.version())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "cpuCount\", Description = \"Returns the available processor count.\", Example = \"write(sys.cpuCount())\", ReturnType = \"int",
    module: "sys",
    description: "Returns the available processor count.\", Example = \"write(sys.cpuCount())\", ReturnType = \"int",
    example: "write(sys.cpuCount())\", ReturnType = \"int",
    returnType: "int",
    parameters: []
  },
  {
    name: "is64bit\", Description = \"Checks whether the operating system is 64-bit.\", Example = \"write(sys.is64bit())\", ReturnType = \"bool",
    module: "sys",
    description: "Checks whether the operating system is 64-bit.\", Example = \"write(sys.is64bit())\", ReturnType = \"bool",
    example: "write(sys.is64bit())\", ReturnType = \"bool",
    returnType: "bool",
    parameters: []
  },
  {
    name: "hostname\", Description = \"Returns the current machine host name.\", Example = \"write(sys.hostname())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the current machine host name.\", Example = \"write(sys.hostname())\", ReturnType = \"str",
    example: "write(sys.hostname())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "username\", Description = \"Returns the current operating-system user name.\", Example = \"write(sys.username())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the current operating-system user name.\", Example = \"write(sys.username())\", ReturnType = \"str",
    example: "write(sys.username())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "args\", Description = \"Returns the process command-line arguments.\", Example = \"values = sys.args()\", ReturnType = \"list",
    module: "sys",
    description: "Returns the process command-line arguments.\", Example = \"values = sys.args()\", ReturnType = \"list",
    example: "values = sys.args()\", ReturnType = \"list",
    returnType: "list",
    parameters: []
  },
  {
    name: "sep\", Description = \"Returns the directory separator character.\", Example = \"write(sys.sep())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the directory separator character.\", Example = \"write(sys.sep())\", ReturnType = \"str",
    example: "write(sys.sep())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "pathsep\", Description = \"Returns the path-list separator character.\", Example = \"write(sys.pathsep())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the path-list separator character.\", Example = \"write(sys.pathsep())\", ReturnType = \"str",
    example: "write(sys.pathsep())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "linesep\", Description = \"Returns the environment line separator.\", Example = \"write(sys.linesep())\", ReturnType = \"str",
    module: "sys",
    description: "Returns the environment line separator.\", Example = \"write(sys.linesep())\", ReturnType = \"str",
    example: "write(sys.linesep())\", ReturnType = \"str",
    returnType: "str",
    parameters: []
  },
  {
    name: "tickCount\", Description = \"Returns elapsed system ticks in milliseconds.\", Example = \"write(sys.tickCount())\", ReturnType = \"int",
    module: "sys",
    description: "Returns elapsed system ticks in milliseconds.\", Example = \"write(sys.tickCount())\", ReturnType = \"int",
    example: "write(sys.tickCount())\", ReturnType = \"int",
    returnType: "int",
    parameters: []
  },
  {
    name: "getcalldepth\", Description = \"Returns current maximum recursion depth.\", Example = \"write(sys.getcalldepth())\", ReturnType = \"int",
    module: "sys",
    description: "Returns current maximum recursion depth.\", Example = \"write(sys.getcalldepth())\", ReturnType = \"int",
    example: "write(sys.getcalldepth())\", ReturnType = \"int",
    returnType: "int",
    parameters: []
  },
  {
    name: "setcalldepth\", Description = \"Sets maximum recursion depth.\", Example = \"sys.setcalldepth(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    module: "sys",
    description: "Sets maximum recursion depth.\", Example = \"sys.setcalldepth(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    example: "sys.setcalldepth(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    returnType: "none\", ArgumentTypes = new[] { \"int\" }",
    parameters: [
      {
        name: "depth",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "getrecursionlimit\", Description = \"Returns current maximum recursion depth (alias).\", Example = \"write(sys.getrecursionlimit())\", ReturnType = \"int",
    module: "sys",
    description: "Returns current maximum recursion depth (alias).\", Example = \"write(sys.getrecursionlimit())\", ReturnType = \"int",
    example: "write(sys.getrecursionlimit())\", ReturnType = \"int",
    returnType: "int",
    parameters: []
  },
  {
    name: "setrecursionlimit\", Description = \"Sets maximum recursion depth (alias).\", Example = \"sys.setrecursionlimit(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    module: "sys",
    description: "Sets maximum recursion depth (alias).\", Example = \"sys.setrecursionlimit(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    example: "sys.setrecursionlimit(20000)\", ReturnType = \"none\", ArgumentTypes = new[] { \"int\" }",
    returnType: "none\", ArgumentTypes = new[] { \"int\" }",
    parameters: [
      {
        name: "depth",
        expectedType: "int",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "sleep",
    module: "time",
    description: "Waits for a number of milliseconds.",
    example: "sleep(250)",
    returnType: "none",
    parameters: [
      {
        name: "milliseconds",
        expectedType: "int | float",
        essential: false,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "now",
    module: "time",
    description: "Returns the current date and time.",
    example: "write(now())",
    returnType: "date",
    parameters: []
  },
  {
    name: "stopwatch",
    module: "time",
    description: "Creates a stopwatch object.",
    example: "timer = stopwatch()",
    returnType: "stopwatch",
    parameters: []
  },
  {
    name: "send",
    module: "type:web_socket",
    description: "Sends data through socket.",
    example: "socket.send(text)",
    returnType: "none",
    parameters: [
      {
        name: "text",
        expectedType: "any",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  },
  {
    name: "receive",
    module: "type:web_socket",
    description: "Receives data from socket.",
    example: "socket.receive()",
    returnType: "str",
    parameters: []
  },
  {
    name: "close",
    module: "type:web_socket",
    description: "Closes socket.",
    example: "socket.close()",
    returnType: "none",
    parameters: []
  },
  {
    name: "is_open",
    module: "type:web_socket",
    description: "Checks whether a web_socket value open.",
    example: "socket.is_open()",
    returnType: "bool",
    parameters: []
  },
  {
    name: "connect",
    module: "ws",
    description: "Connects to a WebSocket endpoint.",
    example: "socket = connect(\"wss://example.com\")",
    returnType: "web_socket",
    parameters: [
      {
        name: "url",
        expectedType: "str",
        essential: true,
        optional: false,
        positional: false
      }
    ]
  }
]
