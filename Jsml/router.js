import { setPlugin, state } from "./index.js"
import { createEffect } from "./reactive.js"

const allRoute=[]
const isMatch = state( window.location.pathname)
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
  const router = (el, path, context, isMatch) => {
      const comment = document.createComment(`route-${path}`);
      const routeGuard = el.getAttribute('$route-guard');
      const routeFallback = el.getAttribute('$route-fallback') || '/';
      el.replaceWith(comment);
      
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
                          comment.replaceWith(el);
                      } else {
                          el.replaceWith(comment);
                          navigate(routeFallback)
                      }
                  } else {
                      comment.replaceWith(el);
                  }
              } else {
                  el.replaceWith(comment);
                  navigate(routeFallback)

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
