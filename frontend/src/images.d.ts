// Import PNG files in TypeScript files without type errors
declare module "*.png" {
  // treat png as string (the path to the image)
  const value: string;
  export default value;
}
