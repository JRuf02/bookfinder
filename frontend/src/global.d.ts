// This allows us to import CSS modules in TypeScript files without type errors
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
