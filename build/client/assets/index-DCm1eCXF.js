import{R as g}from"./components-Cj7Yk1Hh.js";import{I as rt}from"./Button-Bl4KegFP.js";var tt,et;const dt=g.forwardRef(function(o,r){let{children:s,size:l=16,...n}=o;return g.createElement(rt,{width:l,height:l,ref:r,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32",fill:"currentColor",...n},tt||(tt=g.createElement("path",{d:"M8 15H24V17H8z"})),s)}),at=g.forwardRef(function(o,r){let{children:s,size:l=16,...n}=o;return g.createElement(rt,{width:l,height:l,ref:r,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32",fill:"currentColor",...n},et||(et=g.createElement("path",{d:"M27,3H5A2,2,0,0,0,3,5V27a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V5A2,2,0,0,0,27,3Zm0,2V9H5V5ZM17,11H27v7H17Zm-2,7H5V11H15ZM5,20H15v7H5Zm12,7V20H27v7Z"})),s)}),ot=t=>typeof t=="object"&&t!=null&&t.nodeType===1,nt=(t,o)=>(!o||t!=="hidden")&&t!=="visible"&&t!=="clip",q=(t,o)=>{if(t.clientHeight<t.scrollHeight||t.clientWidth<t.scrollWidth){const r=getComputedStyle(t,null);return nt(r.overflowY,o)||nt(r.overflowX,o)||(s=>{const l=(n=>{if(!n.ownerDocument||!n.ownerDocument.defaultView)return null;try{return n.ownerDocument.defaultView.frameElement}catch{return null}})(s);return!!l&&(l.clientHeight<s.scrollHeight||l.clientWidth<s.scrollWidth)})(t)}return!1},L=(t,o,r,s,l,n,a,i)=>n<t&&a>o||n>t&&a<o?0:n<=t&&i<=r||a>=o&&i>=r?n-t-s:a>o&&i<r||n<t&&i>r?a-o+l:0,st=t=>{const o=t.parentElement;return o??(t.getRootNode().host||null)},ft=(t,o)=>{var r,s,l,n;if(typeof document>"u")return[];const{scrollMode:a,block:i,inline:f,boundary:z,skipOverflowHiddenElements:lt}=o,it=typeof z=="function"?z:p=>p!==z;if(!ot(t))throw new TypeError("Invalid target");const G=document.scrollingElement||document.documentElement,V=[];let h=t;for(;ot(h)&&it(h);){if(h=st(h),h===G){V.push(h);break}h!=null&&h===document.body&&q(h)&&!q(document.documentElement)||h!=null&&q(h,lt)&&V.push(h)}const w=(s=(r=window.visualViewport)==null?void 0:r.width)!=null?s:innerWidth,H=(n=(l=window.visualViewport)==null?void 0:l.height)!=null?n:innerHeight,{scrollX:b,scrollY:v}=window,{height:W,width:M,top:y,right:X,bottom:A,left:E}=t.getBoundingClientRect(),{top:J,right:K,bottom:P,left:Q}=(p=>{const e=window.getComputedStyle(p);return{top:parseFloat(e.scrollMarginTop)||0,right:parseFloat(e.scrollMarginRight)||0,bottom:parseFloat(e.scrollMarginBottom)||0,left:parseFloat(e.scrollMarginLeft)||0}})(t);let c=i==="start"||i==="nearest"?y-J:i==="end"?A+P:y+W/2-J+P,d=f==="center"?E+M/2-Q+K:f==="end"?X+K:E-Q;const Y=[];for(let p=0;p<V.length;p++){const e=V[p],{height:x,width:R,top:T,right:_,bottom:j,left:S}=e.getBoundingClientRect();if(a==="if-needed"&&y>=0&&E>=0&&A<=H&&X<=w&&y>=T&&A<=j&&E>=S&&X<=_)return Y;const B=getComputedStyle(e),C=parseInt(B.borderLeftWidth,10),I=parseInt(B.borderTopWidth,10),F=parseInt(B.borderRightWidth,10),Z=parseInt(B.borderBottomWidth,10);let u=0,m=0;const k="offsetWidth"in e?e.offsetWidth-e.clientWidth-C-F:0,D="offsetHeight"in e?e.offsetHeight-e.clientHeight-I-Z:0,N="offsetWidth"in e?e.offsetWidth===0?0:R/e.offsetWidth:0,O="offsetHeight"in e?e.offsetHeight===0?0:x/e.offsetHeight:0;if(G===e)u=i==="start"?c:i==="end"?c-H:i==="nearest"?L(v,v+H,H,I,Z,v+c,v+c+W,W):c-H/2,m=f==="start"?d:f==="center"?d-w/2:f==="end"?d-w:L(b,b+w,w,C,F,b+d,b+d+M,M),u=Math.max(0,u+v),m=Math.max(0,m+b);else{u=i==="start"?c-T-I:i==="end"?c-j+Z+D:i==="nearest"?L(T,j,x,I,Z+D,c,c+W,W):c-(T+x/2)+D/2,m=f==="start"?d-S-C:f==="center"?d-(S+R/2)+k/2:f==="end"?d-_+F+k:L(S,_,R,C,F+k,d,d+M,M);const{scrollLeft:U,scrollTop:$}=e;u=O===0?0:Math.max(0,Math.min($+u/O,e.scrollHeight-x/O+D)),m=N===0?0:Math.max(0,Math.min(U+m/N,e.scrollWidth-R/N+k)),c+=$-u,d+=U-m}Y.push({el:e,top:u,left:m})}return Y};export{dt as S,at as T,ft as r};
