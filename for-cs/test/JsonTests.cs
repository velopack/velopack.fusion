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

        //[Fact]
        //public void InvalidExtThrows()
        //{
        //    var dir = Fixtures.GetFixturesDir();

        //    foreach (var f in Directory.EnumerateFiles(dir, "*.json"))
        //    {
        //        if (f.Contains(f) && !Path.GetFileName(f).StartsWith("invalid-"))
        //        {
        //            var json = File.ReadAllText(f);
        //            Assert.Throws<Velopack.JsonParseException>(() => Velopack.JsonNode.Parse(json));
        //        }
        //    }
        //}
    }
}
