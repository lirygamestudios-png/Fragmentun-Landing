/** Estado público de preparación de LIRY ID. No implica autenticación real. */
export const LIRY_ID_PUBLIC_ACCESS = Object.freeze({
  registrationEnabled: false,
  signInEnabled: false,
  recoveryEnabled: false,
  source: "pending_isolated_auth",
  message: "El acceso a LIRY ID estará disponible después de las verificaciones."
});
