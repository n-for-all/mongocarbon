import{w as p,x as h,y as f,z as j,r as u,_ as y,j as s,O as S,M as w,A as g,S as T}from"./components-DSNIqDDq.js";import{u as v}from"./x-BntEkNr0.js";import{a as k,b as M,c as O,d as L,e as N,f as R}from"./toast-Dkcvh1Y8.js";import"./createLucideIcon-Dkhr3css.js";import"./utils-DcAaEMf9.js";/**
 * @remix-run/react v2.17.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let d="positions";function _({getKey:t,...n}){let{isSpaMode:o}=p(),e=h(),a=f();j({getKey:t,storageKey:d});let l=u.useMemo(()=>{if(!t)return null;let r=t(e,a);return r!==e.key?r:null},[]);if(o)return null;let m=((r,x)=>{if(!window.history.state||!window.history.state.key){let i=Math.random().toString(32).slice(2);window.history.replaceState({key:i},"")}try{let c=JSON.parse(sessionStorage.getItem(r)||"{}")[x||window.history.state.key];typeof c=="number"&&window.scrollTo(0,c)}catch(i){console.error(i),sessionStorage.removeItem(r)}}).toString();return u.createElement("script",y({},n,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${m})(${JSON.stringify(d)}, ${JSON.stringify(l)})`}}))}function b(){const{toasts:t}=v();return s.jsxs(k,{children:[t.map(function({id:n,title:o,description:e,action:a,...l}){return s.jsxs(M,{...l,children:[s.jsxs("div",{className:"grid gap-1",children:[o&&s.jsx(O,{children:o}),e&&s.jsx(L,{children:e})]}),a,s.jsx(N,{})]},n)}),s.jsx(R,{})]})}const C=()=>[{rel:"icon",type:"image/svg+xml",href:"/favicon.svg"}];function H({children:t}){return s.jsxs("html",{lang:"en",children:[s.jsxs("head",{children:[s.jsx("meta",{charSet:"utf-8"}),s.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),s.jsx(w,{}),s.jsx(g,{})]}),s.jsxs("body",{children:[t,s.jsx(_,{}),s.jsx(T,{}),s.jsx(b,{})]})]})}function z(){return s.jsx(S,{})}export{H as Layout,z as default,C as links};
