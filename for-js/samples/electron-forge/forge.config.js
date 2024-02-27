module.exports = {
  packagerConfig: {
    asar: {
      // velopack contains native binaries which must remain unpacked
      unpack: '**/node_modules/velopack/**',
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
