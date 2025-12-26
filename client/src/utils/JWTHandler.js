
// short duration token 
export function getJwtToken() {
    return (sessionStorage.getItem("jwtToken") || null);
}

export function setJwtToken(token) {
    sessionStorage.setItem("jwtToken", token);
}


// longer duration token 
export function getRefreshToken() {
    return (localStorage.getItem("refreshToken") || null);
}

export function setRefreshToken(token) {
    localStorage.setItem("refreshToken", token);
}

export function removeTokens() {
    sessionStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
}

export {getJwtToken, setJwtToken, getRefreshToken, setRefreshToken, removeTokens};