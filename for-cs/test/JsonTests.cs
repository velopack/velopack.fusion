using Xunit;

namespace CsTests
{
    public class JsonTests
    {
        [Fact]
        public void InvalidBasicThrows()
        {
            var dir = Fixtures.GetFixturesDir();

            foreach (var f in Directory.EnumerateFiles(dir, "*.json"))
            {
                if (Path.GetFileName(f).StartsWith("invalid-"))
                {
                    var json = File.ReadAllText(f);
                    Assert.Throws<Velopack.JsonParseException>(() => Velopack.JsonNode.Parse(json));
                }
            }
        }

        [Fact]
        public void InvalidExtThrows()
        {
            var dir = Fixtures.GetFixturesDir();

            foreach (var f in Directory.EnumerateFiles(dir, "*.json"))
            {
                if (f.Contains(f) && !Path.GetFileName(f).StartsWith("invalid-"))
                {
                    var json = File.ReadAllText(f);
                    Assert.Throws<Velopack.JsonParseException>(() => Velopack.JsonNode.Parse(json));
                }
            }
        }
    }
}
