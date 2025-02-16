import { setPlugin, state } from "./index.js"
import { createEffect } from "./reactive.js"

const max=(el,value,context)=>{
    const comment=document.createComment(`media-max-${value}`)
    const quering = state(window.matchMedia(`(max-width:${value})`).matches)
    const media=window.matchMedia(`(max-width:${value})`)
    media.addEventListener('change', (e) => {
        if (e.matches) {
            quering.value=true
        } else {
            quering.value=false
        }
    })
    const evaluate=()=>{
        // context
            if(quering.value){
                comment.replaceWith(el)
            }else{
                el.replaceWith(comment)
            }
    }
    createEffect(()=>{
        evaluate()
    })
}
const min=(el,value,context)=>{
    const comment=document.createComment(`media-min-${value}`)
    const quering = state(window.matchMedia(`(min-width:${value})`).matches)
    const media=window.matchMedia(`(min-width:${value})`)
    media.addEventListener('change', (e) => {
        if (e.matches) {
            quering.value=true
        } else {
            quering.value=false
        }
    })
    const evaluate=()=>{
        // context
            if(quering.value){
                comment.replaceWith(el)
            }else{
                el.replaceWith(comment)
            }
    }
    createEffect(()=>{
        evaluate()
    })
}
export const useAttriMedia=(attriPlugin,power)=>{
    const attribute=(el,attr,context)=>{
        if(attr.name ==='$media-max'){
            max(el,attr.value,context)
        }else if(attr.name === '$media-max'){
            min(el,attr.value,context)
        }
    }
    attriPlugin.push(attribute)
}
export const useMediaQuery=(value)=>{
    const quering = state(window.matchMedia(value).matches)
    const media=window.matchMedia(value)
    media.addEventListener('change', (e) => {
        if (e.matches) {
            quering.value=true
        } else {
            quering.value=false
        }
    })
    return quering
}