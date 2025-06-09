export const isInCCloud = !!(window as any).SERVER_FLAGS?.basePath

export const isSingleApp = !(window as any).SERVER_FLAGS?.basePath