import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import Cookies from 'universal-cookie'
import { List } from 'immutable'

export type ServerContextData = {
    event: APIGatewayProxyEventV2
    context: Context
    requestCookies: Cookies
    nonce: string
    statusCode: number
    cspDirectives: Readonly<Record<string, string[] | string | boolean>>
    headers: Record<string, string>
    cookies: string[]
}

export type AppContextData = {
    fallback: {
        [key: string]: any
    }
}

export type ErrorStackData = {
    errors: List<any>
    pushError: (error: any) => void
}
