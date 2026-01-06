export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '*',

    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: '/admin',
        PROJECTS: '/admin/projects',
        PROJECT_DETAIL: '/admin/projects/:id',
    },

    CLIENT: {
        DASHBOARD: '/',
        PROJECTS: '/projects',
    },

    SHARED: {
        PROJECT: '/shared/:id',
    }
} as const

export const buildRoute = (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/')
}

export type RouteParams = {
    id?: string
    projectId?: string
}
