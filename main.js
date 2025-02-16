import  "./component.js/text.js";
import { render,stateWatch,apply,state,setBefore,setPlugin} from "./Jsml/index.js";
import { useAttriMedia } from "./Jsml/mediaQuery.js";
import { useAttriRoute } from "./Jsml/router.js";


setPlugin(useAttriMedia,useAttriRoute)
const check=state(false)
setBefore('type',(el,context)=>{
    context.surname=state('oriso-owubo')
    context.check=check
    
})

// const unWatch=stateWatch(()=>{
//     console.log('check',check.value)
//     return ()=>{
//         console.log('unwatch')
//     }
// },[check])
const element=`
<div class=""></div>
`

render(document.getElementById('app'))
