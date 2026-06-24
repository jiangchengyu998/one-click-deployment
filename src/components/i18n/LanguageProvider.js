"use client";

import { createContext, useContext, useMemo } from 'react';
import { defaultLocale, formatMessage, getDictionary, getPathValue } from '@/lib/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ locale = defaultLocale, children }) {
    const dictionary = useMemo(() => getDictionary(locale), [locale]);
    const value = useMemo(() => {
        const t = (key, values) => {
            const fallbackDictionary = getDictionary(defaultLocale);
            const message = getPathValue(dictionary, key) ?? getPathValue(fallbackDictionary, key) ?? key;
            return formatMessage(message, values);
        };

        return { locale, dictionary, t };
    }, [dictionary, locale]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useI18n must be used within LanguageProvider');
    }
    return context;
}
