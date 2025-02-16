// Special attribute handlers for virtual DOM
import {createEffect} from './reactive.js';
const specialAttributes = {
    'js-if': (vnode, value, context) => {
      const evaluate = () => {
        return typeof value === 'function' ? value(context) : value;
      };
      
      vnode.shouldRender = evaluate();
      createEffect(() => {
        vnode.shouldRender = evaluate();
      });
    },
  
    'js-for': (vnode, value, context) => {
      vnode.iterator = {
        items: Array.isArray(value) ? value : context[value],
        item: 'item',
        index: 'index'
      };
  
      createEffect(() => {
        vnode.iterator.items = Array.isArray(value) ? value : context[value];
      });
    }
  };    
  // Enhanced createVNode with state and special attributes support
  const createVNode = (type, props, children, context) => {
    const vnode = {
      type,
      props: props || {},
      children: children || [],
      context
    };
  
    // Handle special attributes
    Object.entries(props || {}).forEach(([key, value]) => {
      if (specialAttributes[key]) {
        specialAttributes[key](vnode, value, context);
      }
    });
  
    return vnode;
  };
  
  // Modified createElement to handle conditional rendering and loops
  const createElement = (vnode) => {
    if (typeof vnode.children === 'function') {
        const content = vnode.children(vnode.context);
        const textNode = document.createTextNode(content);
        element.appendChild(textNode);
        
        // Make it reactive
        createEffect(() => {
          textNode.textContent = vnode.children(vnode.context);
        });
      }
    if (!vnode || (vnode.shouldRender === false)) {
      return document.createComment('');
    }
  
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode);
    }
  console.log(vnode)
    const element = document.createElement(vnode.type);
  
    // Handle iterator for 'for' directive
    if (vnode.iterator) {
      return vnode.iterator.items.map(item => {
        const newContext = {
          ...vnode.context,
          [vnode.iterator.item]: item
        };
        return createElement(createVNode(vnode.type, vnode.props, vnode.children, newContext));
      });
    }
  
    // Set regular attributes
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (!specialAttributes[key]) {
        if (value.includes('@{')) {
          createEffect(() => {
            const evaluated = evaluateExpression(value, vnode.context);
            element.setAttribute(key, evaluated);
          });
        } else {
          element.setAttribute(key, value);
        }
      }
    });
  
    // Create children
    vnode.children.forEach(child => {
      const childElement = createElement(child);
      if (Array.isArray(childElement)) {
        childElement.forEach(el => element.appendChild(el));
      } else {
        element.appendChild(childElement);
      }
    });
  
    return element;
  };
  
  // Updated jsmlCreateElement
  export const jsmlCreateElement = (element, attributes, ...children) => {
    const context = {}; // You'll need to pass the context from your component scope
    return createVNode(
      element,
      attributes,
      children.flat(),
      context
    );
  };

 export const renderVirtualDOM = (vnode, parentElement) => {
    const element = document.createElement(vnode.type);
    
    // Apply props
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (!key.startsWith('js-')) {
        element.setAttribute(key, value);
      }
    });
  
    // Handle children
    vnode.children.forEach(child => {
      if (typeof child === 'function') {
        const textNode = document.createTextNode(child(vnode.context));
        element.appendChild(textNode);
        
        createEffect(() => {
          textNode.textContent = child(vnode.context);
        });
      } else if (typeof child === 'object') {
        renderVirtualDOM(child, element);
      } else {
        element.appendChild(document.createTextNode(child));
      }
    });
  
    parentElement.appendChild(element);
    return element;
  }
  
  const isVisible = state(true);
const items=state([
  { name: 'Item 1' },
  { name: 'Item 2' },
  { name: 'Item 3' }
]);
// const [el,context]=ref('app')
const div=jsmlCreateElement('div', {
    'js-if': isVisible.value
  }, [
    jsmlCreateElement('ul', {
      'js-for': items.value 
    }, [
      jsmlCreateElement('li', {},[
        'allwell'
      ])
    ])
  ]);

//   console.log(div)
//   renderVirtualDOM(div,document.getElementById('app'))