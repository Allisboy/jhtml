export const replaceOperators = (expression) => {
  return expression
    .replace(/#/g, '=')
    .replace(/\^/g, '>')
    .replace(/!\^/g, '<')
    .replace(/@/g, ' ')
    .replace(/::(.)(?=.)/g, (_, char) => char.toUpperCase())
    .replace(/%/g, '"');
};

export function unwrap(element) {
  // Create a document fragment to hold the children
  const fragment = document.createDocumentFragment();
  
  // Move all children to the fragment
  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }
  
  if(element.parentNode === null) return
  // Replace the element with all its children at once
  element.parentNode.replaceChild(fragment, element);
}

const templateEngine = (template, propsAttri) => {
  const regex = /#{(.*?)}/g;
  return template.replace(regex, (match, key) => {
    const value = key.trim().split('.').reduce((obj, path) => obj?.[path], propsAttri);
    return value ?? '';
  });
}

const createTemplate = (html, props) => {
  if (templates.has(html)) {
    return templateEngine(templates.get(html), props);
  }
  
  templates.set(html, html);
  return templateEngine(html, props);
}

export { createTemplate, templateEngine };
