import 'src/extenddayjs'
import 'src/styles/index.scss'
import { AppContext, ErrorStackContext } from './context'
import React, { lazy, Suspense, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Alert from 'react-bootstrap/Alert'
import { AppContextData } from 'src/types'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import { ErrorBoundary } from 'react-error-boundary'
import { List } from 'immutable'
import Row from 'react-bootstrap/Row'
import { SWRConfig } from 'swr'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

const Home = lazy(
    async () =>
        import(
            /* webpackPrefetch: true */
            /* webpackChunkName: "homepage" */
            './home'
        )
)

export default function Layout({ context }: { context: AppContextData }) {
    const [errors, setErrors] = useState(List<{ title: string; error: any }>())
    const toasts = useMemo(
        () => (
            <ToastContainer position="bottom-center">
                {errors.toArray().map(({ title, error }, i) => (
                    <Toast bg="danger" key={i} onClose={() => setErrors((errors) => errors.delete(i))}>
                        <Toast.Header closeButton>
                            <strong className="me-auto">Error</strong>
                            {title && <small>{title}</small>}
                        </Toast.Header>
                        <Toast.Body>{error.toString()}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        ),
        [errors]
    )

    function pushError(error: any) {
        setErrors((errors) => errors.push(error))
    }

    return (
        <AppContext.Provider value={context}>
            <ErrorStackContext.Provider value={{ errors, pushError }}>
                <SWRConfig
                    value={{
                        fallback: context.fallback,
                        keepPreviousData: true,
                        onError(error, title) {
                            pushError({ title, error })
                        },
                    }}>
                    <ErrorBoundary fallbackRender={ErrorFallback}>
                        <Routes>
                            <Route
                                key="home"
                                index
                                path="/"
                                element={
                                    <Suspense>
                                        <Home />
                                    </Suspense>
                                }
                            />
                            <Route key="404" path="*" element={<NotFound />} />
                        </Routes>
                        {toasts}
                    </ErrorBoundary>
                </SWRConfig>
            </ErrorStackContext.Provider>
        </AppContext.Provider>
    )
}

function NotFound() {
    return (
        <Container fluid>
            <Alert variant="danger">Page Not Found</Alert>
        </Container>
    )
}

function ErrorFallback() {
    return (
        <Container>
            <Row>
                <Col>
                    <h1>Internal Server Error</h1>
                    <p>
                        Server has encountered an unknown error.
                        <br />
                        Please reach out to the site administrator for assistance.
                    </p>
                </Col>
            </Row>
        </Container>
    )
}
