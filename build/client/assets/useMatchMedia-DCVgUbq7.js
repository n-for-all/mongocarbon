import{r as a}from"./components-Cj7Yk1Hh.js";import{c as d}from"./Button-Bl4KegFP.js";function v(s){let{defaultValue:i,name:c="custom",onChange:t,value:e}=s;const[u,l]=a.useState(e??i),n=a.useRef(null);n.current===null&&(n.current=e!==void 0);function o(r){const f=typeof r=="function"?r(u):r;n.current===!1&&l(f),t&&t(f)}return a.useEffect(()=>{const r=e!==void 0;n.current,n.current},[c,e]),n.current===!0?[e,o]:[u,o]}function L(s){const[i,c]=a.useState(()=>d?window.matchMedia(s).matches:!1);return a.useEffect(()=>{function t(u){c(u.matches)}const e=window.matchMedia(s);return e.addEventListener?e.addEventListener("change",t):e.addListener(t),c(e.matches),()=>{e.addEventListener?e.removeEventListener("change",t):e.removeListener(t)}},[s]),i}export{L as a,v as u};