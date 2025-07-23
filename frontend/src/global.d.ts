// import CSS modules in TypeScript files without type errors
declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

// import plain CSS in TypeScript files without type errors
declare module "*.css";
