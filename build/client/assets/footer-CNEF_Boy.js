import{P as e,u,c as b,_ as p,d as k}from"./index-_rCr0AGk.js";import{R as l,r as v,j as x}from"./components-Cj7Yk1Hh.js";import{B as T}from"./Button-Bl4KegFP.js";import{w as L}from"./wrapComponent-DVKhoVmh.js";import{p as R}from"./package-4EXXHvaL.js";function B(t){const n=Object.keys(t),o=a=>function(s,r,i){for(var c=arguments.length,d=new Array(c>3?c-3:0),m=3;m<c;m++)d[m-3]=arguments[m];return a(s,r,i,...d)};return n.reduce((a,s)=>({...a,[s]:o(t[s])}),{})}const h=B({"aria-label":e.string,"aria-labelledby":e.string}),H=t=>{let{className:n,children:o,...a}=t;const s=u(),r=b(`${s}--header`,n);return l.createElement("header",p({},a,{className:r}),o)};H.propTypes={...h,className:e.string};const g=l.forwardRef(function(n,o){let{"aria-label":a,"aria-labelledby":s,children:r,className:i,onClick:c,isActive:d,tooltipAlignment:m,...A}=n;const N=u(),C=b({[i]:!!i,[`${N}--header__action`]:!0,[`${N}--header__action--active`]:d}),E={"aria-label":a,"aria-labelledby":s};return l.createElement(T,p({},A,E,{className:C,onClick:c,type:"button",hasIconOnly:!0,iconDescription:a,tooltipPosition:"bottom",tooltipAlignment:m,ref:o}),r)});g.propTypes={...h,children:e.node.isRequired,className:e.string,isActive:e.bool,onClick:e.func,tooltipAlignment:e.oneOf(["start","center","end"])};g.displayName="HeaderGlobalAction";const O=L({name:"HeaderGlobalBar",className:t=>`${t}--header__global`,type:"div"});function _(t,n){let{element:o,as:a,isSideNavExpanded:s,...r}=t;const i=a??o??"a";return l.createElement(i,p({ref:n},r))}const f=v.forwardRef(_),y={as:e.elementType,element:k(e.elementType),isSideNavExpanded:e.bool};f.displayName="Link";f.propTypes=y;function w(t){let{children:n,className:o,prefix:a="IBM",...s}=t;const r=u(),i=b(`${r}--header__name`,o);return l.createElement(f,p({},s,{className:i}),a&&l.createElement(l.Fragment,null,l.createElement("span",{className:`${r}--header__name--prefix`},a)," "),n)}w.propTypes={...y,children:e.node.isRequired,className:e.string,href:e.string,prefix:e.string};function P(t){let{children:n="Skip to main content",className:o,href:a="#main-content",tabIndex:s=0,...r}=t;const i=u(),c=b(`${i}--skip-to-content`,o);return l.createElement("a",p({},r,{className:c,href:a,tabIndex:s}),n)}P.propTypes={children:e.string,className:e.string,href:e.string,tabIndex:e.string};const F=()=>x.jsx("footer",{className:"bottom-0 w-full px-10 py-1 text-center text-white border-t border-solid bg-neutral-900 border-neutral-200",children:x.jsxs("span",{className:"text-sm",children:["© Copyright, 2024 MongoCarbon v",R.version]})});export{h as A,F,H,f as L,P as S,w as a,O as b,g as c,y as d};