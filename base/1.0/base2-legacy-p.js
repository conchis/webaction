/*
  base2 - copyright 2007-2008, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php

  Contributors:
    Doeke Zanstra
*/
window.undefined=void(0);new function(){var i=Array.prototype.slice,j=document.documentElement;window.$Legacy={has:function(a,b){if(a[b]!==undefined)return true;b=String(b);for(var c in a)if(c==b)return true;return false}};var m=NaN/*@cc_on||@_jscript_version@*/;if(m<5.1){var k=onload;onload=function(){with(base2.DOM){var a=DocumentEvent.createEvent(document,"Events");Event.initEvent(a,"DOMContentLoaded",true,false);EventTarget.dispatchEvent(document,a)}if(k)k()}}if(typeof encodeURIComponent=="undefined"){encodeURIComponent=function(b){return escape(b).replace(/\%(21|7E|27|28|29)/g,unescape).replace(/[@+\/]/g,function(a){return"%"+a.charCodeAt(0).toString(16).toUpperCase()})};decodeURIComponent=unescape}if(!window.Error){h("Error");h("TypeError");h("SyntaxError");h("ReferenceError")}function h(b){if(typeof window[b]=="undefined"){var c=window[b]=function(a){this.message=a};c.prototype=new window.Error;c.prototype.name=b}};function f(a,b,c){if(!a.prototype[b]){a.prototype[b]=c}};if("11".slice(-1)!="1"){var n=String.prototype.slice;String.prototype.slice=function(a,b){if(arguments.length==1&&a<0){arguments[0]=this.length+a;arguments[1]=-a}return n.apply(this,arguments)}}if(!Array.prototype.unshift){f(Array,"pop",function(){if(this.length){var a=this[this.length-1];this.length--;return a}return undefined});f(Array,"push",function(){for(var a=0;a<arguments.length;a++){this[this.length]=arguments[a]}return this.length});f(Array,"shift",function(){var a=this[0];if(this.length){var b=this.slice(1),c=b.length;while(c--)this[c]=b[c];this.length--}return a});f(Array,"splice",function(a,b){var c=b?this.slice(a,a+b):[];var d=this.slice(0,a).concat(i.apply(arguments,[2])).concat(this.slice(a+b));this.length=a=d.length;while(a--)this[a]=d[a];return c});f(Array,"unshift",function(){var a=this.concat.call(i.apply(arguments,[0]),this),b=a.length;while(b--)this[b]=a[b];return this.length})}if(!Function.prototype.apply){var o=this;f(Function,"apply",function(a,b){var c="*apply",d;if(a===undefined)a=o;else if(a==null)a=window;else if(typeof a=="string")a=new String(a);else if(typeof a=="number")a=new Number(a);else if(typeof a=="boolean")a=new Boolean(a);if(arguments.length==1)b=[];else if(b[0]&&b[0].writeln)b[0]=b[0].documentElement.document||b[0];a[c]=this;switch(b.length){case 0:d=a[c]();break;case 1:d=a[c](b[0]);break;case 2:d=a[c](b[0],b[1]);break;case 3:d=a[c](b[0],b[1],b[2]);break;case 4:d=a[c](b[0],b[1],b[2],b[3]);break;case 5:d=a[c](b[0],b[1],b[2],b[3],b[4]);break;default:var g=[],e=b.length-1;do g[e]="b["+e+"]";while(e--);eval("d=a[c]("+g+")")}if(typeof a.valueOf=="function"){delete a[c]}else{a[c]=undefined;if(d&&d.writeln)d=d.documentElement.document||d}return d});f(Function,"call",function(a){return this.apply(a,i.apply(arguments,[1]))})}f(Number,"toFixed",function(a){a=parseInt(a);var b=Math.pow(10,a);b=String(Math.round(this*b)/b);if(a>0){b=b.split(".");if(!b[1])b[1]="";b[1]+=Array(a-b[1].length+1).join(0);b=b.join(".")};return b});if("".replace(/^/,String)){var p=/(g|gi)$/;var q=/([\/()[\]{}|*+-.,^$?\\])/g;var r=String.prototype.replace;String.prototype.replace=function(a,b){if(typeof b=="function"){if(a&&a.constructor==RegExp){var c=a;var d=c.global;if(d==null)d=p.test(c);if(d)c=new RegExp(c.source)}else{c=new RegExp(String(a).replace(q,"\\$1"))}var g,e=this,l="";while(e&&(g=c.exec(e))){l+=e.slice(0,g.index)+b.apply(this,g);e=e.slice(g.index+g[0].length);if(!d)break}return l+e}return r.apply(this,arguments)}}if(window.Components){try{var s=getComputedStyle(j,null);var t=s.display}catch(ex){}finally{if(!t){var UPPER_CASE=/[A-Z]/g;function dashLowerCase(a){return"-"+a.toLowerCase()};function assignStyleGetter(a){var b=a.replace(UPPER_CASE,dashLowerCase);CSSStyleDeclaration.prototype.__defineGetter__(a,function(){return this.getPropertyValue(b)})};for(var propertyName in j.style){if(typeof j.style[propertyName]=="string"){assignStyleGetter(propertyName)}}}}if(parseInt(navigator.productSub)<20040614){HTMLInputElement.prototype.__defineGetter__("clientWidth",function(){var a=getComputedStyle(this,null);return this.offsetWidth-parseInt(a.borderLeftWidth)-parseInt(a.borderRightWidth)});HTMLInputElement.prototype.__defineGetter__("clientHeight",function(){var a=getComputedStyle(this,null);return this.offsetHeight-parseInt(a.borderTopWidth)-parseInt(a.borderBottomWidth)})}}};