import { env } from '../config/env.js';

// Custom error classes for translation errors
export class TranslationUnavailableError extends Error {
    constructor(message = 'Translation service unavailable') {
        super(message);
        this.name = 'TranslationUnavailableError';
    }
}

export class TranslationQuotaError extends Error {
    constructor() {
        super('Translation quota exceeded');
        this.name = 'TranslationQuotaError';
    }
}

// List of supported languages for translation
export const SUPPORTED_LANGUAGES = [
    'ES', 'FR', 'DE', 'IT', 'PT-BR', 'JA', 'ZH', 'KO', 'NL', 'PL',
];

// Timeout for translation requests in milliseconds
const TIMEOUT_MS = 5000;

// Function to translate an array of texts to a target language using DeepL API
export async function translateBatch(texts, targetLang) {
    if (!env.deeplApiKey) {
        throw new TranslationUnavailableError('Translation is not configured');
    }

    const nonEmpty = texts.filter((t) => t && t.trim().length > 0);
    if (nonEmpty.length === 0) return texts.map(() => null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const body = new URLSearchParams();
        for (const text of nonEmpty) body.append('text', text);
        body.append('target_lang', targetLang);
        body.append('source_lang', 'EN');

        const response = await fetch(`${env.deeplApiUrl}/translate`, {
            method: 'POST',
            headers: {
                Authorization: `DeepL-Auth-Key ${env.deeplApiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
            signal: controller.signal,
        });

        if (response.status === 456) throw new TranslationQuotaError();
        if (response.status === 429) throw new TranslationQuotaError();

        if (!response.ok) {
            throw new TranslationUnavailableError(
                `DeepL responded with ${response.status}`
            );
        }

        const data = await response.json();
        const translated = data.translations.map((t) => t.text);

        let i = 0;
        return texts.map((t) => (t && t.trim().length > 0 ? translated[i++] : null));
    } catch (err) {
        if (err instanceof TranslationQuotaError) throw err;
        if (err.name === 'AbortError') {
            throw new TranslationUnavailableError('Translation request timed out');
        }
        if (err instanceof TranslationUnavailableError) throw err;
        throw new TranslationUnavailableError();
    } finally {
        clearTimeout(timer);
    }
}