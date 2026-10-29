
const clientId = "YOUR_CLIENT_ID";
const tenantId = "YOUR_TENANT_ID";
 
export const ssoConfigured = true;

  

  clientId !== "test-client-id" &&
  tenantId !== "test-client-id";
 
export const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
 
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};
 
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};