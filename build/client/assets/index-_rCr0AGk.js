import{g as T,R as C,r as f}from"./components-Cj7Yk1Hh.js";var i={},r={};try{i.CARBON_ENABLE_CSS_CUSTOM_PROPERTIES&&i.CARBON_ENABLE_CSS_CUSTOM_PROPERTIES==="true"?r.enableCssCustomProperties=!0:r.enableCssCustomProperties=!1,i.CARBON_ENABLE_CSS_GRID&&i.CARBON_ENABLE_CSS_GRID==="true"?r.enableCssGrid=!0:r.enableCssGrid=!1,i.CARBON_ENABLE_V11_RELEASE?i.CARBON_ENABLE_V11_RELEASE==="true"?r.enableV11Release=!0:r.enableV11Release=!1:r.enableV11Release=!0,i.CARBON_ENABLE_EXPERIMENTAL_TILE_CONTRAST&&i.CARBON_ENABLE_EXPERIMENTAL_TILE_CONTRAST==="true"?r.enableExperimentalTileContrast=!0:r.enableExperimentalTileContrast=!1,i.CARBON_ENABLE_V12_TILE_DEFAULT_ICONS&&i.CARBON_ENABLE_V12_TILE_DEFAULT_ICONS==="true"?r.enableV12TileDefaultIcons=!0:r.enableV12TileDefaultIcons=!1,i.CARBON_ENABLE_V12_TILE_RADIO_ICONS&&i.CARBON_ENABLE_V12_TILE_RADIO_ICONS==="true"?r.enableV12TileRadioIcons=!0:r.enableV12TileRadioIcons=!1,i.CARBON_ENABLE_V12_OVERFLOWMENU&&i.CARBON_ENABLE_V12_OVERFLOWMENU==="true"?r.enableV12Overflowmenu=!0:r.enableV12Overflowmenu=!1,i.CARBON_ENABLE_TREEVIEW_CONTROLLABLE&&i.CARBON_ENABLE_TREEVIEW_CONTROLLABLE==="true"?r.enableTreeviewControllable=!0:r.enableTreeviewControllable=!1,i.CARBON_ENABLE_V12_STRUCTURED_LIST_VISIBLE_ICONS&&i.CARBON_ENABLE_V12_STRUCTURED_LIST_VISIBLE_ICONS==="true"?r.enableV12StructuredListVisibleIcons=!0:r.enableV12StructuredListVisibleIcons=!1,i.CARBON_ENABLE_EXPERIMENTAL_FOCUS_WRAP_WITHOUT_SENTINELS&&i.CARBON_ENABLE_EXPERIMENTAL_FOCUS_WRAP_WITHOUT_SENTINELS==="true"?r.enableExperimentalFocusWrapWithoutSentinels=!0:r.enableExperimentalFocusWrapWithoutSentinels=!1,i.CARBON_ENABLE_V12_DYNAMIC_FLOATING_STYLES&&i.CARBON_ENABLE_V12_DYNAMIC_FLOATING_STYLES==="true"?r.enableV12DynamicFloatingStyles=!0:r.enableV12DynamicFloatingStyles=!1}catch{r.enableCssCustomProperties=!1,r.enableCssGrid=!1,r.enableV11Release=!0,r.enableExperimentalTileContrast=!1,r.enableV12TileDefaultIcons=!1,r.enableV12TileRadioIcons=!1,r.enableV12Overflowmenu=!1,r.enableTreeviewControllable=!1,r.enableV12StructuredListVisibleIcons=!1,r.enableExperimentalFocusWrapWithoutSentinels=!1,r.enableV12DynamicFloatingStyles=!1}var y=[{name:"enable-css-custom-properties",description:"Describe what the flag does",enabled:r.enableCssCustomProperties},{name:"enable-css-grid",description:`Enable CSS Grid Layout in the Grid and Column React components
`,enabled:r.enableCssGrid},{name:"enable-v11-release",description:`Enable the features and functionality for the v11 Release
`,enabled:r.enableV11Release},{name:"enable-experimental-tile-contrast",description:`Enable the experimental tile improved contrast styles
`,enabled:r.enableExperimentalTileContrast},{name:"enable-v12-tile-default-icons",description:`Enable rendering of default icons in the tile components
`,enabled:r.enableV12TileDefaultIcons},{name:"enable-v12-tile-radio-icons",description:`Enable rendering of radio icons in the RadioTile component
`,enabled:r.enableV12TileRadioIcons},{name:"enable-v12-overflowmenu",description:`Enable the use of the v12 OverflowMenu leveraging the Menu subcomponents
`,enabled:r.enableV12Overflowmenu},{name:"enable-treeview-controllable",description:`Enable the new TreeView controllable API
`,enabled:r.enableTreeviewControllable},{name:"enable-v12-structured-list-visible-icons",description:`Enable rendering of radio icons in the StructuredList component
`,enabled:r.enableV12StructuredListVisibleIcons},{name:"enable-experimental-focus-wrap-without-sentinels",description:`Enable the new focus wrap behavior that doesn't use sentinel nodes
`,enabled:r.enableExperimentalFocusWrapWithoutSentinels},{name:"enable-v12-dynamic-floating-styles",description:`Enable dynamic setting of floating styles for components like Popover, Tooltip, etc.
`,enabled:r.enableV12DynamicFloatingStyles}];function h(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function L(e){if(Array.isArray(e))return e}function N(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function V(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,D(a.key),a)}}function w(e,n,t){return n&&V(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function B(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=S(e))||n){t&&(e=t);var a=0,o=function(){};return{s:o,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(c){throw c},f:o}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var l,s=!0,u=!1;return{s:function(){t=t.call(e)},n:function(){var c=t.next();return s=c.done,c},e:function(c){u=!0,l=c},f:function(){try{s||t.return==null||t.return()}finally{if(u)throw l}}}}function F(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,o,l,s,u=[],c=!0,E=!1;try{if(l=(t=t.call(e)).next,n!==0)for(;!(c=(a=l.call(t)).done)&&(u.push(a.value),u.length!==n);c=!0);}catch(I){E=!0,o=I}finally{try{if(!c&&t.return!=null&&(s=t.return(),Object(s)!==s))return}finally{if(E)throw o}}return u}}function x(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function P(e,n){return L(e)||F(e,n)||S(e,n)||x()}function W(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}function D(e){var n=W(e,"string");return typeof n=="symbol"?n:n+""}function S(e,n){if(e){if(typeof e=="string")return h(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?h(e,n):void 0}}var j=function(){function e(n){var t=this;N(this,e),this.flags=new Map,n&&Object.keys(n).forEach(function(a){t.flags.set(a,n[a])})}return w(e,[{key:"checkForFlag",value:function(t){if(!this.flags.has(t))throw new Error("Unable to find a feature flag with the name: `".concat(t,"`"))}},{key:"add",value:function(t,a){if(this.flags.has(t))throw new Error("The feature flag: ".concat(t," already exists"));this.flags.set(t,a)}},{key:"enable",value:function(t){this.checkForFlag(t),this.flags.set(t,!0)}},{key:"disable",value:function(t){this.checkForFlag(t),this.flags.set(t,!1)}},{key:"merge",value:function(t){var a=this;Object.keys(t).forEach(function(o){a.flags.set(o,t[o])})}},{key:"mergeWithScope",value:function(t){var a=B(t.flags),o;try{for(a.s();!(o=a.n()).done;){var l=P(o.value,2),s=l[0],u=l[1];this.flags.has(s)||this.flags.set(s,u)}}catch(c){a.e(c)}finally{a.f()}}},{key:"enabled",value:function(t){return this.checkForFlag(t),this.flags.get(t)}}])}(),p=U();for(var _=0;_<y.length;_++){var v=y[_];p.add(v.name,v.enabled)}function U(e){return new j(e)}function Z(){return p.enabled.apply(p,arguments)}function k(){return p.merge.apply(p,arguments)}k({"enable-css-custom-properties":!0,"enable-css-grid":!0,"enable-v11-release":!0,"enable-experimental-tile-contrast":!1,"enable-v12-tile-radio-icons":!1,"enable-v12-structured-list-visible-icons":!1,"enable-v12-dynamic-floating-styles":!1});function m(){return m=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var a in t)({}).hasOwnProperty.call(t,a)&&(e[a]=t[a])}return e},m.apply(null,arguments)}var A={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(e){(function(){var n={}.hasOwnProperty;function t(){for(var l="",s=0;s<arguments.length;s++){var u=arguments[s];u&&(l=o(l,a(u)))}return l}function a(l){if(typeof l=="string"||typeof l=="number")return l;if(typeof l!="object")return"";if(Array.isArray(l))return t.apply(null,l);if(l.toString!==Object.prototype.toString&&!l.toString.toString().includes("[native code]"))return l.toString();var s="";for(var u in l)n.call(l,u)&&l[u]&&(s=o(s,u));return s}function o(l,s){return s?l?l+" "+s:l+s:l}e.exports?(t.default=t,e.exports=t):window.classNames=t})()})(A);var M=A.exports;const ee=T(M),G=C.createContext("cds");function te(){return C.useContext(G)}var g={exports:{}},H="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",Y=H,X=Y;function O(){}function R(){}R.resetWarningCache=O;var $=function(){function e(a,o,l,s,u,c){if(c!==X){var E=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw E.name="Invariant Violation",E}}e.isRequired=e;function n(){return e}var t={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:n,element:e,elementType:e,instanceOf:n,node:e,objectOf:n,oneOf:n,oneOfType:n,shape:n,exact:n,checkPropTypes:R,resetWarningCache:O};return t.PropTypes=t,t};g.exports=$();var q=g.exports;const b=T(q),d={};function K(e,n){function t(a,o,l){if(a[o]!==void 0){(!d[l]||!d[l][o])&&(d[l]={...d[l],[o]:!0});for(var s=arguments.length,u=new Array(s>3?s-3:0),c=3;c<s;c++)u[c-3]=arguments[c];return e(a,o,l,...u)}}return t}const z=typeof window<"u"?f.useLayoutEffect:f.useEffect;var ne=z;function re(e,n,t){const a=f.useRef(null);f.useEffect(()=>{a.current=t},[t]),f.useEffect(()=>{const o=s=>{a.current&&a.current(s)},l="current"in e?e.current:e;return l?.addEventListener?.(n,o),()=>{l?.removeEventListener?.(n,o)}},[e,n])}function ae(e,n){const t=f.useRef(null);f.useEffect(()=>{t.current=n},[n]),f.useEffect(()=>{function a(o){t.current&&t.current(o)}return window.addEventListener(e,a),()=>{window.removeEventListener(e,a)}},[e])}const J=f.createContext(p);b.node,K(b.objectOf(b.bool)),b.bool,b.bool,b.bool,b.bool,b.bool,b.bool;function le(e){return f.useContext(J).enabled(e)}export{b as P,m as _,le as a,ne as b,ee as c,K as d,Z as e,ae as f,re as g,te as u};
