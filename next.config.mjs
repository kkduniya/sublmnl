let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore MongoDB and other native binary files
    config.externals = config.externals || []
    config.externals.push({
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      '@napi-rs/snappy-linux-x64-gnu': 'commonjs @napi-rs/snappy-linux-x64-gnu',
      '@napi-rs/snappy-linux-x64-musl': 'commonjs @napi-rs/snappy-linux-x64-musl',
      'kerberos': 'commonjs kerberos',
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      'snappy': 'commonjs snappy',
    })

    // Ignore binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    })

    return config
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
