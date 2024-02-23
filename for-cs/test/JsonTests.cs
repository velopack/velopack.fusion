using System.IO;
using Xunit;

namespace CsTests
{
    public class JsonTests
    {
        [Theory]
        [InlineData("invalid-0000.json")]
        [InlineData("invalid-0001.json")]
        [InlineData("invalid-0002.json")]
        [InlineData("invalid-0003.json")]
        [InlineData("invalid-0004.json")]
        [InlineData("invalid-0005.json")]
        [InlineData("invalid-0006.json")]
        [InlineData("invalid-0007.json")]
        [InlineData("invalid-0008.json")]
        [InlineData("invalid-0009.json")]
        [InlineData("invalid-0010.json")]
        [InlineData("ext-invalid-0000.json")]
        [InlineData("ext-invalid-0001.json")]
        [InlineData("ext-invalid-0002.json")]
        public void InvalidJsonThrowsParseException(string fileName)
        {
            var dir = Fixtures.GetFixturesDir();
            var json = File.ReadAllText(Path.Combine(dir, fileName));
            Assert.Throws<Velopack.JsonParseException>(() => Velopack.JsonNode.Parse(json));

        }

        [Theory]
        [InlineData("valid-0000.json")]
        [InlineData("valid-0001.json")]
        [InlineData("valid-0002.json")]
        [InlineData("valid-0003.json")]
        [InlineData("valid-0004.json")]
        [InlineData("valid-0005.json")]
        [InlineData("valid-0006.json")]
        [InlineData("valid-0007.json")]
        [InlineData("valid-0008.json")]
        [InlineData("valid-0009.json")]
        [InlineData("valid-0010.json")]
        [InlineData("valid-0011.json")]
        [InlineData("valid-0012.json")]
        [InlineData("valid-0013.json")]
        [InlineData("valid-0014.json")]
        [InlineData("valid-0015.json")]
        [InlineData("ext-valid-0000.json")]
        [InlineData("ext-valid-0001.json")]
        [InlineData("ext-valid-0002.json")]
        [InlineData("ext-valid-0003.json")]

        public void ValidJsonCanParse(string fileName)
        {
            var dir = Fixtures.GetFixturesDir();
            var json = File.ReadAllText(Path.Combine(dir, fileName));
            Velopack.JsonNode.Parse(json);
        }

        [Fact]
        public void ParsesExponents()
        {
            var json = "{ \"min\": -1.0e+28, \"max\": 1.0e+28 }";
            var node = Velopack.JsonNode.Parse(json);

            Assert.Equal(-1.0e+28, node.AsObject()["min"].AsNumber());
            Assert.Equal(1.0e+28, node.AsObject()["max"].AsNumber());
        }

        [Fact]
        public void ParsesObjectCorrectly()
        {
            var json = "{\"status\": \"ok\", \"results\": [{\"recordings\": [{\"id\": \"889ec8e0-b8a6-4ff1-a104-5512ea49fe87\"}], /* block comment */ \"score\": 0.879051, \"id\": \"45047cb1-3d3f-477e-a3dc-f14e8254e78d\"}]}\r\n";
            var node = Velopack.JsonNode.Parse(json);
            Assert.Equal("ok", node.AsObject()["status"].AsString());
            var results = node.AsObject()["results"].AsArray();
            var result1 = results[0].AsObject();
            Assert.Equal(0.879051, result1["score"].AsNumber());
            Assert.Equal("45047cb1-3d3f-477e-a3dc-f14e8254e78d", result1["id"].AsString());
            var recordings = result1["recordings"].AsArray();
            Assert.Equal("889ec8e0-b8a6-4ff1-a104-5512ea49fe87", recordings[0].AsObject()["id"].AsString());
        }
    }
}
