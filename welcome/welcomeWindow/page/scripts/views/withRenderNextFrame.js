export const withRenderNextFrame = fn => (...args) => requestAnimationFrame(() => fn(...args))
