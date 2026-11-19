// Entry point of privacy.html: the personal data policy.
import { renderPrivacyPolicy } from '../components/privacy-policy.ts';
import { requireElement } from '../lib/dom.ts';
import { initPage } from './shared.ts';

initPage();
renderPrivacyPolicy(requireElement('[data-policy]'));
