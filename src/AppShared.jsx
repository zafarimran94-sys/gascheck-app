// Shared constants and components used across App.jsx and LandingPage.jsx

export const APP = "LPG Inspection Care";
export const LOGO_URL = "https://ybyvhoyiifjfvxcuaeku.supabase.co/storage/v1/object/public/assets/SVG%20(1).png";

export const AppLogo = ({ s = 32, className = "" }) => (
  <img src={LOGO_URL} alt={APP} width={s} height={s} className={`object-contain ${className}`}/>
);
