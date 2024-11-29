import{R as w,u as h,r as t,a as b,c as j,j as e}from"./components-Cj7Yk1Hh.js";import{u as v,c as y,_ as E,P as u}from"./index-_rCr0AGk.js";import{B as l}from"./Button-Bl4KegFP.js";import{A as N}from"./Notification-t-CAZq57.js";import{S as g,T as c}from"./TextInput-CKh2Yhf_.js";import{L as C}from"./index-BgfNTfNX.js";import{a as _,A as T,b as A}from"./bucket-3-B5cXRAyd.js";function f(n){let{className:i,children:m,...o}=n;const r=v(),a=y(`${r}--form`,i);return w.createElement("form",E({className:a},o),m)}f.propTypes={children:u.node,className:u.string};function R(){const n=h(),[i,m]=t.useState(n?.user),o=b(),[r,a]=t.useState({password:"",confirm_password:""}),s=j(),[x,p]=t.useState(!1);return t.useEffect(()=>{s&&s.formError&&p(!0),s&&s.fields&&a(s.fields)},[s]),e.jsxs(e.Fragment,{children:[e.jsxs(C,{className:"w-full max-w-md p-6 mx-auto my-16 mb-16 bg-white border border-solid shadow-lg border-neutral-200",children:[e.jsx("h2",{className:"mb-2 text-4xl font-bold",children:"Welcome"}),e.jsx("p",{className:"mb-10 text-sm",children:"Please use the form below to update your profile"}),e.jsxs(f,{method:"post",children:[e.jsxs(g,{gap:7,className:"mb-2",children:[e.jsx(c,{id:"username",name:"username",readOnly:!0,labelText:"Username",type:"text",value:i.username,autoComplete:"new-password",required:!0}),e.jsx(c,{id:"password",name:"password",labelText:"Password",type:"password",value:r.password,onChange:d=>{a({...r,password:d.target.value})},required:!0,autoComplete:"new-password",invalid:!!s?.fieldErrors?.password||void 0,invalidText:s?.fieldErrors?.password?s?.fieldErrors?.password:void 0}),e.jsx(c,{id:"confirm_password",name:"confirm_password",labelText:"Confirm Password",type:"password",value:r.confirm_password,onChange:d=>{a({...r,confirm_password:d.target.value})},required:!0,autoComplete:"new-password",invalid:!!s?.fieldErrors?.confirm_password||void 0,invalidText:s?.fieldErrors?.confirm_password?s?.fieldErrors?.confirm_password:void 0}),e.jsx(l,{size:"sm",renderIcon:_,type:"submit",children:"Update"})]}),e.jsx("hr",{}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(l,{className:"mt-4",size:"sm",renderIcon:T,type:"button",kind:"secondary",onClick:()=>{o("/create")},children:"Add User"}),e.jsx(l,{hasIconOnly:!0,className:"mt-4",size:"sm",iconDescription:"Connections",renderIcon:A,type:"button",kind:"tertiary",onClick:()=>{o("/connections")},children:"Go to Connections"})]})]})]}),x&&e.jsx("div",{className:"fixed -translate-x-1/2 left-1/2 bottom-10",children:e.jsx(N,{title:"Error",subtitle:s?.formError,closeOnEscape:!0,inline:!1,onClose:()=>p(!1)})})]})}export{R as default};
