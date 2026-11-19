type Child = Node | string;

interface ElementOptions {
  className?: string;
  /** Set via textContent, so it is always safe from HTML injection. */
  text?: string;
  attrs?: Record<string, string>;
}

/** Creates an element with classes, text, attributes and children. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  children: readonly Child[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    node.setAttribute(name, value);
  }
  node.append(...children);
  return node;
}

/** querySelector that fails loudly: a missing hook is a markup bug. */
export function requireElement<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T {
  const node = root.querySelector<T>(selector);
  if (!node) {
    throw new Error(`Element not found: ${selector}`);
  }
  return node;
}
