import NodeResolve from 'rollup-plugin-node-resolve';

const baseConfig = format => ({
	input: 'lib/index.js',
	output: {
		file: `dist/index.${format}.js`,
		name: 'data-store',
		format,
	},
	plugins: [NodeResolve()]
});

export default [
	'amd', 'cjs', 'esm'
].map(baseConfig);
