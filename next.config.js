const CopyPlugin = require("copy-webpack-plugin");

const output = process.env.NEXT_OUTPUT || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: "loose",
  },
  assetPrefix: process.env.BASE_PATH || "",
  basePath: process.env.BASE_PATH || "",
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || "",
  },
  optimizeFonts: false,
  webpack: (config, { webpack, buildId, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };

    if (isServer) {
      const blocked = [
        "onnxruntime-web",
        "onnxruntime-web/webgpu",
        "onnxruntime-web/wasm",
        "onnxruntime-web/all",
        "@xenova/transformers",
        "@ricky0123/vad-web",
      ];

      for (const pkg of blocked) {
        config.resolve.alias[pkg] = false;
        config.resolve.alias[`${pkg}$`] = false;
      }

      config.externals = config.externals || [];
      config.externals.push(...blocked);
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
            to: "static/chunks/[name][ext]",
            noErrorOnMissing: true,
          },
        ],
      }),
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NEXT_PUBLIC_CONFIG_BUILD_ID": JSON.stringify(buildId),
      }),
    );

    // Emergency unblock
    config.optimization = config.optimization || {};
    config.optimization.minimize = false;

    return config;
  },
};

module.exports = nextConfig;
