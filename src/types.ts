/** Money is stored in kopecks (integer), e.g. 1.50 BYN = 150. */
export type Kopecks = number;

/** Weight is stored in grams (integer), e.g. 1.5 kg = 1500. */
export type Grams = number;

export interface Image {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePerKg: Kopecks;
  image: Image;
  weight: {
    min: Grams;
    step: Grams;
    max: Grams;
  };
}

export interface Phone {
  label: string;
  /** E.164 without spaces, used for tel: links, e.g. +375290000001 */
  number: string;
}

export interface Advantage {
  title: string;
  text: string;
}

/** Piece of a policy paragraph: plain text or an e-mail shown as a link. */
export type PolicyInline = string | { email: string };

/** Paragraph (text with optional e-mail links) or a bulleted list. */
export type PolicyBlock =
  | { type: 'paragraph'; parts: readonly PolicyInline[] }
  | { type: 'list'; items: readonly string[] };

export interface PolicySection {
  title: string;
  blocks: readonly PolicyBlock[];
}
