// Generated automatically with "fut". Do not edit.
using System;
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
		Int,
		Double,
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

	public class JsonParser
	{

		string text = "";

		int position = 0;

		readonly StringWriter builder = new StringWriter();

		TextWriter writer;

		public void Load(string text)
		{
			this.text = text;
			this.position = 0;
			this.builder.GetStringBuilder().Clear();
			this.writer = this.builder;
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
			this.builder.GetStringBuilder().Clear();
			while (!EndReached() && !PeekWordbreak()) {
				this.writer.Write((char) Read());
			}
			if (EndReached()) {
				return "";
			}
			return this.builder.ToString();
		}

		public void ParseNull()
		{
			if (PeekToken() != JsonToken.Null) {
				throw new Exception("Expected null");
			}
			ReadWord();
		}

		public double ParseNumber()
		{
			if (PeekToken() != JsonToken.Number) {
				throw new Exception("Expected number");
			}
			double d;
			if (double.TryParse(ReadWord(), out d)) {
				return d;
			}
			throw new Exception("Invalid number");
		}

		public string ParseString()
		{
			if (PeekToken() != JsonToken.String) {
				throw new Exception("Expected string");
			}
			this.builder.GetStringBuilder().Clear();
			Read();
			while (true) {
				if (EndReached())
					return "";
				int c = Read();
				switch (c) {
				case '"':
					return this.builder.ToString();
				case '\\':
					if (EndReached())
						return "";
					c = Read();
					switch (c) {
					case '"':
					case '\\':
					case '/':
						this.writer.Write((char) c);
						break;
					case 'b':
						this.writer.Write((char) 8);
						break;
					case 'f':
						this.writer.Write((char) 12);
						break;
					case 'n':
						this.writer.Write('\n');
						break;
					case 'r':
						this.writer.Write('\r');
						break;
					case 't':
						this.writer.Write('\t');
						break;
					case 'u':
						string hex = $"{Read()}{Read()}{Read()}{Read()}";
						int i;
						if (int.TryParse(hex, NumberStyles.HexNumber, null, out i)) {
							this.writer.Write((char) i);
						}
						else {
							throw new Exception("Invalid unicode escape");
						}
						break;
					}
					break;
				default:
					this.writer.Write((char) c);
					break;
				}
			}
		}
	}
}
