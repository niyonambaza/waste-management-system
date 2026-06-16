import React, { createContext, useState, useEffect } from 'react';

// 1. Kurema Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Igihe sisitemu itangiye, reba niba umuntu asanganywe token mu bubiko (localStorage)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Function yo kwinjira (Login)
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Function yo gushyiraho umukono mushya (Urugero niba ukoresha register itunganye)
    const register = (userData) => {
        // Ushobora no guhita umwinjiza hano cyangwa ukamureka akajya kuri login
    };

    // ⚠️ IYI NIYO YA BURAGA: Function yo gukora LOGOUT
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token'); // Niba ukoresha token
        localStorage.removeItem('user');  // Kura umuntu mu bubiko
    };

    return (
        // ⚠️ REBA HANO: Ni ingenzi ko 'logout' iba iri hano mu gice cya value!
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};