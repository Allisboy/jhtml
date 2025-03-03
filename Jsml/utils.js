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
  const resolvePath = (path, obj) => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  };
  const keys = Object.keys(propsAttri);
  return template.replace(regex, (match, key) => {
    const values = keys.map((key) => resolvePath(key, propsAttri));
    const condition= new Function(...keys, `return ${key}`)(...values);
    // const value = key.trim().split('.').reduce((obj, path) => obj?.[path], propsAttri);
    return condition ?? '';
  });
}

const createTemplate = (html, props) => {
  if (templates.has(html)) {
    return templateEngine(templates.get(html), props);
  }
  
  templates.set(html, html);
  return templateEngine(html, props);
}


export const elementTrack=(el)=>{
  const mounted=el.isConnected
   const track={
    el:el,
    mounted:mounted,
    transition:el.getAttribute('enter') ? true :false,
    duration:el.getAttribute('duration') || 300,
    beforeEnter: (callback) => {
      if(track.transition){
        const enter=el.getAttribute('enter')
        enter?.split(' ').forEach(cl => {
          if(cl === '')return
          el.classList.add(cl)
        })
      }
      if(callback) callback(el)
        return track
    },
    enter:(callback)=>{
      if(track.transition){
        const enter=el.getAttribute('enter')
        const enterTo=el.getAttribute('enter-to')
        setTimeout(() => {
          requestAnimationFrame(() => {
            enter?.split(' ').forEach(cl => {
              if(cl === '')return
              el.classList.remove(cl)
            })
            
            enterTo?.split(' ').forEach(cl => {
              if(cl === '')return
              el.classList.add(cl) 
            })
          })
          // console.log(children);
        }, track.duration);
      }
      
        return track
    },
    beforeLeave:(callback)=>{
      if (track.transition) {
        const enterTo=el.getAttribute('enter-to')
        const leaveTo=el.getAttribute('leave-to')
        enterTo?.split(' ').forEach(cl => {
          if(cl === '')return
            el.classList.remove(cl) 
          })
          requestAnimationFrame(() => {
            leaveTo?.split(' ').forEach(cl => {
              if(cl === '')return
              el.classList.add(cl)
            })
          })
      }
     if(callback) callback(el)
      return track
    },
    leave:(callback)=>{
      if(track.transition){
        const leaveTo=el.getAttribute('leave-to')
        const leave=el.getAttribute('leave')
        const enter=el.getAttribute('enter')
        leaveTo?.split(' ').forEach(cl => {
          if(cl === '')return
          el.classList.add(cl)
        })
        requestAnimationFrame(() => {
          leave?.split(' ').forEach(cl => {
            if(cl === '')return
            el.classList.add(cl)
          })
        })
        setTimeout(() => {
          leave?.split(' ').forEach(cl => {
            if(cl === '')return
            el.classList.remove(cl)
          })
        }, track.duration);
      }
      if(callback) {
        setTimeout(() => {
          callback(el)
        }, track.duration);
      }
        return track
    },
  }
  return track
 }
export { createTemplate, templateEngine };
