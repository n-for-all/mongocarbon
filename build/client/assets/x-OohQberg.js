import{r as a,R as m,j as M,B as L}from"./components-BPOIHgDc.js";import{a as b,u as v,S as w,g as k,P as j}from"./index-CZUknZXM.js";const $=1,V=1e6;let x=0;function B(){return x=(x+1)%Number.MAX_SAFE_INTEGER,x.toString()}const _=new Map,P=e=>{if(_.has(e))return;const t=setTimeout(()=>{_.delete(e),T({type:"REMOVE_TOAST",toastId:e})},V);_.set(e,t)},X=(e,t)=>{switch(t.type){case"ADD_TOAST":return{...e,toasts:[t.toast,...e.toasts].slice(0,$)};case"UPDATE_TOAST":return{...e,toasts:e.toasts.map(o=>o.id===t.toast.id?{...o,...t.toast}:o)};case"DISMISS_TOAST":{const{toastId:o}=t;return o?P(o):e.toasts.forEach(s=>{P(s.id)}),{...e,toasts:e.toasts.map(s=>s.id===o||o===void 0?{...s,open:!1}:s)}}case"REMOVE_TOAST":return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(o=>o.id!==t.toastId)}}},O=[];let I={toasts:[]};function T(e){I=X(I,e),O.forEach(t=>{t(I)})}function U({...e}){const t=B(),o=r=>T({type:"UPDATE_TOAST",toast:{...r,id:t}}),s=()=>T({type:"DISMISS_TOAST",toastId:t});return T({type:"ADD_TOAST",toast:{...e,id:t,open:!0,onOpenChange:r=>{r||s()}}}),{id:t,dismiss:s,update:o}}function H(){const[e,t]=a.useState(I);return a.useEffect(()=>(O.push(t),()=>{const o=O.indexOf(t);o>-1&&O.splice(o,1)}),[e]),{...e,toast:U,dismiss:o=>T({type:"DISMISS_TOAST",toastId:o})}}function J(e){const t=e+"CollectionProvider",[o,s]=b(t),[r,n]=o(t,{collectionRef:{current:null},itemMap:new Map}),u=d=>{const{scope:c,children:p}=d,i=m.useRef(null),l=m.useRef(new Map).current;return M.jsx(r,{scope:c,itemMap:l,collectionRef:i,children:p})};u.displayName=t;const S=e+"CollectionSlot",A=m.forwardRef((d,c)=>{const{scope:p,children:i}=d,l=n(S,p),f=v(c,l.collectionRef);return M.jsx(w,{ref:f,children:i})});A.displayName=S;const E=e+"CollectionItemSlot",R="data-radix-collection-item",y=m.forwardRef((d,c)=>{const{scope:p,children:i,...l}=d,f=m.useRef(null),h=v(c,f),C=n(E,p);return m.useEffect(()=>(C.itemMap.set(f,{ref:f,...l}),()=>void C.itemMap.delete(f))),M.jsx(w,{[R]:"",ref:h,children:i})});y.displayName=E;function g(d){const c=n(e+"CollectionConsumer",d);return m.useCallback(()=>{const i=c.collectionRef.current;if(!i)return[];const l=Array.from(i.querySelectorAll(`[${R}]`));return Array.from(c.itemMap.values()).sort((C,D)=>l.indexOf(C.ref.current)-l.indexOf(D.ref.current))},[c.collectionRef,c.itemMap])}return[{Provider:u,Slot:A,ItemSlot:y},g,s]}var q="Portal",F=a.forwardRef((e,t)=>{const{container:o,...s}=e,[r,n]=a.useState(!1);k(()=>n(!0),[]);const u=o||r&&globalThis?.document?.body;return u?L.createPortal(M.jsx(j.div,{...s,ref:t}),u):null});F.displayName=q;/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),N=(...e)=>e.filter((t,o,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===o).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var K={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=a.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:o=2,absoluteStrokeWidth:s,className:r="",children:n,iconNode:u,...S},A)=>a.createElement("svg",{ref:A,...K,width:t,height:t,stroke:e,strokeWidth:s?Number(o)*24/Number(t):o,className:N("lucide",r),...S},[...u.map(([E,R])=>a.createElement(E,R)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=(e,t)=>{const o=a.forwardRef(({className:s,...r},n)=>a.createElement(Q,{ref:n,iconNode:t,className:N(`lucide-${G(e)}`,s),...r}));return o.displayName=`${e}`,o};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=W("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);export{F as P,z as X,W as a,J as c,U as t,H as u};
