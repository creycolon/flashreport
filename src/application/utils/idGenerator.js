/**
 * Simple random ID generator compatible with React Native and Web.
 * Avoids dependencies on crypto.getRandomValues().
 */
export const generateId = () => {
    return Math.random().toString(36).substring(2, 11) +
        Math.random().toString(36).substring(2, 11);
};
