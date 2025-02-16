import { RegisterComponent } from "../Jsml/index.js";

export const Text=(props)=>{
   
    return `
    <div 
    state-check='true'
    state-name="'Text'" 
    >
    <span bind="name.value"></span>
    #{children}
    </div>
    `
}

const Dropdown=(props,app)=>{
    
    return `
    <div
    state-drop="false"
    >
     <div on:click="drop.value=!drop.value">${props.head}</div>
     <div>
        <div if="drop.value">${props.children}</div>
     </div>
    </div>
    
    `
}

const Counter=(props,app)=>{
    app.onMount(()=>{
        console.log('mounted')
    })
    return `
    <div state-count='0' 
    enter='enter'
    enter-to='enter-to'
    class="transition"
    transition='open.value'
    >
        <span>@{count.value}</span>
        <button on:click='count.value++'>count now</button>
    </div>
    `
}

RegisterComponent(Text,Counter,Dropdown)

