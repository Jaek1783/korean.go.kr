declare module "xml2js" {
  export interface ParserOptions {
    explicitArray?: boolean;
    trim?: boolean;
    normalizeTags?: boolean;
    [key: string]: unknown;
  }

  export function parseStringPromise<T = unknown>(
    xml: string,
    options?: ParserOptions
  ): Promise<T>;
}
