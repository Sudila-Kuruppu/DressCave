import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: "#FF6F61" },
        secondary: { value: "#4FA1A0" },
        success: { value: "#27AE60" },
        warning: { value: "#F1C40F" },
        error: { value: "#E74C3C" },
      },
      fonts: {
        heading: { value: "Inter, sans-serif" },
        body: { value: "Inter, sans-serif" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
