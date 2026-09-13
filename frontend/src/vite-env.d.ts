/// <reference types="vite/client" />

// Déclarations pour imports CSS (side-effect)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Déclarations pour imports d'images
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
