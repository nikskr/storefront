// Entry point of index.html: fills page sections with data from src/data/.
import { renderAdvantages } from '../components/advantages.ts';
import { renderHero } from '../components/hero.ts';
import { createSlider } from '../components/slider.ts';
import { sliderContent } from '../data/content.ts';
import { featuredProductIds, products } from '../data/products.ts';
import { requireElement } from '../lib/dom.ts';
import { pickProducts } from '../lib/products.ts';
import { initPage } from './shared.ts';

initPage();

renderHero(requireElement('[data-hero]'));

createSlider(requireElement('[data-slider]'), {
  title: sliderContent.title,
  products: pickProducts(products, featuredProductIds),
});

renderAdvantages(requireElement('[data-advantages]'));
