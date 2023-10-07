import { AppContextData, ErrorStackData } from 'src/types'
import { createContext } from 'react'
import { List } from 'immutable'

export const AppContext = createContext<AppContextData>({
    fallback: {},
})

export const ErrorStackContext = createContext<ErrorStackData>({
    errors: List(),
    pushError() {},
})
