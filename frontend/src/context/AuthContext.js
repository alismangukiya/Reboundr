import { createContext, useState, useEffect, useMemo } from "react";
import { Cookies } from 'react-cookie';
const cookies = new Cookies();
const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedUserType = localStorage.getItem("userType");
        const storedToken = cookies.get("token") || localStorage.getItem("token");
        const storedUserData = localStorage.getItem("userData");
        if (storedUser && storedUserType) {
            setUser(storedUser);
            setUserType(storedUserType);
        }
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
        updateToken(storedToken);
    }, []);

    const updateToken = (newToken) => {
        if (newToken !== undefined) {
            console.log("newToken", newToken);
            cookies.set("token", newToken);
            localStorage.setItem("token", newToken);
            setToken(newToken);
        }
    };

    useEffect(() => {
        if (user !== undefined) {
            localStorage.setItem("user", user);
        }
        if (userType !== undefined) {
            localStorage.setItem("userType", userType);
        }
    }, [user, userType]);

    const value = useMemo(() => ({ user, setUser, token, setToken, updateToken, userType, setUserType, userData, setUserData }), [user, setUser, token, setToken, userType, setUserType, userData, setUserData]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };