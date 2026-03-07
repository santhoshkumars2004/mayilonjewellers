import React, { createContext, useContext } from 'react';
import { useCollection } from '../hooks/useCollection';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    // Real-time settings from Firestore
    const settings = useCollection('settings');

    const getSetting = (key) => {
        if (!settings) return null;
        const s = settings.find(s => s.key === key);
        return s ? s.value : null;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const value = {
        settings,
        getSetting,
        formatCurrency,
        formatDate,
        formatDateTime,
        loading: !settings,
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
