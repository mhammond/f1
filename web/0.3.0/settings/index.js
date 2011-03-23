/*
 blade/func Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/object Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/jig Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/array Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/url Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
*/
define("blade/fn",[],function(){var f=Array.prototype.slice,b=Object.prototype.toString;return{is:function(d){return b.call(d)==="[object Function]"},bind:function(d,c){if(!c)return d;if(typeof c==="string")c=d[c];var a=f.call(arguments,2);return function(){return c.apply(d,a.concat(f.call(arguments,0)))}}}});
define("blade/object",["./fn"],function(f){function b(){}var d={},c=function(a,e,h){a=a||{};var j,p=c.create(a.prototype,e);a=function(q,m,n){return p[m].apply(q,n)};e=c.create(p);c.mixin(e,f.is(h)?h(a):h,true);j=function(){if(!(this instanceof j))throw new Error('blade/object: constructor function called without "new" in front');this.init&&this.init.apply(this,arguments)};j.prototype=e;return j};c.create=function(a,e){b.prototype=a;a=new b;var h,j;b.prototype=null;if(e)for(h=0;j=e[h];h++)c.mixin(a,
j);return a};c.mixin=function(a,e,h){for(var j in e)if(!(j in d)&&(!(j in a)||h))a[j]=e[j]};return c});
define("blade/jig",["require","./object"],function(f,b){function d(g){return v.call(g)==="[object Array]"}function c(g,i,l){i=i;var k,o;for(k=0;i&&(o=g[k]);k++)i=typeof i==="object"&&o in i?i[o]:l&&k===0&&o in l?l[o]:undefined;return i}function a(g){return g?parseInt(g,10):0}function e(g,i,l){var k=/\[([\w0-9\.'":]+)\]/,o=g,r=i,t=true,x,A;if(g===w)return i;if(E.test(g))return a(g);if(g==="")return"";x=g.charAt(0);if(x==="'"||x==="'")return g.substring(1,g.length-1);if((x=g.indexOf("("))!==-1){k=g.lastIndexOf(")");
t=g.substring(0,x);o=l.fn[t];if(!o){n.error("Cannot find function named: "+t+" for "+g);return""}t=g.substring(x+1,k);if(t.indexOf(",")!==-1){t=t.split(",");for(r=t.length-1;r>=0;r--)t[r]=e(t[r],i,l);o=o.apply(null,t)}else o=o(e(t,i,l));if(k<g.length-1){if(g.charAt(k+1)===".")k+=1;return e(g.substring(k+1,g.length),o,l)}else return o}for(;x=k.exec(o);){i=x[1].replace(/['"]/g,"");A=o.substring(0,x.index);o=o.substring(x.index+x[0].length,o.length);if(o.indexOf(".")===0)o=o.substring(1,o.length);r=
c(A.split("."),r,t?l.context:null);t=false;if(!r&&i){n.error('blade/jig: No property "'+i+'" on '+r);return""}if(i.indexOf(":")!==-1){x=i.split(":");i=a(x[0]);r=(x=a(x[1]))?r.slice(i,x):r.slice(i)}else{l.strict&&!(i in r)&&n.error('blade/jig: no property "'+i+'"');r=r[i]}r=r}o=o?c(o.split("."),r,t?l.context:null):r;l.strict&&o===undefined&&n.error('blade/jig: undefined value for property "'+g+'"');return o}function h(g,i){i=i||{};var l=n.cache(g,i);if(l===undefined&&typeof document!=="undefined"){(l=
document.getElementById(g))&&n.parse([l],i);l=n.cache(g,i)}if(l===undefined)throw new Error("blade/jig: no template or node with ID: "+g);return l}function j(g,i){for(var l=[],k=0,o=false,r=0,t,x,A,L,N,J;(t=g.indexOf(i.startToken,k))!==-1;){t!==k&&l.push(g.substring(k,t));k=g.substring(t);if(x=i.endRegExp.exec(k)){k=t+x[0].length;A=g.substring(t+i.startToken.length,t+x[0].length-i.endToken.length).trim();A=z(A);if(C.test(A))throw new Error("blade/jig: end block tags should not be commented: "+A);
t=A.charAt(0);if(t==="]"&&r){o=A.substring(1).trim();if(o==="[")t=">";else{t=o.charAt(0);A=o}}if(t&&!i.propertyRegExp.test(t))A=A.substring(1).trim();else t="_default_";if(o=A.indexOf(i.rawHtmlToken)===0)A=A.substring(i.rawHtmlToken.length,A.length);if(t===y)o=true;A=A.split(i.argSeparator);L=A[A.length-1];N=L.charAt(L.length-1);J=null;if(t==="]"){if(N!=="["){l.templateEnd=k;l.endControl=true}else l.templateEnd=k-x[0].length;return l}else if(N==="["){r||(r=H++);A[A.length-1]=L.substring(0,L.length-
1);J=j(g.substring(k),i);k+=J.templateEnd}if(t==="+")i.templates[A[0]]=J;else if(t!=="/"){if(A.length>1)for(x=A.length-1;x>=0;x--)if(A[x].charAt(A[x].length-1)===","){A[x]+=A[x+1];A.splice(x+1,1)}l.push({action:i.commands[t].action,useRawHtml:o,args:A,controlId:r,children:J})}if(J&&J.endControl)r=0}else{l.push(k);return l}}k!==g.length-1&&l.push(g.substring(k,g.length));return l}function p(g,i){var l,k=g.id;l=i.templates||G;if(l[k])return l[k];i.onBeforeParse&&i.onBeforeParse(g);if(g.nodeName.toUpperCase()===
"SCRIPT"){l=g.text.trim();g.parentNode&&g.parentNode.removeChild(g)}else{K.appendChild(g);g.removeAttribute("id");(l=(g.getAttribute("class")||"").trim())&&g.setAttribute("class",l.replace(M,"$1$3"));l=K.innerHTML.replace(/%7B/g,"{").replace(/%7D/g,"}");K.removeChild(g)}g=n.compile(l,i);n.cache(k,g,i);return g}function q(g,i,l){var k="",o,r,t,x,A;if(typeof g==="string")k=g;else if(d(g))for(o=0;o<g.length;o++){t=g[o].controlId;if(!t||t!==r||!A){x=q(g[o],i,l);k+=x;if(t){r=t;A=x}}}else if(k=g.action(g.args,
i,l,g.children,q)){if(!g.useRawHtml&&!g.children)k=n.htmlEscape(k.toString())}else k="";if(l.attachData)if(B.test(k)){g="id"+F++;k=k.replace(B,'$& data-blade-jig="'+g+'" ');I[g]=i}return k}function m(g){g.fn.jig=function(i,l){l=l||{};var k=this.selector;if(k.charAt(0)!=="#")throw new Error('blade/jig: only ID selectors, like "#something" are allowed with jig()');k=k.substring(1,k.length);(k=(l.templates||G)[k])||(k=p(this[0]));return g(n.render(k,i,l))}}var n,u,v=Object.prototype.toString,z=typeof decodeURIComponent===
"undefined"?function(){}:decodeURIComponent,y="#",s=/[_\[\^\w]/,w="_",B=/<\s*\w+/,E=/^\d+$/,C=/\/(\/)?\s*\]/,G={},D={openCurly:function(){return"{"},closeCurly:function(){return"}"},eq:function(g,i){return g===i},gt:function(g,i){return g>i},gte:function(g,i){return g>=i},lt:function(g,i){return g<i},lte:function(g,i){return g<=i},or:function(g,i){return g||i},and:function(g,i){return g&&i},is:function(g){return!!g},eachProp:function(g){var i,l=[];for(i in g)g.hasOwnProperty(i)&&l.push({prop:i,value:g[i]});
return l.sort(function(k,o){return k.prop>o.prop?1:-1})}},F=1,H=1,I={},K=typeof document!=="undefined"&&document.createElement?document.createElement("div"):null,M=/(\s*)(template)(\s*)/;u={_default_:{doc:"Property reference",action:function(g,i,l,k,o){var r=g[0]?e(g[0],i,l):i,t=g[1]?e(g[1],i,l):undefined,x="";if(g[1]){t=r===t;r=i}else t=r;if(t===false||t===null||t===undefined||d(t)&&!t.length)return"";else if(k)if(d(r))for(g=0;g<r.length;g++)x+=o(k,r[g],l);else{if(typeof r==="boolean")r=i;x=o(k,
r,l)}else x=r;return x}},"!":{doc:"Not",action:function(g,i,l,k,o){var r=e(g[0],i,l),t=g[1]?e(g[1],i,l):undefined;t=g[1]?r===t:r;if(k&&!t)return o(k,i,l);return""}},"#":{doc:"Template reference",action:function(g,i,l,k,o){k=h(g[0],l);i=e(g.length>1?g[1]:w,i,l);return o(k,i,l)}},".":{doc:"Variable declaration",action:function(g,i,l){l.context[g[0]]=e(g[1],i,l);return""}},">":{doc:"Else",action:function(g,i,l,k,o){if(k)return o(k,i,l);return""}}};n=function(g,i,l){if(typeof g==="string")if(g.charAt(0)===
"#"){g=g.substring(1,g.length);g=h(g,l)}else g=n.compile(g,l);return n.render(g,i,l)};n.htmlEscape=function(g){return g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};n.compile=function(g,i){i=i||{};b.mixin(i,{startToken:"{",endToken:"}",rawHtmlToken:"^",propertyRegExp:s,commands:u,argSeparator:" ",templates:G});i.endRegExp=/[^\r\n]*?}/;H=1;return j(g,i)};n.parse=function(g,i){if(g&&!g.length){i=g;g=null}i=i||{};g=g||document.querySelectorAll('.template, script[type="text/template"]');
var l,k;for(k=g.length-1;k>-1&&(l=g[k]);k--)p(l,i)};n.render=function(g,i,l){var k,o="";l=l||{};b.mixin(l,{templates:G,attachData:false,strict:n.strict});if(l.fn)b.mixin(l.fn,D);else l.fn=D;l.context=l.context||b.create(i);if(d(i)){for(k=0;k<i.length;k++)o+=q(g,i[k],l);return o}return q(g,i,l)};n.strict=false;n.error=function(g){throw g;};n.addFn=function(g){b.mixin(D,g,true)};n.data=function(g,i){if(typeof g!=="string"){g.nodeType||(g=g[0]);g=g.getAttribute("data-blade-jig")}return i!==undefined?
(I[g]=i):I[g]};n.removeData=function(g){delete I[g]};n.getObject=e;n.cache=function(g,i,l){if(typeof i==="string")i=n.compile(i,l);if(!d(i)){l=i;i=undefined}l=l&&l.templates||G;if(i!==undefined)l[g]=i;return l[g]||G[g]};typeof jQuery!=="undefined"&&m(jQuery);return n});
define("friendly",["require","exports","module"],function(){var f={timestamp:function(b){return f.date(new Date(b*1E3))},date:function(b){var d=((new Date).getTime()-b.getTime())/1E3,c=Math.floor(d/86400),a={friendly:b.toLocaleDateString(),additional:b.toLocaleTimeString(),utc:b.toUTCString(),locale:b.toLocaleString()};if(c<0){a.friendly="in the future";return a}else if(isNaN(c)){a.friendly=a.additional="unknown";return a}if(c===0){if(d<60){a.friendly="just now";return a}if(d<150){a.friendly="a minute ago";
return a}if(d<3600){a.friendly=Math.floor(d/60)+" minutes ago";return a}if(d<7200){a.friendly="1 hour ago";return a}if(d<86400){a.friendly=Math.floor(d/3600)+" hours ago";return a}}if(c===1){a.friendly="yesterday";return a}if(c<7){a.friendly=c+" days ago";return a}if(c<8){a.friendly="last week";return a}if(c<31){a.friendly=Math.ceil(c/7)+" weeks ago";return a}if(c<62){a.friendly="a month ago";return a}if(c<365){a.friendly=Math.ceil(c/31)+" months ago";return a}if(c>=365&&c<730){a.additional=b.toLocaleDateString();
a.friendly="a year ago";return a}if(c>=365){a.additional=b.toLocaleDateString();a.friendly=Math.ceil(c/365)+" years ago";return a}return a},name:function(b){b=b.split(" ")[0];if(b.indexOf("@")!==-1)b=b.split("@")[0];b=b.replace(" ","");b=b.replace("'","");return b=b.replace('"',"")}};return f});
define("isoDate",[],function(){var f=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+\-](\d{2}):(\d{2}))|Z)?)?$/,b=function(d,c){var a=f.exec(d);d=null;var e,h;if(a){a.shift();a[1]&&a[1]--;if(a[6])a[6]*=1E3;if(c){c=new Date(c);["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"].map(function(j){return c["get"+j]()}).forEach(function(j,p){a[p]=a[p]||j})}d=new Date(a[0]||1970,a[1]||0,a[2]||1,a[3]||0,a[4]||0,a[5]||0,a[6]||0);if(a[0]<100)d.setFullYear(a[0]||
1970);e=0;h=a[7]&&a[7].charAt(0);if(h!=="Z"){e=(a[8]||0)*60+(Number(a[9])||0);if(h!=="-")e*=-1}if(h)e-=d.getTimezoneOffset();e&&d.setTime(d.getTime()+e*6E4)}return d};b.toIsoString=function(d,c){var a=function(p){return p<10?"0"+p:p},e,h,j;c=c||{};e=[];h=c.zulu?"getUTC":"get";j="";if(c.selector!=="time"){j=d[h+"FullYear"]();j=["0000".substr((j+"").length)+j,a(d[h+"Month"]()+1),a(d[h+"Date"]())].join("-")}e.push(j);if(c.selector!=="date"){j=[a(d[h+"Hours"]()),a(d[h+"Minutes"]()),a(d[h+"Seconds"]())].join(":");
h=d[h+"Milliseconds"]();if(c.milliseconds)j+="."+(h<100?"0":"")+a(h);if(c.zulu)j+="Z";else if(c.selector!=="time"){d=d.getTimezoneOffset();c=Math.abs(d);j+=(d>0?"-":"+")+a(Math.floor(c/60))+":"+a(c%60)}e.push(j)}return e.join("T")};return b});var EXPORTED_SYMBOLS=["hex_md5"],hexcase=0,b64pad="";function hex_md5(f){return rstr2hex(rstr_md5(str2rstr_utf8(f)))}function b64_md5(f){return rstr2b64(rstr_md5(str2rstr_utf8(f)))}function any_md5(f,b){return rstr2any(rstr_md5(str2rstr_utf8(f)),b)}
function hex_hmac_md5(f,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)))}function b64_hmac_md5(f,b){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)))}function any_hmac_md5(f,b,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)),d)}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(f){return binl2rstr(binl_md5(rstr2binl(f),f.length*8))}
function rstr_hmac_md5(f,b){var d=rstr2binl(f);if(d.length>16)d=binl_md5(d,f.length*8);var c=Array(16);f=Array(16);for(var a=0;a<16;a++){c[a]=d[a]^909522486;f[a]=d[a]^1549556828}b=binl_md5(c.concat(rstr2binl(b)),512+b.length*8);return binl2rstr(binl_md5(f.concat(b),640))}function rstr2hex(f){for(var b=hexcase?"0123456789ABCDEF":"0123456789abcdef",d="",c,a=0;a<f.length;a++){c=f.charCodeAt(a);d+=b.charAt(c>>>4&15)+b.charAt(c&15)}return d}
function rstr2b64(f){for(var b="",d=f.length,c=0;c<d;c+=3)for(var a=f.charCodeAt(c)<<16|(c+1<d?f.charCodeAt(c+1)<<8:0)|(c+2<d?f.charCodeAt(c+2):0),e=0;e<4;e++)b+=c*8+e*6>f.length*8?b64pad:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(a>>>6*(3-e)&63);return b}
function rstr2any(f,b){var d=b.length,c,a,e,h,j,p=Array(Math.ceil(f.length/2));for(c=0;c<p.length;c++)p[c]=f.charCodeAt(c*2)<<8|f.charCodeAt(c*2+1);var q=Math.ceil(f.length*8/(Math.log(b.length)/Math.log(2)));f=Array(q);for(a=0;a<q;a++){j=Array();for(c=h=0;c<p.length;c++){h=(h<<16)+p[c];e=Math.floor(h/d);h-=e*d;if(j.length>0||e>0)j[j.length]=e}f[a]=h;p=j}d="";for(c=f.length-1;c>=0;c--)d+=b.charAt(f[c]);return d}
function str2rstr_utf8(f){for(var b="",d=-1,c,a;++d<f.length;){c=f.charCodeAt(d);a=d+1<f.length?f.charCodeAt(d+1):0;if(55296<=c&&c<=56319&&56320<=a&&a<=57343){c=65536+((c&1023)<<10)+(a&1023);d++}if(c<=127)b+=String.fromCharCode(c);else if(c<=2047)b+=String.fromCharCode(192|c>>>6&31,128|c&63);else if(c<=65535)b+=String.fromCharCode(224|c>>>12&15,128|c>>>6&63,128|c&63);else if(c<=2097151)b+=String.fromCharCode(240|c>>>18&7,128|c>>>12&63,128|c>>>6&63,128|c&63)}return b}
function str2rstr_utf16le(f){for(var b="",d=0;d<f.length;d++)b+=String.fromCharCode(f.charCodeAt(d)&255,f.charCodeAt(d)>>>8&255);return b}function str2rstr_utf16be(f){for(var b="",d=0;d<f.length;d++)b+=String.fromCharCode(f.charCodeAt(d)>>>8&255,f.charCodeAt(d)&255);return b}function rstr2binl(f){for(var b=Array(f.length>>2),d=0;d<b.length;d++)b[d]=0;for(d=0;d<f.length*8;d+=8)b[d>>5]|=(f.charCodeAt(d/8)&255)<<d%32;return b}
function binl2rstr(f){for(var b="",d=0;d<f.length*32;d+=8)b+=String.fromCharCode(f[d>>5]>>>d%32&255);return b}
function binl_md5(f,b){f[b>>5]|=128<<b%32;f[(b+64>>>9<<4)+14]=b;b=1732584193;for(var d=-271733879,c=-1732584194,a=271733878,e=0;e<f.length;e+=16){var h=b,j=d,p=c,q=a;b=md5_ff(b,d,c,a,f[e+0],7,-680876936);a=md5_ff(a,b,d,c,f[e+1],12,-389564586);c=md5_ff(c,a,b,d,f[e+2],17,606105819);d=md5_ff(d,c,a,b,f[e+3],22,-1044525330);b=md5_ff(b,d,c,a,f[e+4],7,-176418897);a=md5_ff(a,b,d,c,f[e+5],12,1200080426);c=md5_ff(c,a,b,d,f[e+6],17,-1473231341);d=md5_ff(d,c,a,b,f[e+7],22,-45705983);b=md5_ff(b,d,c,a,f[e+8],7,
1770035416);a=md5_ff(a,b,d,c,f[e+9],12,-1958414417);c=md5_ff(c,a,b,d,f[e+10],17,-42063);d=md5_ff(d,c,a,b,f[e+11],22,-1990404162);b=md5_ff(b,d,c,a,f[e+12],7,1804603682);a=md5_ff(a,b,d,c,f[e+13],12,-40341101);c=md5_ff(c,a,b,d,f[e+14],17,-1502002290);d=md5_ff(d,c,a,b,f[e+15],22,1236535329);b=md5_gg(b,d,c,a,f[e+1],5,-165796510);a=md5_gg(a,b,d,c,f[e+6],9,-1069501632);c=md5_gg(c,a,b,d,f[e+11],14,643717713);d=md5_gg(d,c,a,b,f[e+0],20,-373897302);b=md5_gg(b,d,c,a,f[e+5],5,-701558691);a=md5_gg(a,b,d,c,f[e+
10],9,38016083);c=md5_gg(c,a,b,d,f[e+15],14,-660478335);d=md5_gg(d,c,a,b,f[e+4],20,-405537848);b=md5_gg(b,d,c,a,f[e+9],5,568446438);a=md5_gg(a,b,d,c,f[e+14],9,-1019803690);c=md5_gg(c,a,b,d,f[e+3],14,-187363961);d=md5_gg(d,c,a,b,f[e+8],20,1163531501);b=md5_gg(b,d,c,a,f[e+13],5,-1444681467);a=md5_gg(a,b,d,c,f[e+2],9,-51403784);c=md5_gg(c,a,b,d,f[e+7],14,1735328473);d=md5_gg(d,c,a,b,f[e+12],20,-1926607734);b=md5_hh(b,d,c,a,f[e+5],4,-378558);a=md5_hh(a,b,d,c,f[e+8],11,-2022574463);c=md5_hh(c,a,b,d,f[e+
11],16,1839030562);d=md5_hh(d,c,a,b,f[e+14],23,-35309556);b=md5_hh(b,d,c,a,f[e+1],4,-1530992060);a=md5_hh(a,b,d,c,f[e+4],11,1272893353);c=md5_hh(c,a,b,d,f[e+7],16,-155497632);d=md5_hh(d,c,a,b,f[e+10],23,-1094730640);b=md5_hh(b,d,c,a,f[e+13],4,681279174);a=md5_hh(a,b,d,c,f[e+0],11,-358537222);c=md5_hh(c,a,b,d,f[e+3],16,-722521979);d=md5_hh(d,c,a,b,f[e+6],23,76029189);b=md5_hh(b,d,c,a,f[e+9],4,-640364487);a=md5_hh(a,b,d,c,f[e+12],11,-421815835);c=md5_hh(c,a,b,d,f[e+15],16,530742520);d=md5_hh(d,c,a,
b,f[e+2],23,-995338651);b=md5_ii(b,d,c,a,f[e+0],6,-198630844);a=md5_ii(a,b,d,c,f[e+7],10,1126891415);c=md5_ii(c,a,b,d,f[e+14],15,-1416354905);d=md5_ii(d,c,a,b,f[e+5],21,-57434055);b=md5_ii(b,d,c,a,f[e+12],6,1700485571);a=md5_ii(a,b,d,c,f[e+3],10,-1894986606);c=md5_ii(c,a,b,d,f[e+10],15,-1051523);d=md5_ii(d,c,a,b,f[e+1],21,-2054922799);b=md5_ii(b,d,c,a,f[e+8],6,1873313359);a=md5_ii(a,b,d,c,f[e+15],10,-30611744);c=md5_ii(c,a,b,d,f[e+6],15,-1560198380);d=md5_ii(d,c,a,b,f[e+13],21,1309151649);b=md5_ii(b,
d,c,a,f[e+4],6,-145523070);a=md5_ii(a,b,d,c,f[e+11],10,-1120210379);c=md5_ii(c,a,b,d,f[e+2],15,718787259);d=md5_ii(d,c,a,b,f[e+9],21,-343485551);b=safe_add(b,h);d=safe_add(d,j);c=safe_add(c,p);a=safe_add(a,q)}return Array(b,d,c,a)}function md5_cmn(f,b,d,c,a,e){return safe_add(bit_rol(safe_add(safe_add(b,f),safe_add(c,e)),a),d)}function md5_ff(f,b,d,c,a,e,h){return md5_cmn(b&d|~b&c,f,b,a,e,h)}function md5_gg(f,b,d,c,a,e,h){return md5_cmn(b&c|d&~c,f,b,a,e,h)}
function md5_hh(f,b,d,c,a,e,h){return md5_cmn(b^d^c,f,b,a,e,h)}function md5_ii(f,b,d,c,a,e,h){return md5_cmn(d^(b|~c),f,b,a,e,h)}function safe_add(f,b){var d=(f&65535)+(b&65535);return(f>>16)+(b>>16)+(d>>16)<<16|d&65535}function bit_rol(f,b){return f<<b|f>>>32-b}define("md5",function(){});
define("rdapi",["require","jquery","blade/object","blade/jig","friendly","isoDate","md5"],function(f,b,d,c,a,e){function h(s){if(typeof s==="string")s={template:s};else if(s.templateId)s.template=c.cache(s.templateId);if(!("attachData"in s))s.attachData=m.attachTemplateData;if(s.emptyTemplateId)s.emptyTemplate=c.cache(s.emptyTemplateId);return s}function j(){var s=u.exec(document.cookie);return s&&s[1]?s[1]:null}function p(s,w){w.url=y.baseUrl+y.apiPath+s;d.mixin(w,{limit:30,message_limit:3,dataType:"json",
error:function(C,G,D){throw D;}});var B=w.success,E=j();w.success=function(C){C&&C.contacts&&d.mixin(v,C.contacts,true);return B?B.apply(null,arguments):C};if(E)w.beforeSend=function(C){C.setRequestHeader(n,E)};b.ajax(w)}function q(s,w){var B=w.forId?document.getElementById(w.forId):null;if(B)B.innerHTML=s;w.onTemplateDone&&w.onTemplateDone(s);b(document).trigger("rdapi-done",B)}var m,n="X-CSRF",u=/csrf=([^\; ]+)/,v={},z={contact:function(s){return s.iid&&s.domain?v[s.iid]||{}:s},contactPhotoUrl:function(s){var w=
"i/face2.png",B,E;s=z.contact(s);if((B=s.photos)&&B.length){w=B[0].value;B.forEach(function(C){if(C.primary)w=C.value})}else if(s.emails&&s.emails.length){E=s.emails[0].value;s.emails.forEach(function(C){if(C.primary)E=C.value});w="http://www.gravatar.com/avatar/"+hex_md5(E)+"?s=24 &d=identicon"}return w},allMessages:function(s){return[s.topic].concat(s.messages||[])},friendlyDate:function(s){return a.date(e(s)).friendly},htmlBody:function(s){return c.htmlEscape(s).replace(/\n/g,"<br>")}},y={baseUrl:"/",
apiPath:"api/",saveTemplateData:true};c.addFn(z);m=function(s,w){w=h(w);d.mixin(w,{success:function(B){var E=w.template,C=w.emptyTemplate,G="";if(w.forId&&E){if(w.prop)B=c.getObject(w.prop,B,w);if(f.isArray(B))if(B.length)B.forEach(function(D){G+=c(E,D,w)});else G+=c(C,B,w);else G+=c(!B?C:E,B,w);q(G,w)}},error:function(B,E,C){if(w.emptyTemplate){B=c(w.emptyTemplate,C,w);q(B,w)}else throw C;}});p(s,w)};m.contactPhotoUrl=z.contactPhotoUrl;m.attachTemplateData=false;f.ready(function(){var s=[];c.parse({onBeforeParse:function(w){var B=
w.id,E=w.getAttribute("data-rdapi"),C=w.getAttribute("data-rdfor"),G=w.getAttribute("data-rdprop");E&&s.push({templateId:B,api:E,forId:C,prop:G});["data-rdapi","data-rdprop","data-rdfor"].forEach(function(D){w.removeAttribute(D)})}});s.forEach(function(w){m(w.api,w)})});return m});define("storage",[],function(){function f(){return b}var b=localStorage,d="localStorage";try{b.tempVar="temp";delete b.tempVar}catch(c){b={};d="memory"}f.type=d;return f});
define("dispatch",["jquery"],function(){var f=location.protocol+"//"+location.host;return{sub:function(b,d,c,a){c=c||window;a=a||f;var e=function(h){if(h.origin===a||h.origin==="chrome://browser")try{var j=JSON.parse(h.data),p=j.topic;p&&p===b&&d(j.data)}catch(q){}};c.addEventListener("message",e,false);return e},unsub:function(b,d){d=d||window;d.removeEventListener("message",b,false)},pub:function(b,d,c){c=c||window;c.postMessage(JSON.stringify({topic:b,data:d}),f)}}});
define("services",["blade/object","storage"],function(f,b){function d(j,p){if(j){this.name=j;this.type=j.replace(/\s/g,"").toLowerCase();this.tabName=this.type+"Tab";this.icon="i/"+this.type+"Icon.png";this.features={counter:false,direct:false,subject:false};f.mixin(this,p,true)}}function c(){d.constructor.apply(this,arguments);this.features.direct=true;this.features.subject=true}var a=parseFloat(navigator.userAgent.split("Firefox/")[1])>=4;b=b();var e,h;d.constructor=d;d.prototype={clearCache:function(j){delete j[this.type+
"Contacts"]},getContacts:function(j){if(j[this.type+"Contacts"])return JSON.parse(j[this.type+"Contacts"]);return null},setContacts:function(j,p){j[this.type+"Contacts"]=JSON.stringify(p)},get36FormattedContacts:function(){return null}};c.prototype=new d;c.constructor=c;c.prototype.validate=function(j){if(!j.to||!j.to.trim())return false;return true};c.prototype.get36FormattedContacts=function(j){var p=[];j.forEach(function(q){q.emails&&q.emails.length&&q.emails.forEach(function(m){p.push({displayName:q.displayName?
q.displayName:m.value,email:m.value})})});return p};c.prototype.overlays={Contacts:"ContactsEmail"};e={domains:{"twitter.com":new d("Twitter",{features:{direct:true,subject:false,counter:true},shareTypes:[{type:"public",name:"public"},{type:"direct",name:"direct message",showTo:true,toLabel:"type in name of recipient"}],textLimit:140,shorten:true,serviceUrl:"http://twitter.com",revokeUrl:"http://twitter.com/settings/connections",signOutUrl:"http://twitter.com/logout",accountLink:function(j){return"http://twitter.com/"+
j.username},forceLogin:{name:"force_login",value:true},overlays:{Contacts:"ContactsTwitter"}}),"facebook.com":new d("Facebook",{features:{direct:true,subject:false,counter:true,medium:true},shareTypes:[{type:"wall",name:"my wall"},{type:"groupWall",name:"group wall",showTo:true,toLabel:"type in the name of the group"}],textLimit:420,serviceUrl:"http://facebook.com",revokeUrl:"http://www.facebook.com/editapps.php?v=allowed",signOutUrl:"http://facebook.com",accountLink:function(j){return"http://www.facebook.com/profile.php?id="+
j.userid}}),"google.com":new c("Gmail",{shareTypes:[{type:"direct",name:"direct",showTo:true}],serviceUrl:"https://mail.google.com",revokeUrl:"https://www.google.com/accounts/IssuedAuthSubTokens",signOutUrl:"http://google.com/preferences",accountLink:function(j){return"http://google.com/profiles/"+j.username},forceLogin:{name:"pape_max_auth_age",value:0}}),"googleapps.com":new c("Google Apps",{shareTypes:[{type:"direct",name:"direct",showTo:true}],icon:"i/gmailIcon.png",serviceUrl:"https://mail.google.com",
revokeUrl:"https://www.google.com/accounts/IssuedAuthSubTokens",signOutUrl:"http://google.com/preferences",accountLink:function(j){return"http://google.com/profiles/"+j.username},forceLogin:{name:"pape_max_auth_age",value:0}}),"yahoo.com":new c("Yahoo",{shareTypes:[{type:"direct",name:"direct",showTo:true}],name:"Yahoo!",serviceUrl:"http://mail.yahoo.com",revokeUrl:"https://api.login.yahoo.com/WSLogin/V1/unlink",signOutUrl:"https://login.yahoo.com/config/login?logout=1",accountLink:function(j){return"http://profiles.yahoo.com/"+
j.username}}),"linkedin.com":new d("LinkedIn",{isNew:true,features:{direct:true,subject:true,counter:false},shareTypes:[{type:"public",name:"anyone"},{type:"myConnections",name:"connections only",specialTo:"connections-only"},{type:"contact",name:"send message",showTo:true,toLabel:"type in the name of the contact"}],serviceUrl:"http://linkedin.com",revokeUrl:"http://linkedin.com/settings/connections",signOutUrl:"https://www.linkedin.com/secure/login?session_full_logout=&trk=hb_signout",accountLink:function(j){return"http://linkedin.com/"+
j.username},overlays:{"widgets/AccountPanel":"widgets/AccountPanelLinkedIn"}})},domainList:[],svcBaseProto:d.prototype};for(h in e.domains)if(e.domains.hasOwnProperty(h)){e.domainList.push(h);if(a){delete b[e.domains[h].type+"Contacts"];delete b.contactsModelVersion}}return e});
define("accounts",["storage","dispatch","rdapi","services"],function(f,b,d,c){function a(m,n,u,v){return m.domain===n&&(u&&m.userid===u||v&&m.username===v)}function e(m){if(m)m=JSON.parse(m);return m}function h(m,n){return q.accounts(m,n)}function j(){location.reload()}var p=f(),q;q={localStorage:{accounts:function(m,n){var u=e(p.accountCache)||[],v=e(p.serviceCache);if(v){v=v||[];m&&m(u,v)}else q.fetch(m,n)},update:function(m){var n=e(p.accountCache)||[],u=e(p.serviceCache),v=false,z,y,s;z=m.profile;
for(y=0;y<n.length;y++){s=n[y].accounts[0];if(a(s,m.domain,m.userid,m.username)){n[y]=z;v=true;break}}v||n.push(z);p.accountCache=JSON.stringify(n);if(u){v=false;for(n=0;n<u.length;n++)if(a(u[n],m.domain,m.userid,m.username)){u[n]=m;v=true;break}}else u=[];v||u.push(m);p.serviceCache=JSON.stringify(u);q.changed()},fetch:function(m,n){d("account/get/full",{success:function(u){if(u.error)u=[];p.serviceCache=JSON.stringify(u);var v=[],z,y;for(y=0;y<u.length;y++){v.push(u[y].profile);z=c.domains[u[y].domain];
z.clearCache(p)}p.accountCache=JSON.stringify(v);m&&m(v,u)},error:n||function(){}})},remove:function(m,n,u){var v=e(p.accountCache),z=e(p.serviceCache),y,s;if(z){for(y=0;s=z[y];y++)if(a(s,m,n,u)){z.splice(y,1);break}p.serviceCache=JSON.stringify(z)}if(v){for(y=0;y<v.length;y++){s=v[y].accounts;for(z=0;z<s.length;z++)if(a(s[z],m,n,u)){v.splice(y,1);break}}p.accountCache=JSON.stringify(v)}c.domains[m].clearCache(p);q.clearData(m,n,u);q.changed()},setData:function(m,n,u,v,z){m=[m,n,u].join("|")+"Data";
n=e(p[m])||{};if(z===undefined||z===null)delete n[v];else n[v]=z;p[m]=JSON.stringify(n);return z},getData:function(m,n,u,v){m=[m,n,u].join("|")+"Data";return(m=e(p[m])||{})?m[v]:null},clearData:function(m,n,u){m=[m,n,u].join("|")+"Data";delete p[m]},getService:function(m,n,u){var v=e(p.serviceCache),z,y;if(v)for(z=0;y=v[z];z++)if(a(y,m,n,u))return y;return null},changed:function(){p.accountChanged=(new Date).getTime();opener&&!opener.closed&&b.pub("accountsChanged",null,opener);b.pub("accountsChanged")},
onChange:function(m){var n=p.accountChanged;window.addEventListener("storage",function(){p.accountChanged!==n&&m()},false);b.sub("accountsChanged",m)}},memory:{accounts:function(){},changed:function(){p.accountChanged=(new Date).getTime();opener&&b.pub("accountsChanged",null,opener);b.pub("accountsChanged")},onChange:function(m){b.sub("accountsChanged",m)}}}[f.type];h.update=function(m){q.update(m)};h.remove=function(m,n,u){q.remove(m,n,u)};h.fetch=function(m,n){q.fetch(m,n)};h.getService=function(m,
n,u){return q.getService(m,n,u)};h.clear=function(){delete p.accountCache;delete p.serviceCache};h.setData=function(m,n,u,v,z){return q.setData(m,n,u,v,z)};h.getData=function(m,n,u,v){return q.getData(m,n,u,v)};h.clearData=function(m,n,u){return q.clearData(m,n,u)};h.changed=function(){return q.changed()};h.onChange=function(m){return q.onChange(m||j)};return h});
define("oauth",["accounts"],function(f){var b,d,c=0;window.addEventListener("message",function(a){var e;try{e=JSON.parse(a.data)}catch(h){return}if(e.target){if(e.target==="oauth_success"&&e.account){a=true;f.update(e.account)}else a=false;d=null;if(b){b(a);b=null}}},false);return function(a,e,h){if(h)b=h;h=location.protocol+"//"+location.host+"/0.3.0/auth.html";var j=(new Date).getTime();if(d&&d.closed)d=null;if(j>c+4E3){c=j;a=h+"?domain="+a+(e?"&forceLogin=1":"");try{d=window.open(a,"ffshareOAuth",
"dialog=yes, modal=yes, width=900, height=500, scrollbars=yes");d.focus()}catch(p){window.location=a+"&end_point_success="+encodeURI(window.location)}}else d&&d.focus()}});define("dotCompare",[],function(){function f(b,d){b=b||"0";d=d||"0";b=b.split(".");d=d.split(".");var c,a,e,h=b.length>d.length?b.length:d.length;for(c=0;c<h;c++){a=parseInt(b[c]||"0",10);e=parseInt(d[c]||"0",10);if(a>e)return 1;else if(a<e)return-1}return 0}return f});
define("blade/array",[],function(){var f=Object.prototype.toString,b=Array.prototype.slice;return{is:function(d){return f.call(d)==="[object Array]"},to:function(){return[].concat(b.call(arguments,0))}}});
define("blade/url",["./array"],function(f){var b=Object.prototype.toString;return{objectToQuery:function(d){var c=encodeURIComponent,a=[],e={},h,j,p,q;for(h in d)if(d.hasOwnProperty(h)){j=d[h];if(j!==e[h]){p=c(h)+"=";if(f.is(j))for(q=0;q<j.length;q++)a.push(p+c(j[q]));else a.push(p+c(j))}}return a.join("&")},queryToObject:function(d){var c={};d=d.split("&");var a=decodeURIComponent,e,h,j;d.forEach(function(p){if(p.length){e=p.split("=");h=a(e.shift());j=a(e.join("="));if(typeof c[h]==="string")c[h]=
[c[h]];if(b.call(c[h])==="[object Array]")c[h].push(j);else c[h]=j}});return c}}});
define("placeholder",["jquery"],function(f){function b(a){var e=!("placeholder"in a),h=a.getAttribute("placeholder"),j=a.value.trim();if(!j||j===h){if(e){f(a).addClass("placeholder");a.value=h;if(h==="password"&&a.type==="password")a.type="text"}}else f(a).removeClass("placeholder")}function d(a){a=a.target;var e=a.getAttribute("placeholder");if(a.value===e){if(!("placeholder"in a)){a.value="";if(e==="password"&&a.type==="text")a.type="password"}f(a).removeClass("placeholder")}}function c(a){b(a.target)}
return function(a){f('input[type="text"], input[type="password"], textarea',a).each(function(e,h){if(h.getAttribute("data-rdwPlaceholder")!=="set"){f(h).focus(d).blur(c);h.setAttribute("data-rdwPlaceholder","set")}b(h)})}});
(function(f){function b(a){var e;if(a&&a.constructor==Array&&a.length==3)return a;if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(a))return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])];if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(a))return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55];if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(a))return[parseInt(e[1],16),parseInt(e[2],
16),parseInt(e[3],16)];if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(a))return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)];return c[f.trim(a).toLowerCase()]}function d(a,e){var h;do{h=f.curCSS(a,e);if(h!=""&&h!="transparent"||f.nodeName(a,"body"))break;e="backgroundColor"}while(a=a.parentNode);return b(h)}f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(a,e){f.fx.step[e]=function(h){if(h.state==
0){h.start=d(h.elem,e);h.end=b(h.end)}h.elem.style[e]="rgb("+[Math.max(Math.min(parseInt(h.pos*(h.end[0]-h.start[0])+h.start[0]),255),0),Math.max(Math.min(parseInt(h.pos*(h.end[1]-h.start[1])+h.start[1]),255),0),Math.max(Math.min(parseInt(h.pos*(h.end[2]-h.start[2])+h.start[2]),255),0)].join(",")+")"}});var c={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,
100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,
128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);define("jquery.colorFade",function(){});
(function(f){var b=document.documentElement.style,d="textOverflow"in b||"OTextOverflow"in b,c=function(a,e){var h=0,j=[],p=function(q){var m=0,n;if(!(h>e))for(m=0;m<q.length;m+=1)if(q[m].nodeType===1){n=q[m].cloneNode(false);j[j.length-1].appendChild(n);j.push(n);p(q[m].childNodes);j.pop()}else if(q[m].nodeType===3){if(h+q[m].length<e)j[j.length-1].appendChild(q[m].cloneNode(false));else{n=q[m].cloneNode(false);n.textContent=f.trim(n.textContent.substring(0,e-h));j[j.length-1].appendChild(n)}h+=q[m].length}else j.appendChild(q[m].cloneNode(false))};
j.push(a.cloneNode(false));p(a.childNodes);return f(j.pop().childNodes)};f.extend(f.fn,{textOverflow:function(a,e){var h=a||"&#x2026;";return d?this:this.each(function(){var j=f(this),p=j.clone(),q=j.clone(),m=j.text(),n=j.width(),u=0,v=0,z=m.length,y=function(){if(n!==j.width()){j.replaceWith(q);j=q;q=j.clone();j.textOverflow(a,false);n=j.width()}};j.after(p.hide().css({position:"absolute",width:"auto",overflow:"visible","max-width":"inherit"}));if(p.width()>n){for(;u<z;){v=Math.floor(u+(z-u)/2);
p.empty().append(c(q.get(0),v)).append(h);if(p.width()<n)u=v+1;else z=v}u<m.length&&j.empty().append(c(q.get(0),u-1)).append(h)}p.remove();e&&setInterval(y,200)})}})})(jQuery);define("jquery.textOverflow",function(){});
define("index",["require","jquery","blade/fn","rdapi","oauth","blade/jig","dispatch","storage","accounts","dotCompare","blade/url","services","placeholder","jquery.colorFade","jquery.textOverflow"],function(f,b,d,c,a,e,h,j,p,q,m,n,u){function v(){b("div.status").addClass("hidden")}function z(D,F){v();b("#"+D).removeClass("hidden");F&&b("#"+D+" .message").text(F)}var y=j(),s=y.shortenPrefs,w=q(y.extensionVersion,"0.7.3")>-1,B=q(y.extensionVersion,"0.7.4")>-1,E=m.queryToObject(location.href.split("#")[1]||
"")||{},C={},G=E.show==="new";e.addFn({domainType:function(D){return(D=n.domains[D.accounts[0].domain])?D.type:""},domainName:function(D){return(D=n.domains[D.accounts[0].domain])?D.name:""},accountName:function(D,F){return F.username&&F.username!==D?D+", "+F.username:D}});p.onChange();p(function(D){b(function(){var F="";D.forEach(function(H){F+=e("#accountTemplate",H);C[H.accounts[0].domain]=true});if(F){b("#existingHeader").removeClass("hidden");b("#existing").append(F).removeClass("hidden")}F=
"";n.domainList.forEach(function(H){var I=n.domains[H];if(B||!C[H]){I.domain=H;I.enableSignOut=!I.forceLogin&&C[H];F+=e("#addTemplate",n.domains[H])}});if(F){b("#availableHeader").removeClass("hidden");b("#available").append(F).removeClass("hidden")}G&&b(function(){b("li.newItem").animate({backgroundColor:"#ffff99"},200).delay(1E3).animate({backgroundColor:"#fafafa"},3E3)})})});b(function(){function D(){var k={};g.find(".error").addClass("hidden");b.each(g[0].elements,function(o,r){o=b(r).val().trim();
if(r.getAttribute("placeholder")===o)o="";r.value=o;if(r.value)k[r.name]=r.value});if(k.login&&k.apiKey)return k;else if(k.login&&!k.apiKey)b("#bitlyApiKeyMissing").removeClass("hidden");else k.apiKey&&!k.login&&b("#bitlyLoginMissing").removeClass("hidden");return null}function F(){g.find('[name="login"]').val("");g.find('[name="apiKey"]').val("");g.find('[name="domain"]').val("")}function H(k){b.each(g[0].elements,function(o,r){(o=k[r.getAttribute("name")])&&b(r).val(o)});u(g[0])}function I(){i[0].checked=
true;g.slideDown("100")}function K(){i[0].checked=false;g.slideUp("100",function(){g.css({display:"none"})})}function M(){F();delete y.shortenPrefs;K()}if(G){delete E.show;location.replace(location.href.split("#")[0]+"#"+m.objectToQuery(E))}var g=b("#shortenForm"),i=b("#bitlyCheckbox"),l;b(window).bind("load resize",function(){var k=b(window).height();b("#wrapper").css({"min-height":k})});if(s){s=JSON.parse(s);H(s);I()}else K();b("body").delegate("#bitlyCheckbox","click",function(){i[0].checked?I():
M()}).delegate("#shortenForm","submit",function(k){var o=D();o?b.ajax({url:"http://api.bitly.com/v3/validate",type:"GET",data:{format:"json",login:o.login,x_login:o.login,x_apiKey:o.apiKey,apiKey:o.apiKey},dataType:"json",success:function(r){if(r.status_code===200&&r.data.valid)y.shortenPrefs=JSON.stringify(o);else{b("#bitlyNotValid").removeClass("hidden");delete y.shortenPrefs}},error:function(){b("#bitlyNotValid").removeClass("hidden");delete y.shortenPrefs}}):M();k.preventDefault()}).delegate(".close",
"click",function(){window.close()}).delegate(".auth","click",function(k){k=k.target.getAttribute("data-domain");var o=n.domains[k].type;v();a(k,C[k],function(r){if(r)y.lastSelection=o;else z("statusOAuthFailed")})}).delegate(".remove","click",function(k){var o=k.target,r=o.getAttribute("data-domain"),t=o.getAttribute("data-username");o=o.getAttribute("data-userid");try{v();p.remove(r,o,t)}catch(x){p.clear()}k.preventDefault()}).delegate('#settings [type="checkbox"]',"click",function(k){var o=k.target;
k=o.id;o=o.checked;y["prefs."+k]=o;opener&&!opener.closed&&h.pub("prefChanged",{name:k,value:o},opener)});l=(l=y["prefs.use_accel_key"])?JSON.parse(l):false;b("#use_accel_key")[0].checked=l||false;l=(l=y["prefs.bookmarking"])?JSON.parse(l):false;b("#bookmarking")[0].checked=l||false;b(function(){b(".overflow").textOverflow(null,true)});w&&b('li[data-tab="settings"]').removeClass("hidden");B&&b('li[data-tab="advanced"]').removeClass("hidden");b("body").delegate("ul#tabs li","click",function(){var k=
b(this),o=b("#"+k.attr("data-tab"));v();k.addClass("selected");k.siblings().removeClass("selected");if(o.is(":hidden")){o.fadeIn(200);o.siblings().fadeOut(0)}});window.onFeedLoad=function(k,o){var r,t,x;if(o&&o.feed&&o.feed.entries)for(k=0;x=o.feed.entries[k];k++)if(x.categories&&x.categories.indexOf("Sharing")!==-1){t=x.link;r=x.title;break}if(t){b("#newsFooter .headline").removeClass("invisible");b("#rssLink").attr("href",t).text(r)}};l=document.createElement("script");l.charset="utf-8";l.async=
true;l.src="https://www.google.com/uds/Gfeeds?v=1.0&callback=onFeedLoad&context=&output=json&q=http%3A%2F%2Fmozillalabs.com%2Fmessaging%2Ffeed%2F";b("head")[0].appendChild(l)})});