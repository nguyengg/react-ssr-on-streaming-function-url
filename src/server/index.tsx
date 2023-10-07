import 'src/extenddayjs'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import React, { StrictMode } from 'react'
import builder from 'content-security-policy-builder'
import Cookies from 'universal-cookie'
import { CookiesProvider } from 'react-cookie'
import crypto from 'crypto'
import Layout from 'src/app/layout'
import { manifest } from './manifest'
import { renderToPipeableStream } from 'react-dom/server'
import { ServerContextData } from 'src/types'
import { StaticRouter } from 'react-router-dom/server'

// @ts-ignore
exports.handler = awslambda.streamifyResponse(
    async (event: APIGatewayProxyEventV2, responseStream: any, context: Context) => {
        if (process.env['DEBUG'] === '1' || process.env['DEBUG'] === 'true') {
            console.log('Event:', JSON.stringify(event))
            console.log('Context:', JSON.stringify(context))
        }

        const nonce = crypto.randomBytes(12).toString('base64url')

        // there are two types of contexts: server and app context.
        // server context is passed around handlers in the src/server directory and is never sent to client browser.
        // handlers can customise the server context which contains settings that are pushed to client before React
        // rendering happens (headers, redirects, etc.).
        // app context is also passed around handlers but will eventually be sent to and rehydrated on client browser.
        // app context should contain initial values for swr, and must be serialisable with JSON.stringify and JSON.parse.
        const serverCtx: ServerContextData = {
            event,
            context,
            requestCookies: new Cookies((event.cookies ?? []).join('; ')),
            nonce,
            statusCode: 200,
            cspDirectives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", `'nonce-${nonce}'`],
                styleSrc: ["'self'"],
                styleSrcElem: ["'self'", 'https://cdn.jsdelivr.net'],
                fontSrc: ["'self'"],
                frameAncestors: ["'none'"],
                frameSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                mediaSrc: ["'self'", 'blob:'],
            },
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
            cookies: [],
        }
        const appCtx = {
            // TODO only for demonstration, remove later.
            xForwardedFor: event.headers['X-Forwarded-For'] || 'stranger',
            fallback: {},
        }

        function onError(err: any) {
            console.trace(err)

            // @ts-ignore
            responseStream = awslambda.HttpResponseStream.from(responseStream, {
                statusCode: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
                cookies: [],
            })
            responseStream.write('Internal Server Error')
            responseStream.end()
        }

        const { pipe } = renderToPipeableStream(
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
                    <link rel="stylesheet" href={manifest['/app.css']} />
                    <link rel="prefetch" as="image" href="/images/bootstrap-icons.svg" type="images/svg+xml" />
                    <title>hello, world!</title>
                </head>

                <body>
                    <div id="app">
                        <StaticRouter location={event.rawPath}>
                            <CookiesProvider cookies={serverCtx.requestCookies}>
                                <StrictMode>
                                    <Layout context={appCtx} />
                                </StrictMode>
                            </CookiesProvider>
                        </StaticRouter>
                    </div>

                    {process.env.NODE_ENV === 'production' ? (
                        <>
                            <script
                                nonce={nonce}
                                src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"
                                integrity="sha256-S0lp+k7zWUMk2ixteM6HZvu8L9Eh//OVrt+ZfbCpmgY="
                                crossOrigin="anonymous"
                            />
                            <script
                                nonce={nonce}
                                src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"
                                integrity="sha256-IXWO0ITNDjfnNXIu5POVfqlgYoop36bDzhodR6LW5Pc="
                                crossOrigin="anonymous"
                            />
                        </>
                    ) : (
                        <>
                            <script
                                nonce={nonce}
                                src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"
                                integrity="sha256-hXNk4rmCMYQXAl+5tLg1XAn3X6RroL6T9SD3afZ1eng="
                                crossOrigin="anonymous"
                            />
                            <script
                                nonce={nonce}
                                src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"
                                integrity="sha256-bRHakm3eFVwNh3OuDgW7ZGg/H0DU4etihxfdhJkXIoI="
                                crossOrigin="anonymous"
                            />
                        </>
                    )}
                </body>
            </html>,
            {
                bootstrapScriptContent: `window.context = ${JSON.stringify(appCtx)}`,
                bootstrapScripts: [manifest['/app.js']],
                nonce,
                onError,
                onShellError: onError,
                onShellReady() {
                    pipe(
                        // @ts-ignore
                        awslambda.HttpResponseStream.from(responseStream, {
                            statusCode: serverCtx.statusCode,
                            headers: {
                                ...serverCtx.headers,
                                'Content-Security-Policy': builder({ directives: serverCtx.cspDirectives }),
                            },
                            cookies: serverCtx.cookies,
                        })
                    )
                },
            }
        )
    }
)
