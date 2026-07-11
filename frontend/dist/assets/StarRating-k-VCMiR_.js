import{c as i,j as e}from"./index-Dos6EgwR.js";/**
 * @license lucide-react v0.316.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=i("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);function d({rating:s=0,max:o=5,size:t=14,showValue:c=!1}){return e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("div",{className:"flex items-center gap-0.5",children:Array.from({length:o},(m,l)=>{const a=l<Math.floor(s),r=!a&&l<s;return e.jsxs("span",{className:"relative inline-block",style:{width:t,height:t},children:[e.jsx(n,{size:t,className:"text-gray-200",fill:"currentColor"}),(a||r)&&e.jsx("span",{className:"absolute inset-0 overflow-hidden",style:{width:r?`${s%1*100}%`:"100%"},children:e.jsx(n,{size:t,className:"text-yellow-400",fill:"currentColor"})})]},l)})}),c&&e.jsx("span",{className:"text-sm font-semibold text-gray-700 ml-1",children:Number(s).toFixed(1)})]})}export{n as S,d as a};
