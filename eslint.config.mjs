import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  {
    rules: {
      "react/no-unknown-property": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },
  { ignores: [".next/**", "out/**", "node_modules/**", "capture/**", "next-env.d.ts"] },
];

export default config;
