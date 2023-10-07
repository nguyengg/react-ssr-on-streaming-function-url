require('dotenv').config()

const cookieParser = require('cookie-parser')
const dayjs = require('dayjs')
const decache = require('decache')
const { merge } = require('webpack-merge')
const path = require('path')
const { parse } = require('set-cookie-parser')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

let indexFilepath = path.resolve(__dirname, 'dist/server/index.js')
if (!indexFilepath.startsWith('/')) {
    // need for Windows.
    indexFilepath = 'file:///' + indexFilepath
}

const remoteHost = process.env[`REMOTE_HOST`]

module.exports = (env, argv) => {
    const [server, app] = require('./webpack.config')(env, argv)

    server.devServer = {
        client: {
            progress: true,
        },
        devMiddleware: {
            index: true,
            serverSideRender: true,
            writeToDisk() {
                return true
            },
        },
        host: 'localhost',
        liveReload: true,
        onListening(devServer) {
            devServer.compiler.compilers
                .find(({ name }) => name === 'server')
                .hooks.afterCompile.tap('DecacheIndex', () => decache(indexFilepath))
        },
        setupMiddlewares(middlewares, devServer) {
            devServer.app.use(cookieParser())

            middlewares.push(async (req, res) => {
                // adapt between express Request/Response and Lambda.
                const originalUrl = req.originalUrl
                const indexOfQuery = originalUrl.indexOf('?')
                const event = {
                    rawPath: req.path,
                    rawQueryString: indexOfQuery >= 0 ? req.originalUrl.substring(indexOfQuery + 1) : '',
                    queryStringParameters: req.query,
                    cookies: Object.entries(req.cookies || {}).map(([key, value]) => `${key}=${value}`),
                    headers: {
                        'x-forwarded-for': req.ip,
                    },
                    requestContext: {
                        timeEpoch: dayjs().valueOf(),
                    },
                }

                // stub the global awslambda. our handler only uses two things so shouldn't be too bad.
                globalThis.awslambda = {
                    streamifyResponse(f) {
                        return f
                    },
                    HttpResponseStream: {
                        from(proxiedRes, { statusCode, headers, cookies }) {
                            // the _ is actually identical to res, so it doesn't matter which we use.
                            res.status(statusCode)
                            for (const [k, v] of Object.entries(headers)) {
                                res.append(k, v)
                            }
                            // AWS Lambda response's Cookies contains the entries that are Set-Cookie values such as:
                            // sid=1245; Secure; HttpOnly; SameSite=Lax.
                            // we'll use set-cookie-parse to parse them into something express can use.
                            const cookieMap = parse(cookies, { map: true })
                            Object.entries(cookieMap).forEach(([name, cookie]) =>
                                res.cookie(name, cookie.value, {
                                    expires: cookie.expires,
                                    httpOnly: cookie.httpOnly,
                                    path: cookie.path,
                                    sameSite: 'lax',
                                    secure: cookie.secure,
                                })
                            )

                            return proxiedRes
                        },
                    },
                }

                import(indexFilepath).then(async ({ handler }) => await handler(event, res))
            })

            return middlewares
        },
        port: 3000,
        proxy: {
            '/images': {
                changeOrigin: true,
                target: remoteHost,
            },
            '/videos': {
                changeOrigin: true,
                target: remoteHost,
            },
        },
        server: 'https',
        static: {
            directory: path.join(__dirname, 'public'),
            serveIndex: false,
        },
        watchFiles: {
            paths: ['./src/**/*', './public/**/*'],
            options: {
                usePolling: false,
            },
        },
    }

    return [
        server,
        merge(app, {
            plugins: [
                new WebpackManifestPlugin({
                    // we cannot have the default app config write to dist/server because of output.clean == true, which
                    // will clean the dist/server and dist/app in determined order.
                    fileName: '../server/manifest.json',
                    basePath: '/',
                }),
            ],
        }),
    ]
}
