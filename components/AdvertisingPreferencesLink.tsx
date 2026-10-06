"use client";

export function AdvertisingPreferencesLink({locale}:{locale:"es"|"en"}){
  return <button
    type="button"
    className="footerPrivacyButton"
    onClick={()=>window.dispatchEvent(new Event("fragmentun:ad-consent-open"))}
  >
    {locale==="es"?"Preferencias de publicidad":"Advertising preferences"}
  </button>;
}
