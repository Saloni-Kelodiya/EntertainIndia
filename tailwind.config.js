/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font Families
      fontFamily: {
        heading: ["Poppins", "Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"], // Added for quotes
      },

      // Custom Colors (optional - you can add if needed)
      colors: {
        primary: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
      },

      // Typography Plugin Configuration
      typography: (theme) => ({
        // DEFAULT (Light Mode)
        DEFAULT: {
          css: {
            // Base Text
            color: theme("colors.gray.700"),
            maxWidth: "none",
            
            // Paragraph
            p: {
              fontSize: "1rem",
              lineHeight: "1.7",
              marginTop: "0.75em",
              marginBottom: "0.75em",
              color: theme("colors.gray.700"),
            },
              figure: {
        marginTop: "1.5rem",
        marginBottom: "1.5rem",
        marginLeft: "0",
        marginRight: "0",
      },
      
      img: {
        marginTop: "0",
        marginBottom: "0",
        marginLeft: "auto",
        marginRight: "auto",
        
      },
      
      figcaption: {
        marginTop: "0.75rem",
        marginBottom: "0",
        textAlign: "center",
        fontSize: "0.75rem",
        color: theme("colors.gray.500"),
      },
      
      // Fix for images inside figure
      "figure img": {
        margin: "0 auto",
      },
            // Headings
            h1: {
              fontSize: "2.25rem",
              fontWeight: "700",
              marginTop: "1.5em",
              marginBottom: "0.5em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
              lineHeight: "3.5",
            },
            h2: {
              fontSize: "1.875rem",
              fontWeight: "700",
              marginTop: "1.25em",
              marginBottom: "0.5em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
              lineHeight: "1.3",
            },
            h3: {
              fontSize: "1.5rem",
              fontWeight: "600",
              marginTop: "1em",
              marginBottom: "0.5em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
              lineHeight: "1.4",
            },
            h4: {
              fontSize: "1.25rem",
              fontWeight: "600",
              marginTop: "0.75em",
              marginBottom: "0.5em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
            },
            h5: {
              fontSize: "1.125rem",
              fontWeight: "600",
              marginTop: "0.5em",
              marginBottom: "0.25em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
            },
            h6: {
              fontSize: "1rem",
              fontWeight: "600",
              marginTop: "0.5em",
              marginBottom: "0.25em",
              color: theme("colors.gray.900"),
              fontFamily: theme("fontFamily.heading").join(", "),
            },

            // Blockquotes
            blockquote: {
              
              fontStyle: "italic",
             
              backgroundColor: theme("colors.gray.50"),
              borderRadius: "0 0.5rem 0.5rem 0",
             
              // Remove automatic quotes
              quotes: "none",
              "&::before, &::after": {
                content: "none",
                display: "none",
              },
              
              // Paragraphs inside blockquotes
              p: {
                marginTop: "0.25em",
                marginBottom: "0.25em",
                "&::before, &::after": {
                  content: "none",
                  display: "none",
                },
              },
            },

            // Lists
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            ol: {
              listStyleType: "decimal",
              paddingLeft: "1.5rem",
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            li: {
              marginTop: "0.25em",
              marginBottom: "0.25em",
            },
            "li > ul, li > ol": {
              marginTop: "0.25em",
              marginBottom: "0.25em",
            },

            // Tables
            table: {
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "2em",
              marginBottom: "2em",
              fontSize: "0.95rem",
            },
            thead: {
              borderBottomWidth: "2px",
              borderBottomColor: theme("colors.gray.300"),
            },
            th: {
              border: `1px solid ${theme("colors.gray.300")}`,
              padding: "0.75rem",
              backgroundColor: theme("colors.gray.50"),
              fontWeight: "600",
              color: theme("colors.gray.900"),
              textAlign: "left",
            },
            td: {
              border: `1px solid ${theme("colors.gray.300")}`,
              padding: "0.75rem",
              color: theme("colors.gray.700"),
            },
            "tbody tr:hover": {
              backgroundColor: theme("colors.gray.50"),
            },

            // Links
            a: {
              color: theme("colors.pink.600"),
              fontWeight: "500",
              textDecoration: "none",
              transition: "color 0.2s ease",
              "&:hover": {
                color: theme("colors.pink.700"),
                textDecoration: "underline",
              },
            },

            // Underline
            u: {
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px",
              textDecorationColor: theme("colors.pink.500"),
              fontWeight: "500",
            },

            // Bold/Strong
            strong: {
              fontWeight: "700",
              color: theme("colors.gray.900"),
            },

            // Combined styles
            "u strong, strong u": {
              fontWeight: "800",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px",
              textDecorationColor: theme("colors.pink.500"),
            },

            // Horizontal Rule
            hr: {
              borderColor: theme("colors.gray.300"),
              marginTop: "2em",
              marginBottom: "2em",
            },

          

            // Code (if you use it)
            code: {
              backgroundColor: theme("colors.gray.100"),
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontSize: "0.9em",
              fontWeight: "400",
              color: theme("colors.pink.700"),
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              borderRadius: "0",
              color: "inherit",
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              color: theme("colors.gray.100"),
              padding: "1rem",
              borderRadius: "0.5rem",
              overflow: "auto",
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
          },
        },

        // DARK MODE (invert)
        invert: {
          css: {
            // Base
            color: theme("colors.gray.300"),
            
            // Paragraph
            p: {
              color: theme("colors.gray.300"),
            },

            // Headings
            h1: { color: theme("colors.white") },
            h2: { color: theme("colors.white") },
            h3: { color: theme("colors.white") },
            h4: { color: theme("colors.white") },
            h5: { color: theme("colors.white") },
            h6: { color: theme("colors.white") },

            // Strong
            strong: { color: theme("colors.white") },

            // Links
            a: { 
              color: theme("colors.pink.400"),
              "&:hover": {
                color: theme("colors.pink.300"),
              },
            },

            // Blockquotes
            blockquote: {
              borderLeftColor: theme("colors.pink.400"),
              color: theme("colors.gray.300"),
              backgroundColor: "rgba(31, 41, 55, 0.5)",
            },

            // Tables
            th: {
              backgroundColor: theme("colors.gray.800"),
              borderColor: theme("colors.gray.700"),
              color: theme("colors.white"),
            },
            td: {
              borderColor: theme("colors.gray.700"),
              color: theme("colors.gray.300"),
            },
            "tbody tr:hover": {
              backgroundColor: "rgba(55, 65, 81, 0.5)",
            },
            thead: {
              borderBottomColor: theme("colors.gray.700"),
            },

            // Underline
            u: {
              textDecorationColor: theme("colors.pink.400"),
            },

            // Combined
            "u strong, strong u": {
              textDecorationColor: theme("colors.pink.400"),
            },

            // Horizontal Rule
            hr: {
              borderColor: theme("colors.gray.700"),
            },

            // Code
            code: {
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.pink.300"),
            },
            pre: {
              backgroundColor: theme("colors.gray.950"),
            },
          },
        },

        // Compact variant (if you need even less spacing)
        compact: {
          css: {
            p: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            h1: { marginTop: "1em", marginBottom: "0.35em" },
            h2: { marginTop: "0.875em", marginBottom: "0.25em" },
            h3: { marginTop: "0.75em", marginBottom: "0.25em" },
            blockquote: {
              marginTop: "1em",
              marginBottom: "1em",
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    // You can add more plugins here if needed
  ],
};