/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#F8F4EC",
        canvas: "#FFFDF8",
        primary: "#1E5FAF",
        primarySoft: "#DCEBFF",
        accent: "#F08A24",
        accentSoft: "#FFE7CC",
        ink: "#11324B",
        muted: "#667788",
        line: "#D6E2EE",
        success: "#2F855A",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(17, 50, 75, 0.10)",
        soft: "0 10px 25px rgba(240, 138, 36, 0.10)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

