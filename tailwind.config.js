module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./styles/**/*.css"],
  theme: {
    extend: {
      colors: {
        midnight: "#0D1B2A",
        charcoal: "#1A1A1A",
        neon: "#00F0FF",
        violet: "#8A2EFF",
        softgray: "#E0E0E0"
      },
      boxShadow: { glow: "0 0 24px rgba(0, 240, 255, 0.25)" }
    }
  },
  plugins: []
};
