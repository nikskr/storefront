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
