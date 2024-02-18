// Generated automatically with "fut". Do not edit.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
namespace Velopack
{

	public enum JsonNodeType
	{
		Null,
		Bool,
		Array,
		Object,
		Number,
		String
	}

	enum JsonToken
	{
		None,
		CurlyOpen,
		CurlyClose,
		SquareOpen,
		SquareClose,
		Colon,
		Comma,
		String,
		Number,
		Bool,
		Null
	}

	public class JsonParseException : Exception
	{
		public JsonParseException() { }
		public JsonParseException(String message) : base(message) { }
		public JsonParseException(String message, Exception innerException) : base(message, innerException) { }
	}

	public class JsonNode
	{

		JsonNodeType Type = JsonNodeType.Null;

		readonly Dictionary<string, JsonNode> ObjectValue = new Dictionary<string, JsonNode>();

		readonly List<JsonNode> ArrayValue = new List<JsonNode>();

		string StringValue;

		double NumberValue;

		bool BoolValue;

		/// <summary>Get the type of this node, such as string, object, array, etc.</summary>
		/// <remarks>You should use this function and then call the corresponding
		/// AsObject, AsArray, AsString, etc. functions to get the actual
		/// parsed json information.</remarks>
		public JsonNodeType GetType()
		{
			return this.Type;
		}

		/// <summary>Check if the JSON value is null.</summary>
		public bool IsNull()
		{
			return this.Type == JsonNodeType.Null;
		}

		/// <summary>Reinterpret a JSON value as an object. Throws exception if the value type was not an object.</summary>
		public Dictionary<string, JsonNode> AsObject()
		{
			if (this.Type != JsonNodeType.Object) {
				throw new Exception("Cannot call AsObject on JsonNode which is not an object.");
			}
			return this.ObjectValue;
		}

		/// <summary>Reinterpret a JSON value as an array. Throws exception if the value type was not an array.</summary>
		public List<JsonNode> AsArray()
		{
			if (this.Type != JsonNodeType.Array) {
				throw new Exception("Cannot call AsArray on JsonNode which is not an array.");
			}
			return this.ArrayValue;
		}

		/// <summary>Reinterpret a JSON value as a number. Throws exception if the value type was not a double.</summary>
		public double AsNumber()
		{
			if (this.Type != JsonNodeType.Number) {
				throw new Exception("Cannot call AsNumber on JsonNode which is not a number.");
			}
			return this.NumberValue;
		}

		/// <summary>Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.</summary>
		public bool AsBool()
		{
			if (this.Type != JsonNodeType.Bool) {
				throw new Exception("Cannot call AsBool on JsonNode which is not a boolean.");
			}
			return this.BoolValue;
		}

		/// <summary>Reinterpret a JSON value as a string. Throws exception if the value type was not a string.</summary>
		public string AsString()
		{
			if (this.Type != JsonNodeType.String) {
				throw new Exception("Cannot call AsString on JsonNode which is not a string.");
			}
			return this.StringValue;
		}

		public static JsonNode Parse(string text)
		{
			JsonParser parser = new JsonParser();
			parser.Load(text);
			return parser.ParseValue();
		}

		internal void InitBool(bool value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitBool on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Bool;
			this.BoolValue = value;
		}

		internal void InitArray()
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitArray on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Array;
		}

		internal void AddArrayChild(JsonNode child)
		{
			if (this.Type != JsonNodeType.Array) {
				throw new JsonParseException("Cannot call AddArrayChild on JsonNode which is not an array.");
			}
			this.ArrayValue.Add(child);
		}

		internal void InitObject()
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitObject on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Object;
		}

		internal void AddObjectChild(string key, JsonNode child)
		{
			if (this.Type != JsonNodeType.Object) {
				throw new JsonParseException("Cannot call AddObjectChild on JsonNode which is not an object.");
			}
			this.ObjectValue[key] = child;
		}

		internal void InitNumber(double value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitNumber on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Number;
			this.NumberValue = value;
		}

		internal void InitString(string value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitString on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.String;
			this.StringValue = value;
		}
	}

	class StringAppendable
	{

		readonly StringWriter builder = new StringWriter();

		TextWriter writer;

		bool initialised;

		public void Clear()
		{
			this.builder.GetStringBuilder().Clear();
		}

		public void WriteChar(int c)
		{
			if (!this.initialised) {
				this.writer = this.builder;
				this.initialised = true;
			}
			this.writer.Write((char) c);
		}

		public override string ToString()
		{
			return this.builder.ToString();
		}
	}

	class JsonParser
	{

		string text = "";

		int position = 0;

		readonly StringAppendable builder = new StringAppendable();

		public void Load(string text)
		{
			this.text = text;
			this.position = 0;
		}

		public bool EndReached()
		{
			return this.position >= this.text.Length;
		}

		public int Read()
		{
			if (this.position >= this.text.Length) {
				return -1;
			}
			int c = this.text[this.position];
			this.position++;
			return c;
		}

		public int Peek()
		{
			if (this.position >= this.text.Length) {
				return -1;
			}
			return this.text[this.position];
		}

		public bool PeekWhitespace()
		{
			int c = Peek();
			return c == ' ' || c == '\t' || c == '\n' || c == '\r';
		}

		public bool PeekWordbreak()
		{
			int c = Peek();
			return c == ' ' || c == ',' || c == ':' || c == '"' || c == '{' || c == '}' || c == '[' || c == ']' || c == '\t' || c == '\n' || c == '\r';
		}

		JsonToken PeekToken()
		{
			EatWhitespace();
			if (EndReached())
				return JsonToken.None;
			switch (Peek()) {
			case '{':
				return JsonToken.CurlyOpen;
			case '}':
				return JsonToken.CurlyClose;
			case '[':
				return JsonToken.SquareOpen;
			case ']':
				return JsonToken.SquareClose;
			case ',':
				return JsonToken.Comma;
			case '"':
				return JsonToken.String;
			case ':':
				return JsonToken.Colon;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '-':
				return JsonToken.Number;
			case 't':
			case 'f':
				return JsonToken.Bool;
			case 'n':
				return JsonToken.Null;
			default:
				return JsonToken.None;
			}
		}

		public void EatWhitespace()
		{
			while (!EndReached() && PeekWhitespace()) {
				Read();
			}
		}

		public string ReadWord()
		{
			this.builder.Clear();
			while (!EndReached() && !PeekWordbreak()) {
				this.builder.WriteChar(Read());
			}
			if (EndReached()) {
				return "";
			}
			return this.builder.ToString();
		}

		public JsonNode ParseNull()
		{
			if (PeekToken() != JsonToken.Null) {
				throw new JsonParseException("Expected null");
			}
			ReadWord();
			JsonNode node = new JsonNode();
			return node;
		}

		public JsonNode ParseBool()
		{
			if (PeekToken() != JsonToken.Bool) {
				throw new JsonParseException("Expected null");
			}
			string boolValue = ReadWord();
			if (boolValue == "true") {
				JsonNode node = new JsonNode();
				node.InitBool(true);
				return node;
			}
			else if (boolValue == "false") {
				JsonNode node = new JsonNode();
				node.InitBool(false);
				return node;
			}
			else {
				throw new JsonParseException("Invalid boolean");
			}
		}

		public JsonNode ParseNumber()
		{
			if (PeekToken() != JsonToken.Number) {
				throw new JsonParseException("Expected number");
			}
			double d;
			if (double.TryParse(ReadWord(), out d)) {
				JsonNode node = new JsonNode();
				node.InitNumber(d);
				return node;
			}
			throw new JsonParseException("Invalid number");
		}

		public JsonNode ParseString()
		{
			if (PeekToken() != JsonToken.String) {
				throw new JsonParseException("Expected string");
			}
			this.builder.Clear();
			Read();
			while (true) {
				if (EndReached()) {
					throw new JsonParseException("Unterminated string");
				}
				int c = Read();
				switch (c) {
				case '"':
					JsonNode node = new JsonNode();
					node.InitString(this.builder.ToString());
					return node;
				case '\\':
					if (EndReached()) {
						throw new JsonParseException("Unterminated string");
					}
					c = Read();
					switch (c) {
					case '"':
					case '\\':
					case '/':
						this.builder.WriteChar(c);
						break;
					case 'b':
						this.builder.WriteChar(8);
						break;
					case 'f':
						this.builder.WriteChar(12);
						break;
					case 'n':
						this.builder.WriteChar('\n');
						break;
					case 'r':
						this.builder.WriteChar('\r');
						break;
					case 't':
						this.builder.WriteChar('\t');
						break;
					case 'u':
						StringAppendable hex = new StringAppendable();
						hex.WriteChar(Read());
						hex.WriteChar(Read());
						hex.WriteChar(Read());
						hex.WriteChar(Read());
						int i;
						if (int.TryParse(hex.ToString(), NumberStyles.HexNumber, null, out i)) {
							this.builder.WriteChar(i);
						}
						else {
							throw new JsonParseException("Invalid unicode escape");
						}
						break;
					}
					break;
				default:
					this.builder.WriteChar(c);
					break;
				}
			}
		}

		public JsonNode ParseObject()
		{
			if (PeekToken() != JsonToken.CurlyOpen) {
				throw new JsonParseException("Expected object");
			}
			Read();
			JsonNode node = new JsonNode();
			node.InitObject();
			while (true) {
				switch (PeekToken()) {
				case JsonToken.None:
					throw new JsonParseException("Unterminated object");
				case JsonToken.Comma:
					Read();
					continue;
				case JsonToken.CurlyClose:
					Read();
					return node;
				default:
					JsonNode name = ParseString();
					if (PeekToken() != JsonToken.Colon)
						throw new JsonParseException("Expected colon");
					Read();
					node.AddObjectChild(name.AsString(), ParseValue());
					break;
				}
			}
		}

		public JsonNode ParseValue()
		{
			switch (PeekToken()) {
			case JsonToken.String:
				return ParseString();
			case JsonToken.Number:
				return ParseNumber();
			case JsonToken.Bool:
				return ParseBool();
			case JsonToken.Null:
				return ParseNull();
			case JsonToken.CurlyOpen:
				return ParseObject();
			case JsonToken.SquareOpen:
				return ParseArray();
			default:
				throw new JsonParseException("Invalid token");
			}
		}

		public JsonNode ParseArray()
		{
			if (PeekToken() != JsonToken.SquareOpen) {
				throw new JsonParseException("Expected array");
			}
			Read();
			JsonNode node = new JsonNode();
			node.InitArray();
			bool expectComma = false;
			while (true) {
				switch (PeekToken()) {
				case JsonToken.None:
					throw new JsonParseException("Unterminated array");
				case JsonToken.Comma:
					if (!expectComma) {
						throw new JsonParseException("Unexpected comma in array");
					}
					expectComma = false;
					Read();
					continue;
				case JsonToken.SquareClose:
					Read();
					return node;
				default:
					if (expectComma) {
						throw new JsonParseException("Expected comma");
					}
					expectComma = true;
					node.AddArrayChild(ParseValue());
					break;
				}
			}
		}
	}
}
