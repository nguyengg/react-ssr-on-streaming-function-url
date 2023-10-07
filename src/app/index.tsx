import React, { startTransition, StrictMode } from 'react'
import { AppContextData } from 'src/types'
import { BrowserRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { hydrateRoot } from 'react-dom/client'
import Layout from './layout'

/* eslint-disable no-unused-vars */
declare global {
    interface Window {
        context: AppContextData
    }
}

function hydrate() {
    startTransition(() => {
        hydrateRoot(
            document.getElementById('app')!,
            <BrowserRouter>
                <CookiesProvider>
                    <StrictMode>
                        <Layout context={window.context} />
                    </StrictMode>
                </CookiesProvider>
            </BrowserRouter>
        )
    })
}

typeof requestIdleCallback === 'function' ? requestIdleCallback(hydrate) : setTimeout(hydrate, 1)
