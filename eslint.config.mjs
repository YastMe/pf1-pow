// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    jsdoc.configs["flat/recommended-typescript-flavor"],
    {
        files: ["src/**/*.mjs"],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: "module",
            globals: {
                ...globals.browser,
                foundry: "readonly",
                game: "readonly",
                ui: "readonly",
                canvas: "readonly",
                CONFIG: "readonly",
                CONST: "readonly",
                Hooks: "readonly",
            },
        },
        rules: {
            "jsdoc/require-jsdoc": ["warn", { require: { MethodDefinition: true, FunctionDeclaration: true } }],
            "jsdoc/require-param-description": "warn",
            "jsdoc/no-undefined-types": "off",
        },
    },
    prettier,
];
