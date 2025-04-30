import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    rules: {
      "react/no-unescaped-entities": "off",
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
        },
      ],
      "import/order": [
        "warn",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            ["sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "../../*",
              group: "parent",
              position: "after",
            },
            {
              pattern: "../../../*",
              group: "parent",
              position: "after",
            },
          ],
          "newlines-between": "always",
        },
      ],
    },
  }),
];
export default eslintConfig;
