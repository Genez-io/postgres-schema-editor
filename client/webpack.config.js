module.exports = {
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
          issuer: {
            and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
          },
        },
      ],
    },
  };
  