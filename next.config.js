const { codeInspectorPlugin } = require('code-inspector-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	webpack: (config, { dev, isServer }) => {
		config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }));
		return config;
	}
};

module.exports = nextConfig 