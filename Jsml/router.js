import { setPlugin, state ,components, component,render,RegisterComponent} from "./index.js"
import { createEffect } from "./reactive.js"

const allRoute=[]
let currentRouteElement=document.createComment(`route`);
const isMatch = state( window.location.pathname)

// Add window location listener
window.addEventListener('popstate', () => {
    isMatch.value = window.location.pathname;
});

window.addEventListener('pushchange', () => {
    isMatch.value = window.location.pathname;
});

export const navigate = (path) => {
    window.history.pushState({}, '', path);
    // Dispatch custom event to notify route changes
    window.dispatchEvent(new CustomEvent('pushchange'));
    // Update global router state
    isMatch.value= path;
  }
  
  // For hash routing
//   export const hashNavigate = (path) => {
//     window.location.hash = path;
//     global.$hash = path;
//     window.dispatchEvent(new CustomEvent('pushchange')); 
//   }
  
const matchRoute = (pattern, path) => {
    // Remove trailing slashes for consistency
    const cleanPattern = pattern.replace(/\/$/, '');
    const cleanPath = path.replace(/\/$/, '');
    
    const patternParts = cleanPattern.split('/');
    const pathParts = cleanPath.split('/');
    
    if (patternParts.length !== pathParts.length) {
        
      return [ false,  {} ];
    }
    
    const params = {};
    
    const match = patternParts.every((part, index) => {
      if (part.startsWith(':')) {
        // This is a parameter
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
        return true;
      }
      return part === pathParts[index];
    });
    
    return [ match, params ];
  }
  
  // Usage in router function
  const routeComponents = new Map()
  const router = (el, path, context, isMatch) => {
    context.navigate=navigate
      const parent=el.ParentElement
      const routeGuard = el.getAttribute('$route-guard');
      const routeFallback = el.getAttribute('$route-fallback') || '/';
      const fragment=document.createDocumentFragment()
      el.setAttribute('suspense','true')
      el.replaceWith(currentRouteElement);
      if(components.has(el.tagName)){
        //   fragment.appendChild(el)
          routeComponents.set(path, {
            element: el,
            component: el.tagName
        })

        }
        const evaluate = () => {
            const currentPath = window.location.pathname;
          const [match, params ] = matchRoute(path, isMatch.value);
          
          try {
              if (match) {
                  // Add params to context
                  const routeContext = { ...context, params };
                  
                  if (routeGuard) {
                      const keys = Object.keys(routeContext);
                      const values = keys.map(key => routeContext[key]);
                      const guard = new Function(...keys, `return ${routeGuard}`)(...values);
                      
                      if (guard) {
                        const element=routeComponents.get(path)
                        currentRouteElement.replaceWith(element.element);
                       let newEle=component(element.element,context)
                        currentRouteElement=newEle
                        } else {
                            const element=routeComponents.get(path)
                            currentRouteElement.replaceWith(element.element);
                           let newEle=component(element.element,context)
                            currentRouteElement=newEle
                            navigate(routeFallback)
                        }
                    } else {
                        const element=routeComponents.get(path)
                        currentRouteElement.replaceWith(element.element);
                       let newEle=component(element.element,context)
                        currentRouteElement=newEle      
                    }
                } else {
                                  
              }
          } catch (error) {
              console.error('Route evaluation error:', error);
          }
      };
  
      createEffect(() => {
          evaluate();
      });
  }
  export const useAttriRoute = (attriPlugin, power) => {
    power['$route-navigate']=navigate
    const attribute = (el, attr, context) => {
    
        if(attr.name === '$route') {
            router(el, attr.value, context, isMatch)
        }
    }
    attriPlugin.push(attribute)
}

export const useRoute = (path) => {
 
    return isMatch
}

export const RouterLink = (props) => {
  console.log('about')
 return `
        <a>${props.children && props.children}</a>
       `
};

RegisterComponent(RouterLink);
