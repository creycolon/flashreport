/**
 * Simple Spanish pluralization helper.
 * 
 * Rules:
 * - If ends in a, e, i, o, u -> add 's'
 * - If ends in a consonant -> add 'es'
 */
export const pluralizeSpanish = (word: string): string => {
    if (!word) return '';

    // Normalization to handle potential accents (simplified)
    const lastChar = word.slice(-1).toLowerCase();
    const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];

    if (vowels.includes(lastChar)) {
        return word + 's';
    }

    // Special case for words ending in 'z' -> 'ces' (e.g., Pez -> Peces)
    if (lastChar === 'z') {
        return word.slice(0, -1) + 'ces';
    }

    return word + 'es';
};
