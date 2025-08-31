export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {},
    },
    'cleanupIds',
    {
      name: 'convertPathData',
      params: { floatPrecision: 3 },
    },
  ],
}
