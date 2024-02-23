using System.IO;
using System.Linq;
using System.Reflection;

namespace CsTests
{
    public class Fixtures
    {
        public static string GetFixturesDir()
        {
            return Path.GetFullPath(Assembly.GetExecutingAssembly()
                .GetCustomAttributes<AssemblyMetadataAttribute>()
                .Where(x => x.Key == "FixturesDir")
                .Single().Value);
        }
    }
}
