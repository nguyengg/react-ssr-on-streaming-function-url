const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

module.exports = (env, argv) => {
    const production = argv.mode === 'production' || process.env.NODE_ENV === 'production'
    const sourceMap = production

    const server = merge(
        {
            entry: {
                index: {
                    import: path.resolve(__dirname, 'src/server'),
                    // must always be index.js because the Lambda runtime looks for this index.handler to start.
                    filename: 'index.js',
                },
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.module\.s?css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true,
                                    sourceMap: production,
                                },
                            },
                            'resolve-url-loader',
                            'postcss-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                    sourceMap: production,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.s?css$/,
                        exclude: /\.module\.s?css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: false,
                                    sourceMap: production,
                                },
                            },
                            'resolve-url-loader',
                            'postcss-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                    sourceMap: production,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(png|jpe?g|gif|svg)$/i,
                        type: 'asset/resource',
                        generator: {
                            filename: 'images/[name][ext]',
                        },
                    },
                    {
                        test: /\.(eot|ttf|woff|woff2)$/i,
                        type: 'asset/resource',
                        generator: {
                            filename: 'css/fonts/[name][ext]',
                        },
                    },
                ],
            },
            name: 'server',
            output: {
                clean: true,
                path: path.resolve(__dirname, 'dist/server'),
                publicPath: '/',
            },
            plugins: [new ESLintPlugin()],
            resolve: {
                alias: {
                    src: path.resolve(__dirname, 'src'),
                },
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
            },
            target: 'node',
        },
        production
            ? {
                  devtool: 'source-map',
                  mode: 'production',
                  optimization: {
                      minimize: true,
                      minimizer: [
                          new TerserPlugin({
                              extractComments: false,
                              terserOptions: {
                                  output: {
                                      comments: false,
                                  },
                              },
                          }),
                          new CssMinimizerPlugin(),
                      ],
                  },
                  output: {
                      filename: '[name]-[contenthash].min.js',
                      chunkFilename: '[name]-[contenthash].min.js',
                  },
                  plugins: [
                      new MiniCssExtractPlugin({
                          filename: '[name]-[contenthash].min.css',
                          chunkFilename: '[name]-[contenthash].min.css',
                      }),
                  ],
                  stats: 'normal',
              }
            : {
                  devtool: 'inline-source-map',
                  mode: 'development',
                  plugins: [
                      new MiniCssExtractPlugin({
                          filename: '[name].css',
                          chunkFilename: '[name].css',
                      }),
                  ],
                  output: {
                      filename: '[name].js',
                      chunkFilename: '[name].js',
                  },
                  stats: 'minimal',
              }
    )

    const app = merge(
        {
            entry: {
                app: path.resolve(__dirname, 'src/app'),
            },
            externals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.module\.s?css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true,
                                    sourceMap,
                                },
                            },
                            'resolve-url-loader',
                            'postcss-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                    sourceMap,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.s?css$/,
                        exclude: /\.module\.s?css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: false,
                                    sourceMap,
                                },
                            },
                            'resolve-url-loader',
                            'postcss-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                    sourceMap,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(png|jpe?g|gif|svg)$/i,
                        type: 'asset/resource',
                        generator: {
                            filename: 'images/[name][ext]',
                        },
                    },
                    {
                        test: /\.(eot|ttf|woff|woff2)$/i,
                        type: 'asset/resource',
                        generator: {
                            filename: 'css/fonts/[name][ext]',
                        },
                    },
                ],
            },
            name: 'app',
            plugins: [
                new CopyPlugin({
                    patterns: [
                        { from: 'public' },
                        { from: 'node_modules/bootstrap-icons/bootstrap-icons.svg', to: 'images/bootstrap-icons.svg' },
                    ],
                }),
                new ESLintPlugin(),
                new WebpackManifestPlugin({
                    fileName: 'manifest.json',
                    basePath: '/',
                }),
            ],
            output: {
                clean: true,
                path: path.resolve(__dirname, 'dist/app'),
                publicPath: '/',
            },
            resolve: {
                alias: {
                    src: path.resolve(__dirname, 'src'),
                },
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
            },
            target: 'web',
        },
        production
            ? {
                  devtool: 'source-map',
                  mode: 'production',
                  optimization: {
                      minimize: true,
                      minimizer: [
                          new TerserPlugin({
                              extractComments: false,
                              terserOptions: {
                                  output: {
                                      comments: false,
                                  },
                              },
                          }),
                          new CssMinimizerPlugin(),
                      ],
                  },
                  output: {
                      filename: 'js/[name]-[contenthash].min.js',
                      chunkFilename: 'js/[name]-[contenthash].min.js',
                  },
                  plugins: [
                      new MiniCssExtractPlugin({
                          filename: 'css/[name]-[contenthash].min.css',
                          chunkFilename: 'css/[name]-[contenthash].min.css',
                      }),
                  ],
                  stats: 'normal',
              }
            : {
                  devtool: 'inline-source-map',
                  mode: 'development',
                  plugins: [
                      new MiniCssExtractPlugin({
                          filename: 'css/[name].css',
                          chunkFilename: 'css/[name].css',
                      }),
                  ],
                  output: {
                      filename: 'js/[name].js',
                      chunkFilename: 'js/[name].js',
                  },
                  stats: 'minimal',
              }
    )

    return [server, app]
}
