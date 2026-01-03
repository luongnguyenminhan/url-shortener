export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '*',

    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: '/admin',
        PROJECTS: '/admin/projects',
    },

    CLIENT: {
        DASHBOARD: '/',
        PROJECTS: '/projects',
    }
} as const

export const buildRoute = (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/')
}

export type RouteParams = {
    id?: string
    projectId?: string
}
