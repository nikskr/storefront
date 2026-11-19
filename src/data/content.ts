// MOCK: replace texts and contacts with real ones.
import type { Advantage, Phone } from '../types.ts';

export const hero = {
  title: 'Овощи с грядки — прямо к вашему столу',
  text: 'Выращиваем сами, собираем под заказ и привозим свежими.',
  buttonLabel: 'Перейти в каталог',
  buttonHref: 'catalog.html',
} as const;

export const sliderContent = {
  title: 'Урожай недели',
} as const;

const advantages: Advantage[] = [
  {
    title: 'Свежесть',
    text: 'Собираем овощи в день заказа, а не держим неделями на складе.',
  },
  {
    title: 'Без посредников',
    text: 'Цена ниже магазинной: вы платите напрямую тому, кто вырастил.',
  },
  {
    title: 'Натуральные продукты',
    text: 'Выращиваем без стимуляторов роста, удобряем органикой.',
  },
  {
    title: 'Знаете, откуда еда',
    text: 'Можно приехать на ферму и посмотреть, как всё растёт.',
  },
];

export const advantagesContent = {
  title: 'Почему выгодно покупать у фермера',
  items: advantages,
} as const;

const phones: Phone[] = [
  { label: 'Заказы', number: '+375290000001' },
  { label: 'Доставка', number: '+375330000002' },
];

export const contacts = {
  title: 'Контакты',
  phones,
  workingHours: 'Ежедневно с 9:00 до 20:00',
} as const;

export const consent = {
  /** Checkbox text in the order form. The box is never pre-checked. */
  label:
    'Я даю согласие на обработку моих персональных данных (номера телефона) для оформления и выполнения заказа',
  policyLinkLabel: 'Политика обработки персональных данных',
  policyHref: 'privacy.html',
  /** Shown when the user tries to submit without consent. */
  requiredMessage:
    'Без согласия на обработку персональных данных заказ отправить нельзя',
} as const;

/**
 * Privacy policy page content.
 * MOCK: must be reviewed by a lawyer under the Law of the Republic of Belarus
 * No. 99-З "On Personal Data Protection" before launch.
 */
export const privacyPolicy = {
  title: 'Политика обработки персональных данных',
  operator: 'ИП Иванов Иван Иванович, УНП 000000000',
  operatorAddress: 'Минская обл., д. Примерная, ул. Полевая, 1',
  operatorEmail: 'farm@example.com',
  dataCollected: ['Номер телефона'],
  purpose:
    'Оформление и выполнение заказа: связь с покупателем для подтверждения заказа и согласования доставки.',
  retention: 'Не дольше 1 года с момента оформления заказа.',
  transfer:
    'Данные заказа передаются продавцу через мессенджер Telegram и третьим лицам не продаются.',
  rights:
    'Вы можете отозвать согласие, запросить информацию о своих данных, их изменение или удаление, написав на e-mail оператора.',
} as const;
