// MOCK: replace with real products, prices and photos.
import type { Product } from '../types.ts';

const placeholder = 'images/placeholder.svg';

/** Default weight rules for vegetables sold by weight. */
const byHalfKg = { min: 500, step: 500, max: 20_000 };

export const products: readonly Product[] = [
  {
    id: 'potato',
    name: 'Картофель',
    description: 'Молодой картофель, выращен без химии.',
    pricePerKg: 150,
    image: { src: placeholder, alt: 'Картофель' },
    weight: { min: 1000, step: 1000, max: 50_000 },
  },
  {
    id: 'carrot',
    name: 'Морковь',
    description: 'Сладкая и хрустящая, отлично подходит для сока.',
    pricePerKg: 180,
    image: { src: placeholder, alt: 'Морковь' },
    weight: byHalfKg,
  },
  {
    id: 'beet',
    name: 'Свёкла',
    description: 'Насыщенный цвет и вкус, для борща и салатов.',
    pricePerKg: 160,
    image: { src: placeholder, alt: 'Свёкла' },
    weight: byHalfKg,
  },
  {
    id: 'onion',
    name: 'Лук репчатый',
    description: 'Золотистый лук, хорошо хранится всю зиму.',
    pricePerKg: 190,
    image: { src: placeholder, alt: 'Лук репчатый' },
    weight: byHalfKg,
  },
  {
    id: 'cabbage',
    name: 'Капуста белокочанная',
    description: 'Плотные кочаны для квашения и свежих салатов.',
    pricePerKg: 140,
    image: { src: placeholder, alt: 'Капуста белокочанная' },
    weight: { min: 1000, step: 500, max: 30_000 },
  },
  {
    id: 'cucumber',
    name: 'Огурцы',
    description: 'Тепличные огурцы, собраны в день отправки.',
    pricePerKg: 590,
    image: { src: placeholder, alt: 'Огурцы' },
    weight: byHalfKg,
  },
  {
    id: 'tomato',
    name: 'Томаты',
    description: 'Мясистые розовые томаты с насыщенным вкусом.',
    pricePerKg: 690,
    image: { src: placeholder, alt: 'Томаты' },
    weight: byHalfKg,
  },
  {
    id: 'zucchini',
    name: 'Кабачки',
    description: 'Нежные молодые кабачки для жарки и запекания.',
    pricePerKg: 290,
    image: { src: placeholder, alt: 'Кабачки' },
    weight: byHalfKg,
  },
];

/** Products shown in the slider on the home page. */
export const featuredProductIds: readonly string[] = ['potato', 'tomato'];
