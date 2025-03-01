import { component, components, regenerate, state, stateWatch ,render} from "./index.js";
import { createEffect } from "./reactive.js";
import { replaceOperators,elementTrack } from "./utils.js";


export const bind=(el,exp,context)=>{

    const evaluate=() => {
    const resolvePath = (path, obj) => {
   return path.split('.').reduce((acc, key) => acc?.[key], obj);
 };
 
          let template=`{{${exp}}}`
         const newTemp= template.replace(/{{(.*?)}}/g, (_, expression) => {
   try {
     // Extract keys and values from context
     const keys = Object.keys(context);
 
     const values = keys.map((key) => resolvePath(key, context));
   //  console.log(JSON.stringify(values))
         return new Function(...keys, `return ${expression}`)(...values);
      
    // console.log(tem)
 
   } catch {
     return ''; // Return empty string for invalid placeholders
   }
 });
 //console.log(newTemp)
     el.textContent=newTemp
        
     }
     createEffect(()=>{
     evaluate()
     },el)
}

export const model = (el,exp,childContext) => {
  const resolvePath = (path, obj) => {
 return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

   const updateValue=(value) => {
         const keys = Object.keys(childContext)
const values = keys.map((key) => resolvePath(key, childContext));
value = new Function(...keys, `
         return ${exp}=${value}
         `)(...values)
   }
   el.addEventListener('input', (e) => {
 const value = el.type === 'number' ? parseFloat(e.target.value) : e.target.value;
 updateValue(`'${value}'`);
})
   const evaluate = () => {
     let value
        const keys=Object.keys(childContext)
        const values = keys.map((key) => resolvePath(key, childContext));
         value=new Function(...keys,`
         return ${exp}
         `)(...values)
      
      
      el.value=value
   }
   createEffect(()=>{
     evaluate()
     },el)
   // listeners.add(evaluate)
}


export const If=(el,exp,context)=>{
  const comment=document.createComment("it's if")
  let compo;
    if(components.has(el.tagName)){
      el.setAttribute('suspense','true')
      el.removeAttribute('if')
    }
    const commentEsle=document.createComment("it's else")
    const elseSibling=el.nextElementSibling 
    const sibling=elseSibling?.attributes || []
    const findElse=Array.from(sibling).map((a)=>a.name === 'else')
    el.replaceWith(comment)
    
    const evaluate=()=>{
        try {
            // Extract keys and values from childContext
            const keys = Object.keys(context);
            const resolvePath = (path, obj) => {
                return path.split('.').reduce((acc, key) => acc?.[key], obj);
              };
            const values = keys.map((key) => resolvePath(key, context));
            const condition= new Function(...keys, `return ${exp}`)(...values);
            if(condition){
                
                if (elseSibling && findElse[0]) {
                    elseSibling.replaceWith(commentEsle)
                }
                if(components.has(el.tagName)){
               const ele=component(el,context)
                  compo=ele
                  elementTrack(compo).beforeEnter().enter()
                  comment.replaceWith(compo)
                }else{
                  elementTrack(el).beforeEnter().enter()
                  comment.replaceWith(el)
                }

            }else{
                if (elseSibling && findElse[0]) {
                    commentEsle.replaceWith(elseSibling)
                }
                if(components.has(el.tagName)){
                  elementTrack(compo).beforeLeave().leave(()=>compo.replaceWith(comment))
                    
                }else{
                  elementTrack(el).beforeLeave().leave(()=>el.replaceWith(comment))
                  
                }
            }
          } catch {
            return ''; // Return empty string for invalid placeholders
          }
    }
    
    createEffect(()=>{
        evaluate()
    })
  }
  export const transition=(el,exp,context)=>{
    const comment=document.createComment("transition if")
    const enter = el.getAttribute('enter')
      const enterTo = el.getAttribute('enter-to')
      const leave = el.getAttribute('leave')
      const leaveTo = el.getAttribute('leave-to')
      const duration = el.getAttribute('duration') || 300
      el.replaceWith(comment)
      const evaluate=()=>{
        try {
          // Extract keys and values from childContext
            const keys = Object.keys(context);
            const resolvePath = (path, obj) => {
              return path.split('.').reduce((acc, key) => acc?.[key], obj);
              };
              const values = keys.map((key) => resolvePath(key, context));
            const condition= new Function(...keys, `return ${exp}`)(...values);
            if(el.getAttribute('entering') === '0'){
            if (condition) {
              enter?.split(' ').forEach(cl => {
                if(cl === '')return
                el.classList.add(cl)
              })
              // Enter transition
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
              }, duration);
              comment.replaceWith(el)
            } else {
              enterTo?.split(' ').forEach(cl => {
                if(cl === '')return
                  el.classList.remove(cl) 
                })
              // Leave transition
              leave?.split(' ').forEach(cl => {
                if(cl === '')return
                el.classList.add(cl)
              })
              requestAnimationFrame(() => {
                leaveTo?.split(' ').forEach(cl => {
                  if(cl === '')return
                  el.classList.add(cl)
                })
              })
              
              setTimeout(() => {
                leave?.split(' ').forEach(cl => {
                  if(cl === '')return
                  el.classList.remove(cl)
                })
                leaveTo?.split(' ').forEach(cl => {
                  if(cl === '')return
                  el.classList.remove(cl)
                })
              enter?.split(' ').forEach(cl => {
                if(cl === '')return
              el.classList.add(cl)
            })
            el.replaceWith(comment)
            //
              }, duration)
            }
          }
          if(el.getAttribute('entering') === '1'){
            if(condition){
              comment.replaceWith(el)
              el.setAttribute('entering','0')
            }else{
               el.replaceWith(comment)
              el.setAttribute('entering','0')
            
            }
          }
           
          } catch {
            return ''; // Return empty string for invalid placeholders
          }
    }
    
    createEffect(()=>{
        evaluate()
    })
}
export const click=(el,exp,childContext) => {
        const template=`{{${exp}}}`
       const resolvePath = (path, obj) => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  };
  
  template.replace(/{{(.*?)}}/g, (_, expression) => {
    try {
      // Extract keys and values from childContext
      const keys = Object.keys(childContext);
  
      const values = keys.map((key) => resolvePath(key, childContext));
       el.addEventListener('click',(e) => {
            // keys.push('e')
            // values.push({'e':e})
             new Function('e',...keys, ` ${expression}`)(e,...values);
        })
      
  
    } catch {
      return ''; // Return empty string for invalid placeholders
    }
  });
     el.removeAttribute('click') 
  }
export const event=(el,name,value,childContext) => {
     const afterColon = name.split(':')[1]
       const resolvePath = (path, obj) => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  };
  
 
    try {
      // Extract keys and values from childContext
      const keys = Object.keys(childContext);
  
      const values = keys.map((key) => resolvePath(key, childContext));
       el.addEventListener(afterColon,(e) => {
             new Function('e',...keys, ` ${value}`)(e,...values);
        })
      
  
    } catch {
      return ''; // Return empty string for invalid placeholders
    }

    //  el.removeAttribute('click') 
  }
  
export const states=(el,name,value,context)=>{
    new Function('name','value','context','state',`
       let document=null
       let window=null
       try{
         context.${name}=state(${value})
       }catch{
       console.warn("error from ${value} and state-${name} maybe its in valid javascript or you want to set a string wrap it inside a quote ")
       }
        `)(name,value,context,state)
}
export const variable=(el,name,value,context)=>{
    const evaluate=()=>{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      new Function('name','context','el',...keys,`
        context.${name}=${value}
        `)(name,context,el,...values)
        
        // console.log(context)
    }
    createEffect(()=>{
        evaluate()
    })
}
export const key=(el,exp, context, any, render)=>{
  const fragment=document.createDocumentFragment()
  const comment=document.createComment('key element')
  el.replaceWith(comment)
  el.removeAttribute('set-key')
  fragment.appendChild(el)
  const nodes=new Map()
  let oldKey=null
  let nowNode;
    const evaluate=()=>{

      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      // console.log(context)
    const isKey=new Function('el',...keys,`
        return ${exp}
        `)(el,...values)
        if (nowNode) {
          const newNode=fragment.firstElementChild.cloneNode(true)
          
          newNode.setAttribute('spe-key',isKey)
          elementTrack(newNode).beforeEnter().enter()
          elementTrack(nowNode).beforeLeave()
          nowNode.replaceWith(newNode)
          render(newNode,context)
          nowNode=newNode
        } else {
          const newNode=fragment.firstElementChild.cloneNode(true)
          newNode.setAttribute('spe-key',isKey)
          comment.replaceWith(newNode)
          render(newNode,context)
          nowNode=newNode
        }
        // console.log(context)
    }
    createEffect(()=>{
        evaluate()
    })
}

export const For = (el, exp, context, any, render) => {
  const comment = document.createComment("it's for")
  el.removeAttribute('for')
  const fragment = el.cloneNode(true)
  if(components.has(el.tagName)){
    el.setAttribute('suspense','true')
  }
  const splitExp = exp.split(' in ')
  el.replaceWith(comment)
  const parentNode = comment.parentNode
  let oldElements = []
  let oldArray = []

  const evaluate = () => {
    if(splitExp[1] === undefined)return;
    const arrayName = splitExp[1].trim()
    const itemExp = splitExp[0].trim()
    let itemName = itemExp
    let indexName = 'index'
    
    // Check if item expression has index variable
    if(itemExp.includes(',')) {
      const [item, index] = itemExp.split(',').map(s => s.trim())
      itemName = item
      indexName = index
    }

    try {
      const keys = Object.keys(context)
      const resolvePath = (path, obj) => {
        return path.split('.').reduce((acc, key) => acc?.[key], obj)
      }
      const values = keys.map(key => resolvePath(key, context))
      const array = new Function(...keys, `return ${arrayName}`)(...values)

      // Create a map of old elements by key
      const oldElementsMap = new Map()
      oldElements.forEach(el => {
        const key = el.getAttribute('key')
        if (key) {
          oldElementsMap.set(key, el)
        }
      })

      // Remove old elements that are no longer in the array
      oldElements.forEach(el => {
        const key = el.getAttribute('key')
        if (!array.some(item => item.key === key)) {
          el.remove()
        }
      })

      // Update or add new elements
      array.forEach((item, index) => {
        const key = item.key || index
        const itemContext = {
          ...context,
          [itemName]: item,
          [indexName]: index
        }

        let clone = oldElementsMap.get(key)
        if (clone) {
          // Update existing element
          const processNode = (node) => {
            if (node.nodeType === 3) { // Text node
              const text = node.textContent
              const newText = text.replace(/{{(.+?)}}/g, (match, exp) => {
                try {
                  const keys = Object.keys(itemContext)
                  const values = keys.map(key => itemContext[key])
                  return new Function(...keys, `return ${exp}`)(...values)
                } catch {
                  return match
                }
              })
              node.textContent = newText
            } else if (node.attributes) {
              Array.from(node.attributes).forEach(attr => {
                const newValue = attr.value.replace(/{{(.+?)}}/g, (match, exp) => {
                  try {
                    const keys = Object.keys(itemContext)
                    const values = keys.map(key => itemContext[key])
                    return new Function(...keys, `return ${exp}`)(...values)
                  } catch {
                    return match
                  }
                })
                attr.value = newValue
              })
            }
            Array.from(node.childNodes).forEach(processNode)
          }
          processNode(clone)
          if(components.has(el.tagName)){
            component(clone,itemContext)
          }else{
            render(clone, itemContext)
          }
        } else {
          // Add new element
          clone = fragment.cloneNode(true)
          const processNode = (node) => {
            if (node.nodeType === 3) { // Text node
              const text = node.textContent
              const newText = text.replace(/{{(.+?)}}/g, (match, exp) => {
                try {
                  const keys = Object.keys(itemContext)
                  const values = keys.map(key => itemContext[key])
                  return new Function(...keys, `return ${exp}`)(...values)
                } catch {
                  return match
                }
              })
              node.textContent = newText
            } else if (node.attributes) {
              Array.from(node.attributes).forEach(attr => {
                const newValue = attr.value.replace(/{{(.+?)}}/g, (match, exp) => {
                  try {
                    const keys = Object.keys(itemContext)
                    const values = keys.map(key => itemContext[key])
                    return new Function(...keys, `return ${exp}`)(...values)
                  } catch {
                    return match
                  }
                })
                attr.value = newValue
              })
            }
            Array.from(node.childNodes).forEach(processNode)
          }
         if(components.has(el.tagName)){
          processNode(clone)
          let ele= component(clone,itemContext)
          ele.removeAttribute('for')
          parentNode.insertBefore(ele, comment)
          ele.setAttribute('key', key)
          oldElements.push(ele)
         }else{
          processNode(clone)
          parentNode.insertBefore(clone, comment)
          clone.removeAttribute('for')
          clone.setAttribute('key', key)
          oldElements.push(clone)
          render(clone, itemContext)
         }
        }
      })

      oldArray = array
    } catch (err) {
      console.error('Error in For directive:', err)
      return ''
    }
  }

  createEffect(() => {
    evaluate()
  })
}

export const show=(el,exp,context)=>{
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function(...keys, `return ${exp}`)(...values);
      if(condition){
        el.style.display=''
      }else{
        el.style.display='none'
      }
    }catch(error){

    }
  }
  createEffect(()=>{
    evaluate()
  })
}
export const parent=(el,exp,context)=>{
  const parent=el.parentElement
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('el','parent',...keys, `${exp}`)(el,parent,...values);
    }catch(error){

    }
  
}
export const elememt=(el,exp,context)=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('el',...keys, `${exp}`)(el,...values);
    }catch(error){
      console.warn('failed at element Attributes')
    }
  
}

export const after=(el,name,value,context)=>{
  try{
    const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('name','value',...keys, ` 
        setTimeout(()=>{
          ${value}
          },${name})
        `)(name,value,...values);
  }catch(error){

  }
}
export const every=(el,name,value,context)=>{
  try{
    const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('name','value',...keys, ` 
        setInterval(()=>{
          ${value}
          },${name})
        `)(name,value,...values);
  }catch(error){

  }
}
export const afterSpe=(el,value,context,name)=>{
  const split=name.split('-')
  const result = split.slice(1).join('-')
  const names=split[0]
  const contents = names.match(/\[(.*?)\]/)[1]
  const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      setTimeout(()=>{
        // console.log(result,value)
        regenerate(el,{name:result,value:value},context)
      },content)
    }catch(error){
  }
}
evaluate()
}

export const elementIf=(el,value,context,name)=>{
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 const contents = names.match(/\[(.*?)\]/)[1]
 const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('el',...keys, `return ${content}`)(el,...values);
      if(condition){
        if(!result){
      const func= new Function('el',...keys, ` ${value}`)(el,...values); 
        }else{
          // console.log(result,value)
          regenerate(el,{name:result,value:value},context)
        }
      }
    }catch(error){
  }
}
createEffect(()=>{
  evaluate()
})
}
export const elementElse=(el,value,context,name)=>{
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 const contents = names.match(/\[(.*?)\]/)[1]
 const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const condition= new Function('el',...keys, `return ${content}`)(el,...values);
      if(!condition){
        if(!result){
      const func= new Function('el',...keys, ` ${value}`)(el,...values); 
        }else{
          regenerate(el,{name:result,value:value},context)
        }
      }
    }catch(error){
  }
}
createEffect(()=>{
  evaluate()
})
}
export const parentSpe=(el,value,context,name)=>{
  const parent=el.parentElement
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 const contents = names.match(/\[(.*?)\]/)[1]
 const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const evaluatedCondition = new Function('parent','el',...keys, `return ${content}`)(parent,el,...values);
      const array=evaluatedCondition ? Array.from(evaluatedCondition) : ''

      if(array !== ''){
          if(result){
              Array.from(evaluatedCondition).forEach(child =>{
                  regenerate(child,{name:result,value:value},context) 
              })
          }else{
            Array.from(evaluatedCondition).forEach(child =>{
                const func= new Function('child',...keys, ` ${value}`)(child,...values);
            })
          }
      }else{      
      // console.log(content,value)
        const condition= new Function('parent','el',...keys, `${content}=${value}`)(parent,el,...values);
      }
    }catch(error){
  }
}
createEffect(()=>{
  evaluate()
},el)
}
export const elementSpe=(el,value,context,name)=>{
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 const contents = names.match(/\[(.*?)\]/)[1]
 const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
      const resolvePath = (path, obj) => {
          return path.split('.').reduce((acc, key) => acc?.[key], obj);
        };
      const values = keys.map((key) => resolvePath(key, context));
      const evaluatedCondition = new Function('el',...keys, `return ${content}`)(el,...values);
      const array=Array.from(evaluatedCondition)
      if(typeof Array.from(array).values().next().value !== 'string'){
          if(result){
              Array.from(evaluatedCondition).forEach(child =>{
                  regenerate(child,{name:result,value:value},context) 
              })
          }else{
            Array.from(evaluatedCondition).forEach(child =>{
                const func= new Function('child',...keys, ` ${value}`)(child,...values);
            })
          }
      }else{
        const condition= new Function('el',...keys, `${content}=${value}`)(el,...values);
      }
    }catch(error){
  }
}
createEffect(()=>{
  evaluate()
},el)
}
export const parentslash=(el,value,context,name)=>{
  const parent=el.parentElement
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 
 const evaluate=()=>{
  try{
        regenerate(parent,{name:result,value:value},context)
  }catch(error){
}
}
createEffect(()=>{
  evaluate()
},el)
}
export const elementslash=(el,value,context,name)=>{
 const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 
 const evaluate=()=>{
  try{
    regenerate(el,{name:result,value:value},context)
  }catch(error){
}
}
createEffect(()=>{
  evaluate()
})
}
export const addClass=(el,value,context,name)=>{
  value.split(' ').forEach(c=>{
    el.classList.add(c)
  })
}
export const removeClass=(el,value,context,name)=>{
  value.split(' ').forEach(c=>{
    el.classList.remove(c)
  })
}

export const watcher=(el,value,context,name)=>{
  const split=name.split('-')
 const result = split.slice(1).join('-')
 const names=split[0]
 const contents = names.match(/\[(.*?)\]/)[1]
 const content=replaceOperators(contents)
  const evaluate=()=>{
    try{
      const keys = Object.keys(context);
          const resolvePath = (path, obj) => {
              return path.split('.').reduce((acc, key) => acc?.[key], obj);
            };
          const values = keys.map((key) => resolvePath(key, context));
          const condition= new Function('el',...keys, `return [${content}]`)(el,...values);
      if(result){
        stateWatch(()=>{
        regenerate(el,{name:result,value:value},context)
        },[condition])
        // context[`${name}StopWatcher`]=stopWatcher
      }else{
        stopWatcher= stateWatch(()=>{
          const func= new Function('el',...keys, ` ${value}`)(el,...values);
        },[condition])
      }
      context[`${name}StopWatcher`]=stopWatcher
    }catch(error){
  }
}
  evaluate()
}