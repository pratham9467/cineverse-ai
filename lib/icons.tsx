/**
 * Centralized SVG Icons Library
 * All SVG icons are defined here for consistent usage across the app
 */

// Tab Bar Icons (Home, Search, Watchlist, Profile)
// Icon wrapper component for easy usage with SvgXml
import { SvgXml } from 'react-native-svg';

export const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>`;

export const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`;

export const watchlistIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M452-160q6 20 16.5 41.5T490-80H200q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h480q33 0 56.5 23.5T760-800v284q-18-2-40-2t-40 2v-284H480v280l-100-60-100 60v-280h-80v640h252Zm126.5 61.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM670-140l160-100-160-100v200ZM280-800h200-200Zm172 0H200h480-240 12Z"/></svg>`;

export const profileIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg>`;

// Brand Icons
export const aistarsSvgWhite = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.5 10L20.9375 6.5625L17.5 5L20.9375 3.4375L22.5 0L24.0625 3.4375L27.5 5L24.0625 6.5625L22.5 10ZM22.5 27.5L20.9375 24.0625L17.5 22.5L20.9375 20.9375L22.5 17.5L24.0625 20.9375L27.5 22.5L24.0625 24.0625L22.5 27.5ZM10 23.75L6.875 16.875L0 13.75L6.875 10.625L10 3.75L13.125 10.625L20 13.75L13.125 16.875L10 23.75ZM10 17.6875L11.25 15L13.9375 13.75L11.25 12.5L10 9.8125L8.75 12.5L6.0625 13.75L8.75 15L10 17.6875Z" fill="white"/>
</svg>`;

export const aistarsblu = `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 8L16.75 5.25L14 4L16.75 2.75L18 0L19.25 2.75L22 4L19.25 5.25L18 8ZM18 22L16.75 19.25L14 18L16.75 16.75L18 14L19.25 16.75L22 18L19.25 19.25L18 22ZM8 19L5.5 13.5L0 11L5.5 8.5L8 3L10.5 8.5L16 11L10.5 13.5L8 19ZM8 14.15L9 12L11.15 11L9 10L8 7.85L7 10L4.85 11L7 12L8 14.15Z" fill="#2F9BBC"/>
</svg>`;

// Action Icons
export const sparkleIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="#2F9BBC" xmlns="http://www.w3.org/2000/svg">
<path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#2F9BBC"/>
</svg>`;

export const sendIcon = `<svg width="19" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 8L1.5 1.75V6.25L10.75 8L1.5 9.75V14.25L18 8Z" fill="white"/>
</svg>`;

export const bookmarkIcon = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 2H13V14L8 11L3 14V2Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

export const bookmarkIconBlue = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2.5H11V12.5L6.5 9.5L2 12.5V2.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

export const aiIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#2F9BBC"/>
</svg>`;

// Search & Filter Icons
export const searchInputIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="11" cy="11" r="8" stroke="#475569" stroke-width="2"/>
<path d="M16 16L21 21" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const searchIconBlue = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="8" cy="8" r="5.5" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M12 12L16 16" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const notificationIcon = `<svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 1C4 1 1 4 1 7.5V12C1 13 0 14 0 15V17C0 17.5 0.5 18 1 18H14C14.5 18 15 17.5 15 17V15C15 14 14 13 14 12V7.5C14 4 11 1 7.5 1Z" stroke="#64748B" stroke-width="1.5" fill="none"/>
</svg>`;

export const sortIcon = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1H11M1 4H11M1 7H11" stroke="#64748B" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// Navigation Icons
export const chevronLeft = `<svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 16L2 9L9 2" stroke="#2F9BBC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const chevronRight = `<svg width="8" height="14" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L6 6L1 11" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Media Icons
export const playIcon = `<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 14V0L11 7L0 14ZM2 10.35L7.25 7L2 3.65V10.35Z" fill="white"/>
</svg>`;

export const starIcon = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 0L5 3L8 3L5.5 5L6.5 8L4 6L1.5 8L2.5 5L0 3L3 3L4 0Z" fill="#FACC15"/>
</svg>`;

export const heartIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const socialIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;

export const starIconBlue = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#2F9BBC"/>
</svg>`;

// Profile & Settings Icons
export const preferencesIcon = `<svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M14.625 9C14.625 9.34 14.595 9.67 14.545 9.99L16.245 11.22C16.395 11.34 16.425 11.56 16.305 11.71L14.655 13.93C14.535 14.08 14.315 14.11 14.165 13.99L12.235 12.56C11.805 12.91 11.325 13.21 10.795 13.44L10.595 15.56C10.575 15.81 10.365 16 10.105 16H7.895C7.635 16 7.425 15.81 7.405 15.56L7.205 13.44C6.675 13.21 6.195 12.91 5.765 12.56L3.835 13.99C3.685 14.11 3.465 14.08 3.345 13.93L1.695 11.71C1.575 11.56 1.605 11.34 1.755 11.22L3.455 9.99C3.405 9.67 3.375 9.34 3.375 9C3.375 8.66 3.405 8.33 3.455 8.01L1.755 6.78C1.605 6.66 1.575 6.44 1.695 6.29L3.345 4.07C3.465 3.92 3.685 3.89 3.835 4.01L5.765 5.44C6.195 5.09 6.675 4.79 7.205 4.56L7.405 2.44C7.425 2.19 7.635 2 7.895 2H10.105C10.365 2 10.575 2.19 10.595 2.44L10.795 4.56C11.325 4.79 11.805 5.09 12.235 5.44L14.165 4.01C14.315 3.89 14.535 3.92 14.655 4.07L16.305 6.29C16.425 6.44 16.395 6.66 16.245 6.78L14.545 8.01C14.595 8.33 14.625 8.66 14.625 9Z" stroke="#2F9BBC" stroke-width="1.5"/>
</svg>`;

export const accountIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#2F9BBC"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg>`;

export const billingIcon = `<svg width="22" height="18" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 2H2.5C1.67 2 1 2.67 1 3.5V12.5C1 13.33 1.67 14 2.5 14H17.5C18.33 14 19 13.33 19 12.5V3.5C19 2.67 18.33 2 17.5 2Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M1 6H19" stroke="#2F9BBC" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

export const editProfile = `<svg width="12" height="12" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 8H1.7125L6.6 3.1125L5.8875 2.4L1 7.2875V8ZM0 9V6.875L6.6 0.2875C6.7 0.195833 6.81042 0.125 6.93125 0.075C7.05208 0.025 7.17917 0 7.3125 0C7.44583 0 7.575 0.025 7.7 0.075C7.825 0.125 7.93333 0.2 8.025 0.3L8.7125 1C8.8125 1.09167 8.88542 1.2 8.93125 1.325C8.97708 1.45 9 1.575 9 1.7C9 1.83333 8.97708 1.96042 8.93125 2.08125C8.88542 2.20208 8.8125 2.3125 8.7125 2.4125L2.125 9H0ZM8 1.7L7.3 1L8 1.7ZM6.2375 2.7625L5.8875 2.4L6.6 3.1125L6.2375 2.7625Z" fill="white"/>
</svg>`;

export const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 6L9 17L4 12" stroke="#2F9BBC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Detail Page Icons (Large variants)
export const starIconLarge = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 0L10.5 6L17 7L12 11L13.5 17L8.5 13L3.5 17L5 11L0 7L6.5 6L8.5 0Z" fill="#FACC15"/>
</svg>`;

export const linkIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6897C16.4231 14.4391 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.5969 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45705 20.479 3.53C19.552 2.60295 18.2971 2.07708 16.9862 2.06565C15.6752 2.0542 14.4122 2.55821 13.4692 3.46918L11.75 5.18" stroke="#2F9BBC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60706C11.7642 9.26329 11.0685 9.05887 10.3533 9.00765C9.63816 8.95643 8.92037 9.05962 8.24861 9.31027C7.57685 9.56093 6.96684 9.95304 6.45996 10.46L3.45996 13.46C2.54918 14.4031 2.04519 15.6661 2.05661 16.977C2.06804 18.288 2.59391 19.5429 3.52096 20.47C4.44801 21.397 5.70294 21.9229 7.01392 21.9343C8.3249 21.9458 9.58786 21.4418 10.5309 20.5308L12.2499 18.81" stroke="#2F9BBC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Splash Screen Icons (Large)
export const playIconLarge = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 120V0L120 60L0 120ZM20 90L80 60L20 30V90Z" fill="#2F9BBC"/>
</svg>`;

export const playIconSplash = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#2F9BBC"/>
    <stop offset="100%" stop-color="#00f2ff"/>
  </linearGradient>
  <filter id="glow">
    <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00f2ff" flood-opacity="0.5"/>
  </filter>
</defs>
<circle cx="60" cy="60" r="55" stroke="url(#playGradient)" stroke-width="2" opacity="0.3"/>
<circle cx="60" cy="60" r="45" stroke="url(#playGradient)" stroke-width="1.5" opacity="0.2"/>
<path d="M45 30L45 90L95 60Z" fill="url(#playGradient)" filter="url(#glow)"/>
<circle cx="30" cy="30" r="2" fill="#2F9BBC" opacity="0.6"/>
<circle cx="85" cy="40" r="1.5" fill="#00f2ff" opacity="0.4"/>
<circle cx="20" cy="85" r="2.5" fill="#2F9BBC" opacity="0.5"/>
<circle cx="95" cy="75" r="1" fill="#00f2ff" opacity="0.7"/>
<circle cx="75" cy="100" r="2" fill="#2F9BBC" opacity="0.3"/>
<circle cx="10" cy="55" r="1.5" fill="#00f2ff" opacity="0.6"/>
</svg>`;

// Auth Form Icons
export const emailIcon = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="18" height="14" rx="2" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M1 4L10 9L19 4" stroke="#2F9BBC" stroke-width="1.5"/>
</svg>`;

export const lockIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="7" width="16" height="12" rx="2" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M5 7V4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4V7" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
<circle cx="9" cy="13" r="2" fill="#2F9BBC"/>
</svg>`;

export const eyeIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#2F9BBC">
<path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const eyeCloseIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const userIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="8" r="4" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// Social Auth Icons
export const googleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
<path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.09H2.15V16.94C3.96 20.53 7.69 23 12 23Z" fill="#34A853"/>
<path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.15C1.39 8.55 0.96 10.24 0.96 12C0.96 13.76 1.39 15.45 2.15 16.94L5.84 14.09Z" fill="#FBBC05"/>
<path d="M12 5.36C13.62 5.36 15.06 5.92 16.2 7.01L19.35 3.86C17.45 2.09 14.97 1 12 1C7.69 1 3.96 3.47 2.15 7.06L5.84 9.91C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EA4335"/>
</svg>`;

export const appleIcon = `<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"></path>
</svg>`;

// Detail Page Bookmark Icons
export const bookmarkOutline = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Zm400 160v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/></svg>`;

export const bookmarked = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M713-600 600-713l56-57 57 57 141-142 57 57-198 198ZM200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Z"/></svg>`;

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const Icon = ({
  svg,
  width = 24,
  height = 24,
  color,
  style
}: {
  svg: string;
} & IconProps & {
  style?: any;
}) => (
  <SvgXml
    xml={svg}
    width={width}
    height={height}
    color={color}
    style={style}
  />
);