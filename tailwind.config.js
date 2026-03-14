/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["app/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        background: "#000000",
        surface: "#0f1115",
        "surface-elevated": "#1e293b",
        "surface-accent": "#1c1022",
        
        // Brand colors
        primary: "#2F9BBC",
        "primary-bright": "#00f2ff",
        accent: "#8c25f4",
        secondary: "#ffffff",
        
        // Borders
        border: "#2d333b",
        "border-subtle": "#334155",
        
        // Text
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        "text-muted": "#64748b",
        "text-placeholder": "#475569",
        
        // Semantic
        success: "#22c55e",
        warning: "#FACC15",
        error: "#EF4444",
      },
      borderRadius: {
        "xs": "4px",
        "card": "12px",
        "card-lg": "16px",
        "card-xl": "24px",
      },
      fontSize: {
        "display": ["30px", { lineHeight: "36px" }],
        "heading": ["24px", { lineHeight: "32px" }],
        "title": ["20px", { lineHeight: "28px" }],
        "subtitle": ["18px", { lineHeight: "24px" }],
        "body": ["16px", { lineHeight: "24px" }],
        "label": ["14px", { lineHeight: "20px" }],
        "caption": ["12px", { lineHeight: "16px" }],
        "micro": ["10px", { lineHeight: "14px" }],
      },
    },
  },
  plugins: [],
}
