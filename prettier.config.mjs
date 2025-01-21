/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: "none",
    tabWidth: 4,
    plugins: [
        "@ianvs/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss"
    ],
    importOrder: ["<BUILTIN_MODULES>", "THIRD_PARTY_MODULES", "^@/", "^[.]"],
    importOrderTypeScriptVersion: "5.7.3"
};

export default config;
