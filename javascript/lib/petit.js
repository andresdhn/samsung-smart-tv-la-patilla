
/* Basic functions */

var petit = {

    nope: function(){return false;},
	
	not: function(object){return is.value(object) ? !object : function(x){return !object(x)};},
	
    yeah: function(){return true;},
    
    lambda: function(x){return x;},
    
    bind: function(fn,object){return function(){ return fn.apply(object,arguments)};},
    
    copy: function(object,members){for(var member in members){object[member]=members[member];}return object;},
    
    deepCopy: function(destiny,source){if(is.nullv(source))return;for(var member in source){try{if(!is.value(source[member])){if(is.array(source[member])){destiny[member]=[];for(var i=0;i<source[member].length;i++){destiny[member][i]=source[member][i];}}else if(is.date(source[member])){destiny[member]=new Date();destiny[member].setTime(source[member].getTime());}else{if(is.fn(source[member])){destiny[member]=source[member];}else{if(is.undef(destiny[member])){destiny[member]={};}this.deepCopy(source[member],destiny[member]);}}break;}else{destiny[member]=source[member];}}catch(e){}}return destiny;},
    
    clone: function(object){return petit.deepCopy({},object);},
    
    match: function(object,pattern){var matches=true;if(is.value(pattern))return object===pattern;else{for(var field in pattern){if(is.undef(object[field]))matches=false;else{if(!is.value(pattern[field])){if(is.array(pattern[field])){if(is.array(object[field])){if(object[field].length==pattern[field].length)for(var i=0;i<pattern[field].length&&matches;i++)matches=matches&&this.match(object[field][i],pattern[field][i]);else matches=false;}else matches=false;}else{if(is.date(pattern[field])){if(is.date(object[field])){matches=matches&&object[field].getTime()==pattern[field].getTime();}else matches=false;}else{if(is.regexp(pattern[field])){if(is.regexp(object[field]))matches=matches&&object[field].toString()==pattern[field].toString();else{if(is.string(object[field]))matches=matches&&pattern[field].test(object[field]);else matches=false;}}else matches=matches&&this.match(object[field],pattern[field]);}}}else matches=matches&&object[field]===pattern[field];}if(!matches)break;}}return matches;},
    
    walk: function(object,fn){
    	petit.each(object, function(v, k){
    		if (is.object(v) || is.array(v)) {
    			fn.call(this, v, k, object);
    			petit.walk(v, fn);
    		} else {
    			fn.call(this, v, k, object);
    		} 
    	});
    },
    
    each: function(items,routine){var ret;if(is.iterable(items)){ret=[];for(var i=0;i<items.length;i++)ret.push(routine.call(items,items[i],i,items.length));}else{ret={};for(var i in items)ret[i]=routine.call(items,items[i],i);}return ret;},
    
    apply: function(items,fn){return petit.each(items,function(item,i,n){return fn.call(item,i,n);});},
    
    filter: function(items,fn){var ret=[];petit.each(items,function(i){if(fn.call(i))ret.push(i);});return ret;},
    
    defaultArgs: function(argsObject,defaultValues){argsObject=argsObject||{};for(var member in defaultValues)if(is.undef(argsObject[member]))argsObject[member]=defaultValues[member];return argsObject;},
	
    is: {
        fn: function(object){
            return typeof object == "function" || object instanceof Function;
        },
        string: function(object){
            return typeof object == "string" || object instanceof String;
        },
        number: function(object){
            return typeof object == "number" || object instanceof Number && !isNaN(object) && isFinite(object);
        },
        bool: function(object){
            return typeof object == "boolean" || object instanceof Boolean;
        },
        array: function(object){
            return object instanceof Array;
        },
        nullv: function(object){
            return object === null;
        },
        undef: function(object){
            return object === undefined;
        },
        date: function(object){
            return object instanceof Date;
        },
        regexp: function(object){
            return object instanceof RegExp;
        },
        object: function(object, plain) {
			if (plain && object && object.constructor
						&& !Object.prototype.hasOwnProperty.call(object, "constructor")
						&& !Object.prototype.hasOwnProperty.call(object.constructor.prototype, "isPrototypeOf") ) {
						return false;
			}			
			return !(is.value(object) || is.fn(object) || is.array(object) || is.regexp(object) || !object || object.nodeType || object.setInterval);
		},
        iterable: function(object){
            return is.array(object) || (is.useful(object) && is.useful(object.length) && !is.string(object) && !object.tagName) && !is.fn(object);
        },
        numberstr: function(object){
            return /^-?\d+(\.\d+)?$/.test(object) && petit.is.number(parseFloat(object));
        },
        value: function(object){
            return is.string(object) || is.number(object) || is.bool(object);
        },
        useful: function(object){
            return !is.nullv(object) && !is.undef(object);
        },
		what: function(object, plain) {
			var ret = false;
			for (var method in petit.is) {
				if (!["what", "useful"].contains(method)) {
					ret = petit.is[method](object, plain);
					if (ret) 
						return method;
				}
			}
			return "unknown";
		}
    }
};

var is = petit.is;

/* Extensions for basic objects */

Object.each = function(object, routine) {
	return petit.each(object, routine);
};
Object.clone = function(object){
    return petit.clone(object);
};
Object.copy = function(destiny, source) {
	return petit.copy(destiny, source);
};
Object.shallowClone = function(object) {
	return petit.copy({}, object);
};
Object.itemAt = function(object, index) {
	var i = 0;
	for(var item in object) {
		if (i === index)
			return object[item];
		i++;
	}
	return null;
};

Function.prototype.inherit = function(base){
    var fn = function(){
    };
    fn.prototype = base.prototype;
    this.prototype = new fn();
    this.prototype.constructor = this;
    return this;
};
Function.defaultArgs = function(argsObject, defaultValues) {
	return petit.defaultArgs(argsObject, defaultValues);
};

Function.prototype.extend = function(base){
    petit.copy(this.prototype, base);
};

Function.prototype.bind = function(context){
    return petit.bind(this, context);
};

Function.prototype.bindArgs = function(){
	var fn = this, args = arguments;
	return function(){
		return fn.apply(this, args);
	};
};
Function.prototype.repeat = function(ms, context){
    return setInterval(context ? this.bind(context) : this, ms);
};
Function.prototype.delay = function(ms, context){
    return setTimeout(context ? this.bind(context) : this, ms);
};
Function.prototype.defer = function() {
	this.delay(0);
};

String.prototype.left = function(n){
    return this.substring(0, n);
};
String.prototype.right = function(n){
    return this.substring(this.length - n, this.length);
};
String.prototype.ltrim = function(){
    return this.replace(/^\s+/, "");
};
String.prototype.rtrim = function(){
    return this.replace(/\s+$/, "");
};
String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.chop = function(){
    return this.substring(0, this.length - 1);
};
String.prototype.chomp = function(){
    return this.substring(1);
};
String.prototype.pad = function(character, length, rightSide){
    var ret = this;
    if (this.length < length) 
        for (var i = 0; i < length - this.length; i++) 
            ret = rightSide ? ret + character : character + ret;
    return ret;
};
String.prototype.parseInt = function(radix){
    return parseInt(this, radix || 10);
};
String.prototype.parseFloat = function(){
    return parseFloat(this);
};
String.prototype.toHex = function(length){
    return parseInt(this, 10).toHex(length);
};
String.prototype.toDec = function(){
    return parseInt(this, 16);
};
String.prototype.trynumber = function(){
    return is.numberstr(this) ? parseFloat(this) : this;
};
String.prototype.capitalize = function(){
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};
String.prototype.camelCase = function(){
    return this.split(/[-\s]/g).each(function(word, i){
        return i ? word.capitalize() : word;
    }).join("");
};
String.prototype.stripHTML = function(activeContentOnly){
    if (activeContentOnly) 
        return this.replace(/<(script|object|applet|iframe|embed).*>[^<]*<\/\1>/gi, " ");
    else 
        return this.replace(/<\/?[^>]+>/gi, " ").replace(/&.+;/, "").replace(/[\s]{2,}/g, " ");
};
String.prototype.escapeHTML = function(){
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
String.prototype.escapeRegExp = function(){
    return this.replace(/([.*+?$^(){}|[\]\/\\])/g, "\\$1");
};
String.prototype.fill = function(values, filters, debug){
    var ret = this, matches = this.match(/\{([^}]+)\}/g);
    petit.each(matches, function(m){
        var match = m.chop().chomp(), modifier = "", property = "", conditional;
        
        if (/^([^:]+):(.+)$/.test(match)) {
            property = RegExp.$1;
            modifier = RegExp.$2;
        }
        else {
            property = match;
        }
        
        if (/^\?/.test(property)) {
            conditional = true;
            property = property.chomp();
        }
		
		function resolveValue(object, property){
			var path = property.split(/\./g);
			if (path.length > 1) {
				var value = object;
				for (var i = 0; !is.undef(value) && !is.value(value) && i < path.length; i++) {
					value = resolveValue(value, path[i]);
				}
				return value;
			}
			else {
				if (is.object(object)) {
					if (property in object)
						return object[property];
					else {
						var getterName = "get" + property.capitalize();
						if (getterName in object && is.fn(object[getterName])) {
							return object[getterName].call(object);
						} else
							return;
					}
				} else if (is.array(object)) {
					return object[+property]; 
				} else {
					return null;
				}
			}
		}
        
		var value = resolveValue(values, property);
		value = is.number(value) ? value : (value || "");
        
        if (modifier) {
			modifier.replace(/::/g, "~.&.~").split(/:/g).each(function(m){
				m = m.replace(/~\.&\.~/g, ":");
				try {
					if (is.numberstr(m)) {
						value = value.toFixed(parseInt(m));
					}
					else {
						var param = null;
						if (/^(\w+)\((.+)\)$/.test(m)) {
							m = RegExp.$1;
							param = RegExp.$2.split(/,/g).apply(function(){return this.trim().trynumber();});
						}
						if (filters && m in filters) {
							value = filters[m].call(values, value);
						}
						else {
							var ownfilters = String.prototype.fill.filters;
							if (m in ownfilters) {
								var args = [value].concat(param);
								value = ownfilters[m].apply(values, args);
							}
						}
					}
				} catch(ex) { if (debug) value = "[EX@{0}({1}):{2}]".fill([property, value, m]); }
			});
		}
        
        var replacement = (!conditional || !is.useful(value)) ? value : "";
        ret = ret.replace(new RegExp(m.escapeRegExp(), "gm"), replacement);
    });
    return ret;
};
String.prototype.fill.filters = {
	format: function(v, p) {
		if (is.date(v)) {
			return v.format(p);
		}
		return v;
	},
	ts2date: function(v) {
		return new Date(v);
	},
	round: function(v) {
		return Math.round(v);
	},
	trim: function(v) {
		return v.trim();
	},
	ucase: function(v, p){
		return v.toUpperCase();
	},
	lcase: function(v, p){
		return v.toLowerCase();
	},
	n2br: function(v, p){
		return v.replace(/\n/gm, "<br>");
	},
	links: function(v, p){
		return v.hiliteLinks(p);
	},
	json: function(v, p){
		return json.serialize(v);
	},
	pl: function(v, s, p){
		return v.plural(s,p);
	},
	cond: function(v, a, b){
		return v ? a : (b || "");
	}
};
String.prototype.words = function(n){
    var words = this.split(/\s|\.|\,/g);
    return words.slice(0, n).join(" ").rtrim() + (words.length > n ? "..." : "");
};
String.prototype.repeat = function(n){
    var ret = "";
    for (var i = 0; i < n; i++) 
        ret += this;
    return ret;
};
String.prototype.hiliteLinks = function(target){
    return this.replace(/(http:\/\/((\S+)|$))/g, target ? ('<a href="$1" target="' + target + '">$1</a>') : '<a href="$1">$1</a>');
};

Number.prototype.round = function(){
    return Math.round(this);
};
Number.prototype.snap = function(n){
    return Math.round(this / n) * n;
};
Number.prototype.abs = function(){
    return Math.abs(this);
};
Number.prototype.toHex = function(length){
    return this.toString(16).pad("0", length || 0);
};
Number.prototype.between = function(a, b, open){
    return open ? (this > a && this < b) : (this >= a && this <= b);
};
Number.prototype.outside = function(a, b){
    return (this < a || this > b);
};
Number.prototype.fit = function(start, end){
    return (this < start) ? start : ((this > end) ? end : this);
};
Number.prototype.gteq = function(n){
    return this <= n ? n : this;
};
Number.prototype.lteq = function(n){
    return this >= n ? n : this;
};
Number.prototype.plural = function(sngStr, plrStr, hideN){
    return (hideN ? "" : (this + " ")) + (this == 1 ? sngStr : (plrStr ? plrStr : sngStr + "s"));
};
Number.prototype.pad = function(length, character){
    return this.toString().pad(character || "0", length);
};
Number.prototype.times = function(fn){
    for (var i = 0; i < this; i++) 
        fn(i);
};
Number.prototype.to = function(n, fn){
    var ret = [];
    for (var i = this; i <= n; i++) 
        ret.push(fn(i));
    return ret;
};

Array.prototype.first = function(){
    return this.length > 0 ? this[0] : null;
};
Array.prototype.last = function(){
    return this.length > 0 ? this[this.length - 1] : null;
};
Array.prototype.tail = function(n){
    return this.length > n ? this.slice(this.length - n, this.length) : this;
};
Array.prototype.set = function(index, value) {
	this[index] = value;
	return this;
};
Array.prototype.contains = function(value){
    for (var i = 0; i < this.length; i++) 
        if (this[i] === value) 
            return true;
    return false;
};
Array.prototype.unique = function(){
    var ret = [];
    for (var i = 0; i < this.length; i++) 
        ret.uniquepush(this[i]);
    return ret;
};
Array.prototype.intersect = function(array){
    var ret = [];
    for (var i = 0; i < this.length; i++) 
        if (this.contains(array[i]) && !ret.contains(array[i])) 
            ret.push(array[i]);
    return ret;
};
Array.prototype.equalset = function(array){
    return this.length == array.length && this.intersect(array).length == this.length;
};
Array.prototype.uniquepush = function(value){
    return !this.contains(value) ? this.push(value) : null;
};
Array.prototype.listjoin = function(glue, lastglue){
    return this.length <= 2 ? this.join(lastglue) : (this.slice(0, this.length - 1).join(glue) + lastglue + this.last());
    
};
Array.prototype.indexOf = function(value, offset){
    offset = offset || 0;
    for (var i = offset; i < this.length; i++) 
        if (value === this[i]) 
            return i;
    return -1;
};
Array.prototype.remove = function(values){
    values = Array.from(values);
    for (var i = 0; i < this.length; i++) 
        if (values.contains(this[i])) 
            this.splice(i--, 1);
    return this;
};
Array.prototype.each = function(routine){
    return petit.each(this, routine);
};
Array.prototype.apply = function(fn){
    return petit.apply(this, fn);
};
Array.prototype.filter = function(fn){
    return petit.filter(this, fn);
};
Array.prototype.notnull = function(){
    return this.filter(function(){
        return !is.nullv(this);
    });
};
Array.prototype.useful = function(){
    return this.filter(function(){
        return is.useful(this);
    });
};
Array.prototype.conjunction = function(){
    var truth = true;
    for (var i = 0; i < this.length; i++) 
        truth = truth && this[i];
    return truth;
};
Array.prototype.disjunction = function(){
    var truth = false;
    for (var i = 0; i < this.length; i++) 
        truth = truth || this[i];
    return truth;
};
Array.prototype.flatter = function(){
    function recurse(array){
        var ret = [];
        for (var i = 0; i < array.length; i++) 
            if (is.array(array[i])) 
                ret = ret.concat(recurse(array[i]));
            else 
                ret.push(array[i]);
        return ret;
    }
    return recurse(this);
};
Array.fromObject = function(object){
    var array = [];
    for (var member in object) 
        array.push(object[member]);
    return array;
};
Array.fromObjectKeys = function(object){
    var array = [];
    for (var member in object) 
        if (object.hasOwnProperty(member)) 
            array.push(member);
    return array;
};
Array.fromIterable = function(iterable){
    var array = [];
    for (var i = 0; i < iterable.length; i++) 
        array.push(iterable[i]);
    return array;
};
Array.fromCount = function(from, to){
    var array = [];
    for (var i = from; i <= to; i++) 
        array.push(i);
    return array;
};
Array.fromN = function(n, value){
    var array = [];
    for (var i = 0; i <= n; i++) 
        array.push(value);
    return array;
};
Array.from = function(argument){
	if (arguments.length == 1 && is.array(argument)) 
		return argument;
	else {
		var ret = [];
		for (var i = 0; i < arguments.length; i++) {
			if (is.array(arguments[i])) 
				ret = ret.concat(arguments[i]);
			else 
				if (is.iterable(arguments[i])) 
					for (var j = 0; j < arguments[i].length; j++) {
						if (is.array(arguments[i])) 
							ret = ret.concat(arguments[i]);
						else 
							ret.push(arguments[i][j]);
					}
				else 
					if (is.useful(arguments[i])) 
						ret.push(arguments[i]);
		}
		return ret;
	}
};

Date.prototype.diff = function(date){
    return this.getTime() - date.getTime();
};
Date.prototype.lapseToString = function(seconds, deep){
    if (deep <= 0) {
        return "";
    }
    var magnitudes = [1, 60, 60, 24, 30.45, 12];
    var suffix = ["s", "s", "m", "h", "d", "M", "y"];
    var i, x, tm = seconds;
    for (i = 0, x = 1; tm > magnitudes[i] && i < magnitudes.length; i++) {
        tm /= magnitudes[i];
        x *= magnitudes[i];
    }
    var remainder = x * (tm - Math.floor(tm)), subcomponent = "";
    if (remainder > 1) {
        subcomponent = this.lapseToString(remainder, deep - 1);
    }
    if (subcomponent) {
        subcomponent = " + " + subcomponent;
    }
    tm = Math.floor(tm);
    var ret = "{value} {unit}{?subcomponent}".fill({
        value: tm,
        unit: suffix[i],
        subcomponent: subcomponent
    });
    return ret.replace(/ $/, "");
};
Date.prototype.ago = function(refdate, deep, lang){
    var ret = this.lapseToString(Math.abs(this.diff(refdate) / 1000), deep);
    if (lang) {
        (ret.match(/\d+ [yMdhms]/g) || []).each(function(m){
            var t = Date.translations[lang].words[m.charAt(m.length - 1)];
            var n = parseInt(m);
            ret = ret.replace(new RegExp(m, "g"), n.plural(t[0], t[1]));
        });
        ret = ret.replace(/\+([^\+]*)$/, Date.translations[lang].words["+"] + "$1").replace(/ \+ /g, ", ");
    }
    return ret;
};
Date.prototype.ago_std_tr = function(){
    return this.ago(new Date(), 1, "es");
};
Date.prototype.std_str = function(){
    return this.format(Date.translations["es"].stdDate, "es");
};
Date.prototype.format = function(string, lang){
    lang = lang || "es";
    string = string.replace(/%dd/g, this.getDate().pad(2));
    string = string.replace(/%dn/g, Date.translations[lang].dayNames[this.getDay()]);
    string = string.replace(/%d/g, this.getDate());
    string = string.replace(/%Mn/g, Date.translations[lang].monthNames[this.getMonth()]);
    string = string.replace(/%MM/g, (this.getMonth() + 1).pad(2));
    string = string.replace(/%M/g, this.getMonth() + 1);
    string = string.replace(/%yyyy/g, this.getFullYear());
    string = string.replace(/%hh/g, this.getHours().pad(2));
    string = string.replace(/%h/g, this.getHours());
    string = string.replace(/%ii/g, (this.getHours() % 12).pad(2));
    string = string.replace(/%i/g, this.getMinutes() % 12);
    string = string.replace(/%mm/g, this.getMinutes().pad(2));
    string = string.replace(/%m/g, this.getMinutes());
    string = string.replace(/%ss/g, this.getSeconds().pad(2));
    string = string.replace(/%s/g, this.getSeconds());
    string = string.replace(/%ap/g, Date.translations[lang].words[this.getHours() < 12 ? "am" : "pm"]);
    return string;
};
Date.translations = {
    "es": {
        words: {
            "+": "y",
            "d": ["día", "días"],
            "M": ["mes", "meses"],
            "y": ["año", "años"],
            "h": ["hora", "horas"],
            "m": ["minuto", "minutos"],
            "s": ["segundo", "segundos"],
            "am": "am",
            "pm": "pm"
        },
        stdDate: "%d de %Mn de %yyyy",
        monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
    },
    "en": {
        words: {
            "+": ", ",
            "d": ["day", "days"],
            "M": ["month", "months"],
            "y": ["year", "years"],
            "h": ["hour", "hours"],
            "m": ["minute", "minutes"],
            "s": ["second", "seconds"],
            "am": "AM",
            "pm": "PM"
        },
        stdDate: "%Mn %d %yyyy",
        monthNames: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
        dayNames: ["sunday", "monday, tuesday", "wednesday", "thursday", "friday", "saturday"]
    }
};
Date.prototype.getMonthName = function(lang) {
	lang = lang || "es";
	return Date.translations[lang].monthNames[this.getMonth()];
};
Date.prototype.add = function(y, m, d, h, mn, s) {
	y = y || 0; m = m || 0; d = d || 0; h = h || 0; mn = mn || 0; s = s || 0;
	return new Date(this.getFullYear() + y, this.getMonth() + m, this.getDate() + d, this.getHours() + h, this.getMinutes() + mn, this.getSeconds() + s);
};
Math.distance = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

Math.rad2deg = function(angle){
    return angle * 180 / Math.PI;
};

Math.deg2rad = function(angle){
    return angle * Math.PI / 180;
};

/* Utilities */

var json={serialize:function(object){if(false&&JSON&&JSON.stringify){return JSON.stringify(object);}else{if(is.nullv(object)){return"null";}else{var str="";var escape=function(str){return str.replace(/\\/gm,"\\\\").replace(/\"/gm,'\\"').replace(/\n/gm,"\\n").replace(/\t/gm,"\\t").replace(/\r/gm,"\\r");};if(is.number(object)){str=object.valueOf();}else if(is.bool(object)){return object?"true":"false";}else if(is.string(object)){str="\""+escape(object)+"\"";}else if(is.array(object)){for(var i=0;i<object.length;i++){if(!is.fn(object[i])){str+=(i>0?",":"")+this.serialize(object[i]);}}str="["+str+"]";}else if(is.date(object)){str="\"{year}-{month}-{day}T{hour}:{min}:{secs}Z\"".fill({year:object.getFullYear(),month:(object.getMonth()+1).pad(2),day:object.getDate().pad(2),hour:object.getHours().pad(2),min:object.getMinutes().pad(2),secs:object.getSeconds().pad(2)});}else if(is.object(object)){var i=0;for(var member in object){if(!is.fn(object[member])){str+=(++i>1?",":"")+'"'+member+'":'+this.serialize(object[member]);}}str="{"+str+"}";}else if(is.undef(object)){str="null";}else if(isNaN(object)){str='"NaN"';}return str;}}},parse:function(str){if(false&&JSON&&JSON.parse){return JSON.parse(str);}else{try{str=str.replace(/"(\d{4})-0?(\d{1,2})-0?(\d{1,2})T0?(\d{1,2}):0?(\d{1,2}):0?(\d{1,2})Z"/g,"new Date($1,$2-1,$3,$4,$5,$6)");return eval("("+str+")");}catch(err){return null;throw new EvalError("Could not evaluate JSON String: "+str);}}}};
var xml={Document:function(rootNodeName){return xml.parse("<{0}></{0}>".fill([rootNodeName]));},parse:function(xmlString){var xmlDoc=null;if(window.ActiveXObject){xmlDoc=new ActiveXObject("Microsoft.XMLDOM");xmlDoc.async="false";xmlDoc.loadXML(xmlString);}else if(document.implementation&&document.implementation.createDocument){parser=new DOMParser();xmlDoc=parser.parseFromString(xmlString,"text/xml");}else{throw new Error("Could not create XML Document.");}return xmlDoc;},serialize:function(xmlDocument){if(window.XMLSerializer){return new XMLSerializer().serializeToString(xmlDocument);}else{return xmlDocument.xml;}}};
var urlencode={encode:function(string){return string.toString().replace(/%/gm,"%25").replace(/\+/gm,"%2B").replace(/ /gm,"+").replace(/&/gm,"%26").replace(/\=/gm,"%3D").replace(/\?/gm,"%3F").replace(/\//gm,"%2F").replace(/\\/gm,"%5C").replace(/:/gm,"%3A").replace(/;/gm,"%3B").replace(/@/gm,"%40").replace(/#/gm,"%23");},decode:function(string){return string.replace(/%23/igm,"#").replace(/%40/igm,"@").replace(/%3b/igm,";").replace(/%3a/igm,":").replace(/%5c/igm,"\\").replace(/%2f/igm,"/").replace(/%3f/igm,"?").replace(/%3d/igm,"=").replace(/%26/igm,"&").replace(/\+/igm," ").replace(/%2b/igm,"+").replace(/%25/igm,"%");},serialize:function(object){var ret=[];for(var key in object){if(is.array(object[key])){for(var i=0;i<object[key].length;i++){ret.push(urlencode.encode(key)+"="+urlencode.encode(object[key][i]));}}else if(is.string(object[key])||is.number(object[key])){ret.push(urlencode.encode(key)+"="+urlencode.encode(object[key]));}}return ret.join("&");},parse:function(string){if(string){var ret={};string.split("&").each(function(variable){var segments=variable.split("=");var name=urlencode.decode(segments[0]),value=urlencode.decode(segments[1]||"").trynumber();if(name){if(is.useful(ret[name])){if(is.array(ret[name])){ret[name].push(value);}else{ret[name]=[ret[name],value];}}else{ret[name]=value;}}});return ret;}else{return{};}}};
var browser=(function(){var b={searchString:function(data){for(var i=0;i<data.length;i++){var dataString=data[i].string;var dataProp=data[i].prop;this.versionSearchString=data[i].versionSearch||data[i].identity;if(dataString){if(dataString.indexOf(data[i].subString)!=-1)return data[i].identity;}else if(dataProp)return data[i].identity;}},searchVersion:function(dataString){var index=dataString.indexOf(this.versionSearchString);if(index==-1){return;}return parseFloat(dataString.substring(index+this.versionSearchString.length+1));},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.vendor,subString:"Apple",identity:"Safari"},{prop:window.opera,identity:"Opera"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.userAgent,subString:"MSIE",identity:"IE",versionSearch:"MSIE"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};b.name=b.searchString(b.dataBrowser)||"unknown";b.version=b.searchVersion(navigator.userAgent)||b.searchVersion(navigator.appVersion)||"unknown";b.OS=b.searchString(b.dataOS)||"unknown";return b;})();
var url=(function(){var segments=location.href.toString().split("?");var path=segments[0],queryString=segments[1],vars={},anchor=location.hash.replace(/^#/,"");if(queryString){queryString.split("&").each(function(v){var parts=v.split("=");var name=unescape(parts[0]),value=unescape(parts[1]).trynumber();if(is.useful(vars[name])){if(is.array(vars[name]))vars[name].push(value);else vars[name]=[vars[name],value];}else{vars[name]=value;}});}return{href:path,anchor:anchor,vars:vars};})();

var util = {};
util.Class=function(members){var init=members.init,extend=members.Extends;var constructor=function(){this.parent=extend;if(init)init.apply(this,arguments);delete this.parent;};if(extend){var fn=function(){};fn.prototype=extend.prototype;constructor.prototype=new fn();constructor.prototype.constructor=constructor;}Object.each(members,function(member,name){if(!["Extends","parent"].contains(name))constructor.prototype[name]=member;});return constructor;};
util.Timer=function(interval,callback,startAlready,executeNow){var tid=null,active=false,self=this;this.interval=interval;this.callback=callback;var timeout=function(){clearTimeout(tid);tid=setTimeout(execute,self.interval);};var execute=function(){if(active){self.callback.call(self);timeout();}};this.start=function(executeNow){if(executeNow)execute();else timeout();active=true;};this.stop=function(){clearTimeout(tid);active=false;};this.restart=function(){this.stop();this.start();};this.isActive=function(){return active;};if(startAlready)this.start(executeNow);};
util.Channel=function(bubbleTo){var self=this;var eventSubscribers={};var bubbler=bubbleTo;this.subscribe=function(eventName,callback){if(!eventSubscribers[eventName])eventSubscribers[eventName]=[];eventSubscribers[eventName].uniquepush(callback);return this;};this.publish=function(eventName,sender,payload){if(eventSubscribers[eventName]){var stop=false;eventSubscribers[eventName].each(function(fn){if(!stop)stop=fn.call(sender,payload)===false;});if(bubbler&&!stop)bubbler.publish(eventName,sender,payload);}return!stop;};this.unsubscribe=function(eventName,callback){eventSubscribers[eventName].remove(callback);};this.bubble=function(channel){bubbler=channel;return this;};};
