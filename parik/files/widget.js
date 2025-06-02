var wu = (e) => {
  throw TypeError(e);
};
var Hl = (e, t, n) => t.has(e) || wu("Cannot " + n);
var p = (e, t, n) => (Hl(e, t, "read from private field"), n ? n.call(e) : t.get(e)), N = (e, t, n) => t.has(e) ? wu("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Q = (e, t, n, r) => (Hl(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), H = (e, t, n) => (Hl(e, t, "access private method"), n);
var Ai = (e, t, n, r) => ({
  set _(i) {
    Q(e, t, i, n);
  },
  get _() {
    return p(e, t, r);
  }
});
var Xa = { exports: {} }, kl = {}, qa = { exports: {} }, z = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fi = Symbol.for("react.element"), xd = Symbol.for("react.portal"), Bd = Symbol.for("react.fragment"), Rd = Symbol.for("react.strict_mode"), Id = Symbol.for("react.profiler"), Qd = Symbol.for("react.provider"), Md = Symbol.for("react.context"), Pd = Symbol.for("react.forward_ref"), Fd = Symbol.for("react.suspense"), Nd = Symbol.for("react.memo"), Dd = Symbol.for("react.lazy"), ku = Symbol.iterator;
function Ld(e) {
  return e === null || typeof e != "object" ? null : (e = ku && e[ku] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Za = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, ba = Object.assign, _a = {};
function pr(e, t, n) {
  this.props = e, this.context = t, this.refs = _a, this.updater = n || Za;
}
pr.prototype.isReactComponent = {};
pr.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
pr.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function $a() {
}
$a.prototype = pr.prototype;
function Ss(e, t, n) {
  this.props = e, this.context = t, this.refs = _a, this.updater = n || Za;
}
var Cs = Ss.prototype = new $a();
Cs.constructor = Ss;
ba(Cs, pr.prototype);
Cs.isPureReactComponent = !0;
var Su = Array.isArray, ec = Object.prototype.hasOwnProperty, Es = { current: null }, tc = { key: !0, ref: !0, __self: !0, __source: !0 };
function nc(e, t, n) {
  var r, i = {}, l = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (l = "" + t.key), t) ec.call(t, r) && !tc.hasOwnProperty(r) && (i[r] = t[r]);
  var s = arguments.length - 2;
  if (s === 1) i.children = n;
  else if (1 < s) {
    for (var u = Array(s), c = 0; c < s; c++) u[c] = arguments[c + 2];
    i.children = u;
  }
  if (e && e.defaultProps) for (r in s = e.defaultProps, s) i[r] === void 0 && (i[r] = s[r]);
  return { $$typeof: fi, type: e, key: l, ref: o, props: i, _owner: Es.current };
}
function Td(e, t) {
  return { $$typeof: fi, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function xs(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fi;
}
function Od(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Cu = /\/+/g;
function Gl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Od("" + e.key) : t.toString(36);
}
function ji(e, t, n, r, i) {
  var l = typeof e;
  (l === "undefined" || l === "boolean") && (e = null);
  var o = !1;
  if (e === null) o = !0;
  else switch (l) {
    case "string":
    case "number":
      o = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case fi:
        case xd:
          o = !0;
      }
  }
  if (o) return o = e, i = i(o), e = r === "" ? "." + Gl(o, 0) : r, Su(i) ? (n = "", e != null && (n = e.replace(Cu, "$&/") + "/"), ji(i, t, n, "", function(c) {
    return c;
  })) : i != null && (xs(i) && (i = Td(i, n + (!i.key || o && o.key === i.key ? "" : ("" + i.key).replace(Cu, "$&/") + "/") + e)), t.push(i)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", Su(e)) for (var s = 0; s < e.length; s++) {
    l = e[s];
    var u = r + Gl(l, s);
    o += ji(l, t, n, u, i);
  }
  else if (u = Ld(e), typeof u == "function") for (e = u.call(e), s = 0; !(l = e.next()).done; ) l = l.value, u = r + Gl(l, s++), o += ji(l, t, n, u, i);
  else if (l === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function wi(e, t, n) {
  if (e == null) return e;
  var r = [], i = 0;
  return ji(e, r, "", "", function(l) {
    return t.call(n, l, i++);
  }), r;
}
function jd(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ee = { current: null }, Ui = { transition: null }, Ud = { ReactCurrentDispatcher: Ee, ReactCurrentBatchConfig: Ui, ReactCurrentOwner: Es };
function rc() {
  throw Error("act(...) is not supported in production builds of React.");
}
z.Children = { map: wi, forEach: function(e, t, n) {
  wi(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return wi(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return wi(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!xs(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
z.Component = pr;
z.Fragment = Bd;
z.Profiler = Id;
z.PureComponent = Ss;
z.StrictMode = Rd;
z.Suspense = Fd;
z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ud;
z.act = rc;
z.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = ba({}, e.props), i = e.key, l = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (l = t.ref, o = Es.current), t.key !== void 0 && (i = "" + t.key), e.type && e.type.defaultProps) var s = e.type.defaultProps;
    for (u in t) ec.call(t, u) && !tc.hasOwnProperty(u) && (r[u] = t[u] === void 0 && s !== void 0 ? s[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    s = Array(u);
    for (var c = 0; c < u; c++) s[c] = arguments[c + 2];
    r.children = s;
  }
  return { $$typeof: fi, type: e.type, key: i, ref: l, props: r, _owner: o };
};
z.createContext = function(e) {
  return e = { $$typeof: Md, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Qd, _context: e }, e.Consumer = e;
};
z.createElement = nc;
z.createFactory = function(e) {
  var t = nc.bind(null, e);
  return t.type = e, t;
};
z.createRef = function() {
  return { current: null };
};
z.forwardRef = function(e) {
  return { $$typeof: Pd, render: e };
};
z.isValidElement = xs;
z.lazy = function(e) {
  return { $$typeof: Dd, _payload: { _status: -1, _result: e }, _init: jd };
};
z.memo = function(e, t) {
  return { $$typeof: Nd, type: e, compare: t === void 0 ? null : t };
};
z.startTransition = function(e) {
  var t = Ui.transition;
  Ui.transition = {};
  try {
    e();
  } finally {
    Ui.transition = t;
  }
};
z.unstable_act = rc;
z.useCallback = function(e, t) {
  return Ee.current.useCallback(e, t);
};
z.useContext = function(e) {
  return Ee.current.useContext(e);
};
z.useDebugValue = function() {
};
z.useDeferredValue = function(e) {
  return Ee.current.useDeferredValue(e);
};
z.useEffect = function(e, t) {
  return Ee.current.useEffect(e, t);
};
z.useId = function() {
  return Ee.current.useId();
};
z.useImperativeHandle = function(e, t, n) {
  return Ee.current.useImperativeHandle(e, t, n);
};
z.useInsertionEffect = function(e, t) {
  return Ee.current.useInsertionEffect(e, t);
};
z.useLayoutEffect = function(e, t) {
  return Ee.current.useLayoutEffect(e, t);
};
z.useMemo = function(e, t) {
  return Ee.current.useMemo(e, t);
};
z.useReducer = function(e, t, n) {
  return Ee.current.useReducer(e, t, n);
};
z.useRef = function(e) {
  return Ee.current.useRef(e);
};
z.useState = function(e) {
  return Ee.current.useState(e);
};
z.useSyncExternalStore = function(e, t, n) {
  return Ee.current.useSyncExternalStore(e, t, n);
};
z.useTransition = function() {
  return Ee.current.useTransition();
};
z.version = "18.3.1";
qa.exports = z;
var F = qa.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zd = F, Hd = Symbol.for("react.element"), Gd = Symbol.for("react.fragment"), Yd = Object.prototype.hasOwnProperty, Vd = zd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Kd = { key: !0, ref: !0, __self: !0, __source: !0 };
function ic(e, t, n) {
  var r, i = {}, l = null, o = null;
  n !== void 0 && (l = "" + n), t.key !== void 0 && (l = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Yd.call(t, r) && !Kd.hasOwnProperty(r) && (i[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) i[r] === void 0 && (i[r] = t[r]);
  return { $$typeof: Hd, type: e, key: l, ref: o, props: i, _owner: Vd.current };
}
kl.Fragment = Gd;
kl.jsx = ic;
kl.jsxs = ic;
Xa.exports = kl;
var S = Xa.exports, di = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = this.subscribe.bind(this);
  }
  subscribe(e) {
    return this.listeners.add(e), this.onSubscribe(), () => {
      this.listeners.delete(e), this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
}, or = typeof window > "u" || "Deno" in globalThis;
function Ye() {
}
function Wd(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function go(e) {
  return typeof e == "number" && e >= 0 && e !== 1 / 0;
}
function lc(e, t) {
  return Math.max(e + (t || 0) - Date.now(), 0);
}
function zn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function et(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Eu(e, t) {
  const {
    type: n = "all",
    exact: r,
    fetchStatus: i,
    predicate: l,
    queryKey: o,
    stale: s
  } = e;
  if (o) {
    if (r) {
      if (t.queryHash !== Bs(o, t.options))
        return !1;
    } else if (!Yr(t.queryKey, o))
      return !1;
  }
  if (n !== "all") {
    const u = t.isActive();
    if (n === "active" && !u || n === "inactive" && u)
      return !1;
  }
  return !(typeof s == "boolean" && t.isStale() !== s || i && i !== t.state.fetchStatus || l && !l(t));
}
function xu(e, t) {
  const { exact: n, status: r, predicate: i, mutationKey: l } = e;
  if (l) {
    if (!t.options.mutationKey)
      return !1;
    if (n) {
      if (Gr(t.options.mutationKey) !== Gr(l))
        return !1;
    } else if (!Yr(t.options.mutationKey, l))
      return !1;
  }
  return !(r && t.state.status !== r || i && !i(t));
}
function Bs(e, t) {
  return ((t == null ? void 0 : t.queryKeyHashFn) || Gr)(e);
}
function Gr(e) {
  return JSON.stringify(
    e,
    (t, n) => vo(n) ? Object.keys(n).sort().reduce((r, i) => (r[i] = n[i], r), {}) : n
  );
}
function Yr(e, t) {
  return e === t ? !0 : typeof e != typeof t ? !1 : e && t && typeof e == "object" && typeof t == "object" ? !Object.keys(t).some((n) => !Yr(e[n], t[n])) : !1;
}
function oc(e, t) {
  if (e === t)
    return e;
  const n = Bu(e) && Bu(t);
  if (n || vo(e) && vo(t)) {
    const r = n ? e : Object.keys(e), i = r.length, l = n ? t : Object.keys(t), o = l.length, s = n ? [] : {};
    let u = 0;
    for (let c = 0; c < o; c++) {
      const g = n ? c : l[c];
      (!n && r.includes(g) || n) && e[g] === void 0 && t[g] === void 0 ? (s[g] = void 0, u++) : (s[g] = oc(e[g], t[g]), s[g] === e[g] && e[g] !== void 0 && u++);
    }
    return i === o && u === i ? e : s;
  }
  return t;
}
function yo(e, t) {
  if (!t || Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const n in e)
    if (e[n] !== t[n])
      return !1;
  return !0;
}
function Bu(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function vo(e) {
  if (!Ru(e))
    return !1;
  const t = e.constructor;
  if (t === void 0)
    return !0;
  const n = t.prototype;
  return !(!Ru(n) || !n.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(e) !== Object.prototype);
}
function Ru(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function Jd(e) {
  return new Promise((t) => {
    setTimeout(t, e);
  });
}
function Ao(e, t, n) {
  return typeof n.structuralSharing == "function" ? n.structuralSharing(e, t) : n.structuralSharing !== !1 ? oc(e, t) : t;
}
function Xd(e, t, n = 0) {
  const r = [...e, t];
  return n && r.length > n ? r.slice(1) : r;
}
function qd(e, t, n = 0) {
  const r = [t, ...e];
  return n && r.length > n ? r.slice(0, -1) : r;
}
var sc = Symbol();
function uc(e, t) {
  return !e.queryFn && (t != null && t.initialPromise) ? () => t.initialPromise : !e.queryFn || e.queryFn === sc ? () => Promise.reject(new Error(`Missing queryFn: '${e.queryHash}'`)) : e.queryFn;
}
var un, Nt, Jn, Ua, Zd = (Ua = class extends di {
  constructor() {
    super();
    N(this, un);
    N(this, Nt);
    N(this, Jn);
    Q(this, Jn, (t) => {
      if (!or && window.addEventListener) {
        const n = () => t();
        return window.addEventListener("visibilitychange", n, !1), () => {
          window.removeEventListener("visibilitychange", n);
        };
      }
    });
  }
  onSubscribe() {
    p(this, Nt) || this.setEventListener(p(this, Jn));
  }
  onUnsubscribe() {
    var t;
    this.hasListeners() || ((t = p(this, Nt)) == null || t.call(this), Q(this, Nt, void 0));
  }
  setEventListener(t) {
    var n;
    Q(this, Jn, t), (n = p(this, Nt)) == null || n.call(this), Q(this, Nt, t((r) => {
      typeof r == "boolean" ? this.setFocused(r) : this.onFocus();
    }));
  }
  setFocused(t) {
    p(this, un) !== t && (Q(this, un, t), this.onFocus());
  }
  onFocus() {
    const t = this.isFocused();
    this.listeners.forEach((n) => {
      n(t);
    });
  }
  isFocused() {
    var t;
    return typeof p(this, un) == "boolean" ? p(this, un) : ((t = globalThis.document) == null ? void 0 : t.visibilityState) !== "hidden";
  }
}, un = new WeakMap(), Nt = new WeakMap(), Jn = new WeakMap(), Ua), Rs = new Zd(), Xn, Dt, qn, za, bd = (za = class extends di {
  constructor() {
    super();
    N(this, Xn, !0);
    N(this, Dt);
    N(this, qn);
    Q(this, qn, (t) => {
      if (!or && window.addEventListener) {
        const n = () => t(!0), r = () => t(!1);
        return window.addEventListener("online", n, !1), window.addEventListener("offline", r, !1), () => {
          window.removeEventListener("online", n), window.removeEventListener("offline", r);
        };
      }
    });
  }
  onSubscribe() {
    p(this, Dt) || this.setEventListener(p(this, qn));
  }
  onUnsubscribe() {
    var t;
    this.hasListeners() || ((t = p(this, Dt)) == null || t.call(this), Q(this, Dt, void 0));
  }
  setEventListener(t) {
    var n;
    Q(this, qn, t), (n = p(this, Dt)) == null || n.call(this), Q(this, Dt, t(this.setOnline.bind(this)));
  }
  setOnline(t) {
    p(this, Xn) !== t && (Q(this, Xn, t), this.listeners.forEach((r) => {
      r(t);
    }));
  }
  isOnline() {
    return p(this, Xn);
  }
}, Xn = new WeakMap(), Dt = new WeakMap(), qn = new WeakMap(), za), Zi = new bd();
function _d(e) {
  return Math.min(1e3 * 2 ** e, 3e4);
}
function ac(e) {
  return (e ?? "online") === "online" ? Zi.isOnline() : !0;
}
var cc = class extends Error {
  constructor(e) {
    super("CancelledError"), this.revert = e == null ? void 0 : e.revert, this.silent = e == null ? void 0 : e.silent;
  }
};
function Yl(e) {
  return e instanceof cc;
}
function fc(e) {
  let t = !1, n = 0, r = !1, i, l, o;
  const s = new Promise((f, a) => {
    l = f, o = a;
  }), u = (f) => {
    var a;
    r || (w(new cc(f)), (a = e.abort) == null || a.call(e));
  }, c = () => {
    t = !0;
  }, g = () => {
    t = !1;
  }, h = () => Rs.isFocused() && (e.networkMode === "always" || Zi.isOnline()) && e.canRun(), m = () => ac(e.networkMode) && e.canRun(), v = (f) => {
    var a;
    r || (r = !0, (a = e.onSuccess) == null || a.call(e, f), i == null || i(), l(f));
  }, w = (f) => {
    var a;
    r || (r = !0, (a = e.onError) == null || a.call(e, f), i == null || i(), o(f));
  }, C = () => new Promise((f) => {
    var a;
    i = (d) => {
      (r || h()) && f(d);
    }, (a = e.onPause) == null || a.call(e);
  }).then(() => {
    var f;
    i = void 0, r || (f = e.onContinue) == null || f.call(e);
  }), P = () => {
    if (r)
      return;
    let f;
    const a = n === 0 ? e.initialPromise : void 0;
    try {
      f = a ?? e.fn();
    } catch (d) {
      f = Promise.reject(d);
    }
    Promise.resolve(f).then(v).catch((d) => {
      var k;
      if (r)
        return;
      const y = e.retry ?? (or ? 0 : 3), A = e.retryDelay ?? _d, B = typeof A == "function" ? A(n, d) : A, x = y === !0 || typeof y == "number" && n < y || typeof y == "function" && y(n, d);
      if (t || !x) {
        w(d);
        return;
      }
      n++, (k = e.onFail) == null || k.call(e, n, d), Jd(B).then(() => h() ? void 0 : C()).then(() => {
        t ? w(d) : P();
      });
    });
  };
  return {
    promise: s,
    cancel: u,
    continue: () => (i == null || i(), s),
    cancelRetry: c,
    continueRetry: g,
    canStart: m,
    start: () => (m() ? P() : C().then(P), s)
  };
}
function $d() {
  let e = [], t = 0, n = (s) => {
    s();
  }, r = (s) => {
    s();
  }, i = (s) => setTimeout(s, 0);
  const l = (s) => {
    t ? e.push(s) : i(() => {
      n(s);
    });
  }, o = () => {
    const s = e;
    e = [], s.length && i(() => {
      r(() => {
        s.forEach((u) => {
          n(u);
        });
      });
    });
  };
  return {
    batch: (s) => {
      let u;
      t++;
      try {
        u = s();
      } finally {
        t--, t || o();
      }
      return u;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (s) => (...u) => {
      l(() => {
        s(...u);
      });
    },
    schedule: l,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (s) => {
      n = s;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (s) => {
      r = s;
    },
    setScheduler: (s) => {
      i = s;
    }
  };
}
var de = $d(), an, Ha, dc = (Ha = class {
  constructor() {
    N(this, an);
  }
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), go(this.gcTime) && Q(this, an, setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(e) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      e ?? (or ? 1 / 0 : 5 * 60 * 1e3)
    );
  }
  clearGcTimeout() {
    p(this, an) && (clearTimeout(p(this, an)), Q(this, an, void 0));
  }
}, an = new WeakMap(), Ha), Zn, bn, Ge, ye, si, cn, _e, gt, Ga, eh = (Ga = class extends dc {
  constructor(t) {
    super();
    N(this, _e);
    N(this, Zn);
    N(this, bn);
    N(this, Ge);
    N(this, ye);
    N(this, si);
    N(this, cn);
    Q(this, cn, !1), Q(this, si, t.defaultOptions), this.setOptions(t.options), this.observers = [], Q(this, Ge, t.cache), this.queryKey = t.queryKey, this.queryHash = t.queryHash, Q(this, Zn, th(this.options)), this.state = t.state ?? p(this, Zn), this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get promise() {
    var t;
    return (t = p(this, ye)) == null ? void 0 : t.promise;
  }
  setOptions(t) {
    this.options = { ...p(this, si), ...t }, this.updateGcTime(this.options.gcTime);
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && p(this, Ge).remove(this);
  }
  setData(t, n) {
    const r = Ao(this.state.data, t, this.options);
    return H(this, _e, gt).call(this, {
      data: r,
      type: "success",
      dataUpdatedAt: n == null ? void 0 : n.updatedAt,
      manual: n == null ? void 0 : n.manual
    }), r;
  }
  setState(t, n) {
    H(this, _e, gt).call(this, { type: "setState", state: t, setStateOptions: n });
  }
  cancel(t) {
    var r, i;
    const n = (r = p(this, ye)) == null ? void 0 : r.promise;
    return (i = p(this, ye)) == null || i.cancel(t), n ? n.then(Ye).catch(Ye) : Promise.resolve();
  }
  destroy() {
    super.destroy(), this.cancel({ silent: !0 });
  }
  reset() {
    this.destroy(), this.setState(p(this, Zn));
  }
  isActive() {
    return this.observers.some(
      (t) => et(t.options.enabled, this) !== !1
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 && !this.isActive();
  }
  isStale() {
    return this.state.isInvalidated ? !0 : this.getObserversCount() > 0 ? this.observers.some(
      (t) => t.getCurrentResult().isStale
    ) : this.state.data === void 0;
  }
  isStaleByTime(t = 0) {
    return this.state.isInvalidated || this.state.data === void 0 || !lc(this.state.dataUpdatedAt, t);
  }
  onFocus() {
    var n;
    const t = this.observers.find((r) => r.shouldFetchOnWindowFocus());
    t == null || t.refetch({ cancelRefetch: !1 }), (n = p(this, ye)) == null || n.continue();
  }
  onOnline() {
    var n;
    const t = this.observers.find((r) => r.shouldFetchOnReconnect());
    t == null || t.refetch({ cancelRefetch: !1 }), (n = p(this, ye)) == null || n.continue();
  }
  addObserver(t) {
    this.observers.includes(t) || (this.observers.push(t), this.clearGcTimeout(), p(this, Ge).notify({ type: "observerAdded", query: this, observer: t }));
  }
  removeObserver(t) {
    this.observers.includes(t) && (this.observers = this.observers.filter((n) => n !== t), this.observers.length || (p(this, ye) && (p(this, cn) ? p(this, ye).cancel({ revert: !0 }) : p(this, ye).cancelRetry()), this.scheduleGc()), p(this, Ge).notify({ type: "observerRemoved", query: this, observer: t }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    this.state.isInvalidated || H(this, _e, gt).call(this, { type: "invalidate" });
  }
  fetch(t, n) {
    var u, c, g;
    if (this.state.fetchStatus !== "idle") {
      if (this.state.data !== void 0 && (n != null && n.cancelRefetch))
        this.cancel({ silent: !0 });
      else if (p(this, ye))
        return p(this, ye).continueRetry(), p(this, ye).promise;
    }
    if (t && this.setOptions(t), !this.options.queryFn) {
      const h = this.observers.find((m) => m.options.queryFn);
      h && this.setOptions(h.options);
    }
    const r = new AbortController(), i = (h) => {
      Object.defineProperty(h, "signal", {
        enumerable: !0,
        get: () => (Q(this, cn, !0), r.signal)
      });
    }, l = () => {
      const h = uc(this.options, n), m = {
        queryKey: this.queryKey,
        meta: this.meta
      };
      return i(m), Q(this, cn, !1), this.options.persister ? this.options.persister(
        h,
        m,
        this
      ) : h(m);
    }, o = {
      fetchOptions: n,
      options: this.options,
      queryKey: this.queryKey,
      state: this.state,
      fetchFn: l
    };
    i(o), (u = this.options.behavior) == null || u.onFetch(
      o,
      this
    ), Q(this, bn, this.state), (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((c = o.fetchOptions) == null ? void 0 : c.meta)) && H(this, _e, gt).call(this, { type: "fetch", meta: (g = o.fetchOptions) == null ? void 0 : g.meta });
    const s = (h) => {
      var m, v, w, C;
      Yl(h) && h.silent || H(this, _e, gt).call(this, {
        type: "error",
        error: h
      }), Yl(h) || ((v = (m = p(this, Ge).config).onError) == null || v.call(
        m,
        h,
        this
      ), (C = (w = p(this, Ge).config).onSettled) == null || C.call(
        w,
        this.state.data,
        h,
        this
      )), this.isFetchingOptimistic || this.scheduleGc(), this.isFetchingOptimistic = !1;
    };
    return Q(this, ye, fc({
      initialPromise: n == null ? void 0 : n.initialPromise,
      fn: o.fetchFn,
      abort: r.abort.bind(r),
      onSuccess: (h) => {
        var m, v, w, C;
        if (h === void 0) {
          s(new Error(`${this.queryHash} data is undefined`));
          return;
        }
        try {
          this.setData(h);
        } catch (P) {
          s(P);
          return;
        }
        (v = (m = p(this, Ge).config).onSuccess) == null || v.call(m, h, this), (C = (w = p(this, Ge).config).onSettled) == null || C.call(
          w,
          h,
          this.state.error,
          this
        ), this.isFetchingOptimistic || this.scheduleGc(), this.isFetchingOptimistic = !1;
      },
      onError: s,
      onFail: (h, m) => {
        H(this, _e, gt).call(this, { type: "failed", failureCount: h, error: m });
      },
      onPause: () => {
        H(this, _e, gt).call(this, { type: "pause" });
      },
      onContinue: () => {
        H(this, _e, gt).call(this, { type: "continue" });
      },
      retry: o.options.retry,
      retryDelay: o.options.retryDelay,
      networkMode: o.options.networkMode,
      canRun: () => !0
    })), p(this, ye).start();
  }
}, Zn = new WeakMap(), bn = new WeakMap(), Ge = new WeakMap(), ye = new WeakMap(), si = new WeakMap(), cn = new WeakMap(), _e = new WeakSet(), gt = function(t) {
  const n = (r) => {
    switch (t.type) {
      case "failed":
        return {
          ...r,
          fetchFailureCount: t.failureCount,
          fetchFailureReason: t.error
        };
      case "pause":
        return {
          ...r,
          fetchStatus: "paused"
        };
      case "continue":
        return {
          ...r,
          fetchStatus: "fetching"
        };
      case "fetch":
        return {
          ...r,
          ...hc(r.data, this.options),
          fetchMeta: t.meta ?? null
        };
      case "success":
        return {
          ...r,
          data: t.data,
          dataUpdateCount: r.dataUpdateCount + 1,
          dataUpdatedAt: t.dataUpdatedAt ?? Date.now(),
          error: null,
          isInvalidated: !1,
          status: "success",
          ...!t.manual && {
            fetchStatus: "idle",
            fetchFailureCount: 0,
            fetchFailureReason: null
          }
        };
      case "error":
        const i = t.error;
        return Yl(i) && i.revert && p(this, bn) ? { ...p(this, bn), fetchStatus: "idle" } : {
          ...r,
          error: i,
          errorUpdateCount: r.errorUpdateCount + 1,
          errorUpdatedAt: Date.now(),
          fetchFailureCount: r.fetchFailureCount + 1,
          fetchFailureReason: i,
          fetchStatus: "idle",
          status: "error"
        };
      case "invalidate":
        return {
          ...r,
          isInvalidated: !0
        };
      case "setState":
        return {
          ...r,
          ...t.state
        };
    }
  };
  this.state = n(this.state), de.batch(() => {
    this.observers.forEach((r) => {
      r.onQueryUpdate();
    }), p(this, Ge).notify({ query: this, type: "updated", action: t });
  });
}, Ga);
function hc(e, t) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: ac(t.networkMode) ? "fetching" : "paused",
    ...e === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function th(e) {
  const t = typeof e.initialData == "function" ? e.initialData() : e.initialData, n = t !== void 0, r = n ? typeof e.initialDataUpdatedAt == "function" ? e.initialDataUpdatedAt() : e.initialDataUpdatedAt : 0;
  return {
    data: t,
    dataUpdateCount: 0,
    dataUpdatedAt: n ? r ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: n ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var at, Ya, nh = (Ya = class extends di {
  constructor(t = {}) {
    super();
    N(this, at);
    this.config = t, Q(this, at, /* @__PURE__ */ new Map());
  }
  build(t, n, r) {
    const i = n.queryKey, l = n.queryHash ?? Bs(i, n);
    let o = this.get(l);
    return o || (o = new eh({
      cache: this,
      queryKey: i,
      queryHash: l,
      options: t.defaultQueryOptions(n),
      state: r,
      defaultOptions: t.getQueryDefaults(i)
    }), this.add(o)), o;
  }
  add(t) {
    p(this, at).has(t.queryHash) || (p(this, at).set(t.queryHash, t), this.notify({
      type: "added",
      query: t
    }));
  }
  remove(t) {
    const n = p(this, at).get(t.queryHash);
    n && (t.destroy(), n === t && p(this, at).delete(t.queryHash), this.notify({ type: "removed", query: t }));
  }
  clear() {
    de.batch(() => {
      this.getAll().forEach((t) => {
        this.remove(t);
      });
    });
  }
  get(t) {
    return p(this, at).get(t);
  }
  getAll() {
    return [...p(this, at).values()];
  }
  find(t) {
    const n = { exact: !0, ...t };
    return this.getAll().find(
      (r) => Eu(n, r)
    );
  }
  findAll(t = {}) {
    const n = this.getAll();
    return Object.keys(t).length > 0 ? n.filter((r) => Eu(t, r)) : n;
  }
  notify(t) {
    de.batch(() => {
      this.listeners.forEach((n) => {
        n(t);
      });
    });
  }
  onFocus() {
    de.batch(() => {
      this.getAll().forEach((t) => {
        t.onFocus();
      });
    });
  }
  onOnline() {
    de.batch(() => {
      this.getAll().forEach((t) => {
        t.onOnline();
      });
    });
  }
}, at = new WeakMap(), Ya), ct, we, fn, ft, It, Va, rh = (Va = class extends dc {
  constructor(t) {
    super();
    N(this, ft);
    N(this, ct);
    N(this, we);
    N(this, fn);
    this.mutationId = t.mutationId, Q(this, we, t.mutationCache), Q(this, ct, []), this.state = t.state || ih(), this.setOptions(t.options), this.scheduleGc();
  }
  setOptions(t) {
    this.options = t, this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(t) {
    p(this, ct).includes(t) || (p(this, ct).push(t), this.clearGcTimeout(), p(this, we).notify({
      type: "observerAdded",
      mutation: this,
      observer: t
    }));
  }
  removeObserver(t) {
    Q(this, ct, p(this, ct).filter((n) => n !== t)), this.scheduleGc(), p(this, we).notify({
      type: "observerRemoved",
      mutation: this,
      observer: t
    });
  }
  optionalRemove() {
    p(this, ct).length || (this.state.status === "pending" ? this.scheduleGc() : p(this, we).remove(this));
  }
  continue() {
    var t;
    return ((t = p(this, fn)) == null ? void 0 : t.continue()) ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(t) {
    var i, l, o, s, u, c, g, h, m, v, w, C, P, f, a, d, y, A, B, x;
    Q(this, fn, fc({
      fn: () => this.options.mutationFn ? this.options.mutationFn(t) : Promise.reject(new Error("No mutationFn found")),
      onFail: (k, j) => {
        H(this, ft, It).call(this, { type: "failed", failureCount: k, error: j });
      },
      onPause: () => {
        H(this, ft, It).call(this, { type: "pause" });
      },
      onContinue: () => {
        H(this, ft, It).call(this, { type: "continue" });
      },
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => p(this, we).canRun(this)
    }));
    const n = this.state.status === "pending", r = !p(this, fn).canStart();
    try {
      if (!n) {
        H(this, ft, It).call(this, { type: "pending", variables: t, isPaused: r }), await ((l = (i = p(this, we).config).onMutate) == null ? void 0 : l.call(
          i,
          t,
          this
        ));
        const j = await ((s = (o = this.options).onMutate) == null ? void 0 : s.call(o, t));
        j !== this.state.context && H(this, ft, It).call(this, {
          type: "pending",
          context: j,
          variables: t,
          isPaused: r
        });
      }
      const k = await p(this, fn).start();
      return await ((c = (u = p(this, we).config).onSuccess) == null ? void 0 : c.call(
        u,
        k,
        t,
        this.state.context,
        this
      )), await ((h = (g = this.options).onSuccess) == null ? void 0 : h.call(g, k, t, this.state.context)), await ((v = (m = p(this, we).config).onSettled) == null ? void 0 : v.call(
        m,
        k,
        null,
        this.state.variables,
        this.state.context,
        this
      )), await ((C = (w = this.options).onSettled) == null ? void 0 : C.call(w, k, null, t, this.state.context)), H(this, ft, It).call(this, { type: "success", data: k }), k;
    } catch (k) {
      try {
        throw await ((f = (P = p(this, we).config).onError) == null ? void 0 : f.call(
          P,
          k,
          t,
          this.state.context,
          this
        )), await ((d = (a = this.options).onError) == null ? void 0 : d.call(
          a,
          k,
          t,
          this.state.context
        )), await ((A = (y = p(this, we).config).onSettled) == null ? void 0 : A.call(
          y,
          void 0,
          k,
          this.state.variables,
          this.state.context,
          this
        )), await ((x = (B = this.options).onSettled) == null ? void 0 : x.call(
          B,
          void 0,
          k,
          t,
          this.state.context
        )), k;
      } finally {
        H(this, ft, It).call(this, { type: "error", error: k });
      }
    } finally {
      p(this, we).runNext(this);
    }
  }
}, ct = new WeakMap(), we = new WeakMap(), fn = new WeakMap(), ft = new WeakSet(), It = function(t) {
  const n = (r) => {
    switch (t.type) {
      case "failed":
        return {
          ...r,
          failureCount: t.failureCount,
          failureReason: t.error
        };
      case "pause":
        return {
          ...r,
          isPaused: !0
        };
      case "continue":
        return {
          ...r,
          isPaused: !1
        };
      case "pending":
        return {
          ...r,
          context: t.context,
          data: void 0,
          failureCount: 0,
          failureReason: null,
          error: null,
          isPaused: t.isPaused,
          status: "pending",
          variables: t.variables,
          submittedAt: Date.now()
        };
      case "success":
        return {
          ...r,
          data: t.data,
          failureCount: 0,
          failureReason: null,
          error: null,
          status: "success",
          isPaused: !1
        };
      case "error":
        return {
          ...r,
          data: void 0,
          error: t.error,
          failureCount: r.failureCount + 1,
          failureReason: t.error,
          isPaused: !1,
          status: "error"
        };
    }
  };
  this.state = n(this.state), de.batch(() => {
    p(this, ct).forEach((r) => {
      r.onMutationUpdate(t);
    }), p(this, we).notify({
      mutation: this,
      type: "updated",
      action: t
    });
  });
}, Va);
function ih() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var De, ui, Ka, lh = (Ka = class extends di {
  constructor(t = {}) {
    super();
    N(this, De);
    N(this, ui);
    this.config = t, Q(this, De, /* @__PURE__ */ new Map()), Q(this, ui, Date.now());
  }
  build(t, n, r) {
    const i = new rh({
      mutationCache: this,
      mutationId: ++Ai(this, ui)._,
      options: t.defaultMutationOptions(n),
      state: r
    });
    return this.add(i), i;
  }
  add(t) {
    const n = ki(t), r = p(this, De).get(n) ?? [];
    r.push(t), p(this, De).set(n, r), this.notify({ type: "added", mutation: t });
  }
  remove(t) {
    var r;
    const n = ki(t);
    if (p(this, De).has(n)) {
      const i = (r = p(this, De).get(n)) == null ? void 0 : r.filter((l) => l !== t);
      i && (i.length === 0 ? p(this, De).delete(n) : p(this, De).set(n, i));
    }
    this.notify({ type: "removed", mutation: t });
  }
  canRun(t) {
    var r;
    const n = (r = p(this, De).get(ki(t))) == null ? void 0 : r.find((i) => i.state.status === "pending");
    return !n || n === t;
  }
  runNext(t) {
    var r;
    const n = (r = p(this, De).get(ki(t))) == null ? void 0 : r.find((i) => i !== t && i.state.isPaused);
    return (n == null ? void 0 : n.continue()) ?? Promise.resolve();
  }
  clear() {
    de.batch(() => {
      this.getAll().forEach((t) => {
        this.remove(t);
      });
    });
  }
  getAll() {
    return [...p(this, De).values()].flat();
  }
  find(t) {
    const n = { exact: !0, ...t };
    return this.getAll().find(
      (r) => xu(n, r)
    );
  }
  findAll(t = {}) {
    return this.getAll().filter((n) => xu(t, n));
  }
  notify(t) {
    de.batch(() => {
      this.listeners.forEach((n) => {
        n(t);
      });
    });
  }
  resumePausedMutations() {
    const t = this.getAll().filter((n) => n.state.isPaused);
    return de.batch(
      () => Promise.all(
        t.map((n) => n.continue().catch(Ye))
      )
    );
  }
}, De = new WeakMap(), ui = new WeakMap(), Ka);
function ki(e) {
  var t;
  return ((t = e.options.scope) == null ? void 0 : t.id) ?? String(e.mutationId);
}
function oh(e) {
  return {
    onFetch: (t, n) => {
      const r = async () => {
        var w, C, P, f, a;
        const i = t.options, l = (P = (C = (w = t.fetchOptions) == null ? void 0 : w.meta) == null ? void 0 : C.fetchMore) == null ? void 0 : P.direction, o = ((f = t.state.data) == null ? void 0 : f.pages) || [], s = ((a = t.state.data) == null ? void 0 : a.pageParams) || [], u = { pages: [], pageParams: [] };
        let c = !1;
        const g = (d) => {
          Object.defineProperty(d, "signal", {
            enumerable: !0,
            get: () => (t.signal.aborted ? c = !0 : t.signal.addEventListener("abort", () => {
              c = !0;
            }), t.signal)
          });
        }, h = uc(t.options, t.fetchOptions), m = async (d, y, A) => {
          if (c)
            return Promise.reject();
          if (y == null && d.pages.length)
            return Promise.resolve(d);
          const B = {
            queryKey: t.queryKey,
            pageParam: y,
            direction: A ? "backward" : "forward",
            meta: t.options.meta
          };
          g(B);
          const x = await h(
            B
          ), { maxPages: k } = t.options, j = A ? qd : Xd;
          return {
            pages: j(d.pages, x, k),
            pageParams: j(d.pageParams, y, k)
          };
        };
        let v;
        if (l && o.length) {
          const d = l === "backward", y = d ? sh : Iu, A = {
            pages: o,
            pageParams: s
          }, B = y(i, A);
          v = await m(A, B, d);
        } else {
          v = await m(
            u,
            s[0] ?? i.initialPageParam
          );
          const d = e ?? o.length;
          for (let y = 1; y < d; y++) {
            const A = Iu(i, v);
            if (A == null)
              break;
            v = await m(v, A);
          }
        }
        return v;
      };
      t.options.persister ? t.fetchFn = () => {
        var i, l;
        return (l = (i = t.options).persister) == null ? void 0 : l.call(
          i,
          r,
          {
            queryKey: t.queryKey,
            meta: t.options.meta,
            signal: t.signal
          },
          n
        );
      } : t.fetchFn = r;
    }
  };
}
function Iu(e, { pages: t, pageParams: n }) {
  const r = t.length - 1;
  return t.length > 0 ? e.getNextPageParam(
    t[r],
    t,
    n[r],
    n
  ) : void 0;
}
function sh(e, { pages: t, pageParams: n }) {
  var r;
  return t.length > 0 ? (r = e.getPreviousPageParam) == null ? void 0 : r.call(e, t[0], t, n[0], n) : void 0;
}
var te, Lt, Tt, _n, $n, Ot, er, tr, Wa, uh = (Wa = class {
  constructor(e = {}) {
    N(this, te);
    N(this, Lt);
    N(this, Tt);
    N(this, _n);
    N(this, $n);
    N(this, Ot);
    N(this, er);
    N(this, tr);
    Q(this, te, e.queryCache || new nh()), Q(this, Lt, e.mutationCache || new lh()), Q(this, Tt, e.defaultOptions || {}), Q(this, _n, /* @__PURE__ */ new Map()), Q(this, $n, /* @__PURE__ */ new Map()), Q(this, Ot, 0);
  }
  mount() {
    Ai(this, Ot)._++, p(this, Ot) === 1 && (Q(this, er, Rs.subscribe(async (e) => {
      e && (await this.resumePausedMutations(), p(this, te).onFocus());
    })), Q(this, tr, Zi.subscribe(async (e) => {
      e && (await this.resumePausedMutations(), p(this, te).onOnline());
    })));
  }
  unmount() {
    var e, t;
    Ai(this, Ot)._--, p(this, Ot) === 0 && ((e = p(this, er)) == null || e.call(this), Q(this, er, void 0), (t = p(this, tr)) == null || t.call(this), Q(this, tr, void 0));
  }
  isFetching(e) {
    return p(this, te).findAll({ ...e, fetchStatus: "fetching" }).length;
  }
  isMutating(e) {
    return p(this, Lt).findAll({ ...e, status: "pending" }).length;
  }
  getQueryData(e) {
    var n;
    const t = this.defaultQueryOptions({ queryKey: e });
    return (n = p(this, te).get(t.queryHash)) == null ? void 0 : n.state.data;
  }
  ensureQueryData(e) {
    const t = this.getQueryData(e.queryKey);
    if (t === void 0)
      return this.fetchQuery(e);
    {
      const n = this.defaultQueryOptions(e), r = p(this, te).build(this, n);
      return e.revalidateIfStale && r.isStaleByTime(zn(n.staleTime, r)) && this.prefetchQuery(n), Promise.resolve(t);
    }
  }
  getQueriesData(e) {
    return p(this, te).findAll(e).map(({ queryKey: t, state: n }) => {
      const r = n.data;
      return [t, r];
    });
  }
  setQueryData(e, t, n) {
    const r = this.defaultQueryOptions({ queryKey: e }), i = p(this, te).get(
      r.queryHash
    ), l = i == null ? void 0 : i.state.data, o = Wd(t, l);
    if (o !== void 0)
      return p(this, te).build(this, r).setData(o, { ...n, manual: !0 });
  }
  setQueriesData(e, t, n) {
    return de.batch(
      () => p(this, te).findAll(e).map(({ queryKey: r }) => [
        r,
        this.setQueryData(r, t, n)
      ])
    );
  }
  getQueryState(e) {
    var n;
    const t = this.defaultQueryOptions({ queryKey: e });
    return (n = p(this, te).get(t.queryHash)) == null ? void 0 : n.state;
  }
  removeQueries(e) {
    const t = p(this, te);
    de.batch(() => {
      t.findAll(e).forEach((n) => {
        t.remove(n);
      });
    });
  }
  resetQueries(e, t) {
    const n = p(this, te), r = {
      type: "active",
      ...e
    };
    return de.batch(() => (n.findAll(e).forEach((i) => {
      i.reset();
    }), this.refetchQueries(r, t)));
  }
  cancelQueries(e = {}, t = {}) {
    const n = { revert: !0, ...t }, r = de.batch(
      () => p(this, te).findAll(e).map((i) => i.cancel(n))
    );
    return Promise.all(r).then(Ye).catch(Ye);
  }
  invalidateQueries(e = {}, t = {}) {
    return de.batch(() => {
      if (p(this, te).findAll(e).forEach((r) => {
        r.invalidate();
      }), e.refetchType === "none")
        return Promise.resolve();
      const n = {
        ...e,
        type: e.refetchType ?? e.type ?? "active"
      };
      return this.refetchQueries(n, t);
    });
  }
  refetchQueries(e = {}, t) {
    const n = {
      ...t,
      cancelRefetch: (t == null ? void 0 : t.cancelRefetch) ?? !0
    }, r = de.batch(
      () => p(this, te).findAll(e).filter((i) => !i.isDisabled()).map((i) => {
        let l = i.fetch(void 0, n);
        return n.throwOnError || (l = l.catch(Ye)), i.state.fetchStatus === "paused" ? Promise.resolve() : l;
      })
    );
    return Promise.all(r).then(Ye);
  }
  fetchQuery(e) {
    const t = this.defaultQueryOptions(e);
    t.retry === void 0 && (t.retry = !1);
    const n = p(this, te).build(this, t);
    return n.isStaleByTime(
      zn(t.staleTime, n)
    ) ? n.fetch(t) : Promise.resolve(n.state.data);
  }
  prefetchQuery(e) {
    return this.fetchQuery(e).then(Ye).catch(Ye);
  }
  fetchInfiniteQuery(e) {
    return e.behavior = oh(e.pages), this.fetchQuery(e);
  }
  prefetchInfiniteQuery(e) {
    return this.fetchInfiniteQuery(e).then(Ye).catch(Ye);
  }
  resumePausedMutations() {
    return Zi.isOnline() ? p(this, Lt).resumePausedMutations() : Promise.resolve();
  }
  getQueryCache() {
    return p(this, te);
  }
  getMutationCache() {
    return p(this, Lt);
  }
  getDefaultOptions() {
    return p(this, Tt);
  }
  setDefaultOptions(e) {
    Q(this, Tt, e);
  }
  setQueryDefaults(e, t) {
    p(this, _n).set(Gr(e), {
      queryKey: e,
      defaultOptions: t
    });
  }
  getQueryDefaults(e) {
    const t = [...p(this, _n).values()];
    let n = {};
    return t.forEach((r) => {
      Yr(e, r.queryKey) && (n = { ...n, ...r.defaultOptions });
    }), n;
  }
  setMutationDefaults(e, t) {
    p(this, $n).set(Gr(e), {
      mutationKey: e,
      defaultOptions: t
    });
  }
  getMutationDefaults(e) {
    const t = [...p(this, $n).values()];
    let n = {};
    return t.forEach((r) => {
      Yr(e, r.mutationKey) && (n = { ...n, ...r.defaultOptions });
    }), n;
  }
  defaultQueryOptions(e) {
    if (e._defaulted)
      return e;
    const t = {
      ...p(this, Tt).queries,
      ...this.getQueryDefaults(e.queryKey),
      ...e,
      _defaulted: !0
    };
    return t.queryHash || (t.queryHash = Bs(
      t.queryKey,
      t
    )), t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"), t.throwOnError === void 0 && (t.throwOnError = !!t.suspense), !t.networkMode && t.persister && (t.networkMode = "offlineFirst"), t.enabled !== !0 && t.queryFn === sc && (t.enabled = !1), t;
  }
  defaultMutationOptions(e) {
    return e != null && e._defaulted ? e : {
      ...p(this, Tt).mutations,
      ...(e == null ? void 0 : e.mutationKey) && this.getMutationDefaults(e.mutationKey),
      ...e,
      _defaulted: !0
    };
  }
  clear() {
    p(this, te).clear(), p(this, Lt).clear();
  }
}, te = new WeakMap(), Lt = new WeakMap(), Tt = new WeakMap(), _n = new WeakMap(), $n = new WeakMap(), Ot = new WeakMap(), er = new WeakMap(), tr = new WeakMap(), Wa), Re, G, ai, ke, dn, nr, dt, ci, rr, ir, hn, pn, jt, lr, V, Ir, wo, ko, So, Co, Eo, xo, Bo, pc, Ja, ah = (Ja = class extends di {
  constructor(t, n) {
    super();
    N(this, V);
    N(this, Re);
    N(this, G);
    N(this, ai);
    N(this, ke);
    N(this, dn);
    N(this, nr);
    N(this, dt);
    N(this, ci);
    N(this, rr);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    N(this, ir);
    N(this, hn);
    N(this, pn);
    N(this, jt);
    N(this, lr, /* @__PURE__ */ new Set());
    this.options = n, Q(this, Re, t), Q(this, dt, null), this.bindMethods(), this.setOptions(n);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 && (p(this, G).addObserver(this), Qu(p(this, G), this.options) ? H(this, V, Ir).call(this) : this.updateResult(), H(this, V, Co).call(this));
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return Ro(
      p(this, G),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return Ro(
      p(this, G),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set(), H(this, V, Eo).call(this), H(this, V, xo).call(this), p(this, G).removeObserver(this);
  }
  setOptions(t, n) {
    const r = this.options, i = p(this, G);
    if (this.options = p(this, Re).defaultQueryOptions(t), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof et(this.options.enabled, p(this, G)) != "boolean")
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    H(this, V, Bo).call(this), p(this, G).setOptions(this.options), r._defaulted && !yo(this.options, r) && p(this, Re).getQueryCache().notify({
      type: "observerOptionsUpdated",
      query: p(this, G),
      observer: this
    });
    const l = this.hasListeners();
    l && Mu(
      p(this, G),
      i,
      this.options,
      r
    ) && H(this, V, Ir).call(this), this.updateResult(n), l && (p(this, G) !== i || et(this.options.enabled, p(this, G)) !== et(r.enabled, p(this, G)) || zn(this.options.staleTime, p(this, G)) !== zn(r.staleTime, p(this, G))) && H(this, V, wo).call(this);
    const o = H(this, V, ko).call(this);
    l && (p(this, G) !== i || et(this.options.enabled, p(this, G)) !== et(r.enabled, p(this, G)) || o !== p(this, jt)) && H(this, V, So).call(this, o);
  }
  getOptimisticResult(t) {
    const n = p(this, Re).getQueryCache().build(p(this, Re), t), r = this.createResult(n, t);
    return fh(this, r) && (Q(this, ke, r), Q(this, nr, this.options), Q(this, dn, p(this, G).state)), r;
  }
  getCurrentResult() {
    return p(this, ke);
  }
  trackResult(t, n) {
    const r = {};
    return Object.keys(t).forEach((i) => {
      Object.defineProperty(r, i, {
        configurable: !1,
        enumerable: !0,
        get: () => (this.trackProp(i), n == null || n(i), t[i])
      });
    }), r;
  }
  trackProp(t) {
    p(this, lr).add(t);
  }
  getCurrentQuery() {
    return p(this, G);
  }
  refetch({ ...t } = {}) {
    return this.fetch({
      ...t
    });
  }
  fetchOptimistic(t) {
    const n = p(this, Re).defaultQueryOptions(t), r = p(this, Re).getQueryCache().build(p(this, Re), n);
    return r.isFetchingOptimistic = !0, r.fetch().then(() => this.createResult(r, n));
  }
  fetch(t) {
    return H(this, V, Ir).call(this, {
      ...t,
      cancelRefetch: t.cancelRefetch ?? !0
    }).then(() => (this.updateResult(), p(this, ke)));
  }
  createResult(t, n) {
    var x;
    const r = p(this, G), i = this.options, l = p(this, ke), o = p(this, dn), s = p(this, nr), c = t !== r ? t.state : p(this, ai), { state: g } = t;
    let h = { ...g }, m = !1, v;
    if (n._optimisticResults) {
      const k = this.hasListeners(), j = !k && Qu(t, n), L = k && Mu(t, r, n, i);
      (j || L) && (h = {
        ...h,
        ...hc(g.data, t.options)
      }), n._optimisticResults === "isRestoring" && (h.fetchStatus = "idle");
    }
    let { error: w, errorUpdatedAt: C, status: P } = h;
    if (n.select && h.data !== void 0)
      if (l && h.data === (o == null ? void 0 : o.data) && n.select === p(this, ci))
        v = p(this, rr);
      else
        try {
          Q(this, ci, n.select), v = n.select(h.data), v = Ao(l == null ? void 0 : l.data, v, n), Q(this, rr, v), Q(this, dt, null);
        } catch (k) {
          Q(this, dt, k);
        }
    else
      v = h.data;
    if (n.placeholderData !== void 0 && v === void 0 && P === "pending") {
      let k;
      if (l != null && l.isPlaceholderData && n.placeholderData === (s == null ? void 0 : s.placeholderData))
        k = l.data;
      else if (k = typeof n.placeholderData == "function" ? n.placeholderData(
        (x = p(this, ir)) == null ? void 0 : x.state.data,
        p(this, ir)
      ) : n.placeholderData, n.select && k !== void 0)
        try {
          k = n.select(k), Q(this, dt, null);
        } catch (j) {
          Q(this, dt, j);
        }
      k !== void 0 && (P = "success", v = Ao(
        l == null ? void 0 : l.data,
        k,
        n
      ), m = !0);
    }
    p(this, dt) && (w = p(this, dt), v = p(this, rr), C = Date.now(), P = "error");
    const f = h.fetchStatus === "fetching", a = P === "pending", d = P === "error", y = a && f, A = v !== void 0;
    return {
      status: P,
      fetchStatus: h.fetchStatus,
      isPending: a,
      isSuccess: P === "success",
      isError: d,
      isInitialLoading: y,
      isLoading: y,
      data: v,
      dataUpdatedAt: h.dataUpdatedAt,
      error: w,
      errorUpdatedAt: C,
      failureCount: h.fetchFailureCount,
      failureReason: h.fetchFailureReason,
      errorUpdateCount: h.errorUpdateCount,
      isFetched: h.dataUpdateCount > 0 || h.errorUpdateCount > 0,
      isFetchedAfterMount: h.dataUpdateCount > c.dataUpdateCount || h.errorUpdateCount > c.errorUpdateCount,
      isFetching: f,
      isRefetching: f && !a,
      isLoadingError: d && !A,
      isPaused: h.fetchStatus === "paused",
      isPlaceholderData: m,
      isRefetchError: d && A,
      isStale: Is(t, n),
      refetch: this.refetch
    };
  }
  updateResult(t) {
    const n = p(this, ke), r = this.createResult(p(this, G), this.options);
    if (Q(this, dn, p(this, G).state), Q(this, nr, this.options), p(this, dn).data !== void 0 && Q(this, ir, p(this, G)), yo(r, n))
      return;
    Q(this, ke, r);
    const i = {}, l = () => {
      if (!n)
        return !0;
      const { notifyOnChangeProps: o } = this.options, s = typeof o == "function" ? o() : o;
      if (s === "all" || !s && !p(this, lr).size)
        return !0;
      const u = new Set(
        s ?? p(this, lr)
      );
      return this.options.throwOnError && u.add("error"), Object.keys(p(this, ke)).some((c) => {
        const g = c;
        return p(this, ke)[g] !== n[g] && u.has(g);
      });
    };
    (t == null ? void 0 : t.listeners) !== !1 && l() && (i.listeners = !0), H(this, V, pc).call(this, { ...i, ...t });
  }
  onQueryUpdate() {
    this.updateResult(), this.hasListeners() && H(this, V, Co).call(this);
  }
}, Re = new WeakMap(), G = new WeakMap(), ai = new WeakMap(), ke = new WeakMap(), dn = new WeakMap(), nr = new WeakMap(), dt = new WeakMap(), ci = new WeakMap(), rr = new WeakMap(), ir = new WeakMap(), hn = new WeakMap(), pn = new WeakMap(), jt = new WeakMap(), lr = new WeakMap(), V = new WeakSet(), Ir = function(t) {
  H(this, V, Bo).call(this);
  let n = p(this, G).fetch(
    this.options,
    t
  );
  return t != null && t.throwOnError || (n = n.catch(Ye)), n;
}, wo = function() {
  H(this, V, Eo).call(this);
  const t = zn(
    this.options.staleTime,
    p(this, G)
  );
  if (or || p(this, ke).isStale || !go(t))
    return;
  const r = lc(p(this, ke).dataUpdatedAt, t) + 1;
  Q(this, hn, setTimeout(() => {
    p(this, ke).isStale || this.updateResult();
  }, r));
}, ko = function() {
  return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(p(this, G)) : this.options.refetchInterval) ?? !1;
}, So = function(t) {
  H(this, V, xo).call(this), Q(this, jt, t), !(or || et(this.options.enabled, p(this, G)) === !1 || !go(p(this, jt)) || p(this, jt) === 0) && Q(this, pn, setInterval(() => {
    (this.options.refetchIntervalInBackground || Rs.isFocused()) && H(this, V, Ir).call(this);
  }, p(this, jt)));
}, Co = function() {
  H(this, V, wo).call(this), H(this, V, So).call(this, H(this, V, ko).call(this));
}, Eo = function() {
  p(this, hn) && (clearTimeout(p(this, hn)), Q(this, hn, void 0));
}, xo = function() {
  p(this, pn) && (clearInterval(p(this, pn)), Q(this, pn, void 0));
}, Bo = function() {
  const t = p(this, Re).getQueryCache().build(p(this, Re), this.options);
  if (t === p(this, G))
    return;
  const n = p(this, G);
  Q(this, G, t), Q(this, ai, t.state), this.hasListeners() && (n == null || n.removeObserver(this), t.addObserver(this));
}, pc = function(t) {
  de.batch(() => {
    t.listeners && this.listeners.forEach((n) => {
      n(p(this, ke));
    }), p(this, Re).getQueryCache().notify({
      query: p(this, G),
      type: "observerResultsUpdated"
    });
  });
}, Ja);
function ch(e, t) {
  return et(t.enabled, e) !== !1 && e.state.data === void 0 && !(e.state.status === "error" && t.retryOnMount === !1);
}
function Qu(e, t) {
  return ch(e, t) || e.state.data !== void 0 && Ro(e, t, t.refetchOnMount);
}
function Ro(e, t, n) {
  if (et(t.enabled, e) !== !1) {
    const r = typeof n == "function" ? n(e) : n;
    return r === "always" || r !== !1 && Is(e, t);
  }
  return !1;
}
function Mu(e, t, n, r) {
  return (e !== t || et(r.enabled, e) === !1) && (!n.suspense || e.state.status !== "error") && Is(e, n);
}
function Is(e, t) {
  return et(t.enabled, e) !== !1 && e.isStaleByTime(zn(t.staleTime, e));
}
function fh(e, t) {
  return !yo(e.getCurrentResult(), t);
}
var mc = F.createContext(
  void 0
), dh = (e) => {
  const t = F.useContext(mc);
  if (!t)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return t;
}, hh = ({
  client: e,
  children: t
}) => (F.useEffect(() => (e.mount(), () => {
  e.unmount();
}), [e]), /* @__PURE__ */ S.jsx(mc.Provider, { value: e, children: t })), gc = F.createContext(!1), ph = () => F.useContext(gc);
gc.Provider;
function mh() {
  let e = !1;
  return {
    clearReset: () => {
      e = !1;
    },
    reset: () => {
      e = !0;
    },
    isReset: () => e
  };
}
var gh = F.createContext(mh()), yh = () => F.useContext(gh);
function vh(e, t) {
  return typeof e == "function" ? e(...t) : !!e;
}
var Ah = (e, t) => {
  (e.suspense || e.throwOnError) && (t.isReset() || (e.retryOnMount = !1));
}, wh = (e) => {
  F.useEffect(() => {
    e.clearReset();
  }, [e]);
}, kh = ({
  result: e,
  errorResetBoundary: t,
  throwOnError: n,
  query: r
}) => e.isError && !t.isReset() && !e.isFetching && r && vh(n, [e.error, r]), Sh = (e) => {
  e.suspense && (typeof e.staleTime != "number" && (e.staleTime = 1e3), typeof e.gcTime == "number" && (e.gcTime = Math.max(e.gcTime, 1e3)));
}, Ch = (e, t) => (e == null ? void 0 : e.suspense) && t.isPending, Eh = (e, t, n) => t.fetchOptimistic(e).catch(() => {
  n.clearReset();
});
function xh(e, t, n) {
  var c, g, h, m;
  const r = dh(), i = ph(), l = yh(), o = r.defaultQueryOptions(e);
  (g = (c = r.getDefaultOptions().queries) == null ? void 0 : c._experimental_beforeQuery) == null || g.call(
    c,
    o
  ), o._optimisticResults = i ? "isRestoring" : "optimistic", Sh(o), Ah(o, l), wh(l);
  const [s] = F.useState(
    () => new t(
      r,
      o
    )
  ), u = s.getOptimisticResult(o);
  if (F.useSyncExternalStore(
    F.useCallback(
      (v) => {
        const w = i ? () => {
        } : s.subscribe(de.batchCalls(v));
        return s.updateResult(), w;
      },
      [s, i]
    ),
    () => s.getCurrentResult(),
    () => s.getCurrentResult()
  ), F.useEffect(() => {
    s.setOptions(o, { listeners: !1 });
  }, [o, s]), Ch(o, u))
    throw Eh(o, s, l);
  if (kh({
    result: u,
    errorResetBoundary: l,
    throwOnError: o.throwOnError,
    query: r.getQueryCache().get(o.queryHash)
  }))
    throw u.error;
  return (m = (h = r.getDefaultOptions().queries) == null ? void 0 : h._experimental_afterQuery) == null || m.call(
    h,
    o,
    u
  ), o.notifyOnChangeProps ? u : s.trackResult(u);
}
function Bh(e, t) {
  return xh(e, ah);
}
var yc = { exports: {} }, Ue = {}, vc = { exports: {} }, Ac = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(e) {
  function t(R, D) {
    var T = R.length;
    R.push(D);
    e: for (; 0 < T; ) {
      var Z = T - 1 >>> 1, re = R[Z];
      if (0 < i(re, D)) R[Z] = D, R[T] = re, T = Z;
      else break e;
    }
  }
  function n(R) {
    return R.length === 0 ? null : R[0];
  }
  function r(R) {
    if (R.length === 0) return null;
    var D = R[0], T = R.pop();
    if (T !== D) {
      R[0] = T;
      e: for (var Z = 0, re = R.length, en = re >>> 1; Z < en; ) {
        var lt = 2 * (Z + 1) - 1, xn = R[lt], ot = lt + 1, tn = R[ot];
        if (0 > i(xn, T)) ot < re && 0 > i(tn, xn) ? (R[Z] = tn, R[ot] = T, Z = ot) : (R[Z] = xn, R[lt] = T, Z = lt);
        else if (ot < re && 0 > i(tn, T)) R[Z] = tn, R[ot] = T, Z = ot;
        else break e;
      }
    }
    return D;
  }
  function i(R, D) {
    var T = R.sortIndex - D.sortIndex;
    return T !== 0 ? T : R.id - D.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var l = performance;
    e.unstable_now = function() {
      return l.now();
    };
  } else {
    var o = Date, s = o.now();
    e.unstable_now = function() {
      return o.now() - s;
    };
  }
  var u = [], c = [], g = 1, h = null, m = 3, v = !1, w = !1, C = !1, P = typeof setTimeout == "function" ? setTimeout : null, f = typeof clearTimeout == "function" ? clearTimeout : null, a = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function d(R) {
    for (var D = n(c); D !== null; ) {
      if (D.callback === null) r(c);
      else if (D.startTime <= R) r(c), D.sortIndex = D.expirationTime, t(u, D);
      else break;
      D = n(c);
    }
  }
  function y(R) {
    if (C = !1, d(R), !w) if (n(u) !== null) w = !0, yr(A);
    else {
      var D = n(c);
      D !== null && vr(y, D.startTime - R);
    }
  }
  function A(R, D) {
    w = !1, C && (C = !1, f(k), k = -1), v = !0;
    var T = m;
    try {
      for (d(D), h = n(u); h !== null && (!(h.expirationTime > D) || R && !M()); ) {
        var Z = h.callback;
        if (typeof Z == "function") {
          h.callback = null, m = h.priorityLevel;
          var re = Z(h.expirationTime <= D);
          D = e.unstable_now(), typeof re == "function" ? h.callback = re : h === n(u) && r(u), d(D);
        } else r(u);
        h = n(u);
      }
      if (h !== null) var en = !0;
      else {
        var lt = n(c);
        lt !== null && vr(y, lt.startTime - D), en = !1;
      }
      return en;
    } finally {
      h = null, m = T, v = !1;
    }
  }
  var B = !1, x = null, k = -1, j = 5, L = -1;
  function M() {
    return !(e.unstable_now() - L < j);
  }
  function K() {
    if (x !== null) {
      var R = e.unstable_now();
      L = R;
      var D = !0;
      try {
        D = x(!0, R);
      } finally {
        D ? Ne() : (B = !1, x = null);
      }
    } else B = !1;
  }
  var Ne;
  if (typeof a == "function") Ne = function() {
    a(K);
  };
  else if (typeof MessageChannel < "u") {
    var En = new MessageChannel(), jl = En.port2;
    En.port1.onmessage = K, Ne = function() {
      jl.postMessage(null);
    };
  } else Ne = function() {
    P(K, 0);
  };
  function yr(R) {
    x = R, B || (B = !0, Ne());
  }
  function vr(R, D) {
    k = P(function() {
      R(e.unstable_now());
    }, D);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(R) {
    R.callback = null;
  }, e.unstable_continueExecution = function() {
    w || v || (w = !0, yr(A));
  }, e.unstable_forceFrameRate = function(R) {
    0 > R || 125 < R ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : j = 0 < R ? Math.floor(1e3 / R) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return m;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(u);
  }, e.unstable_next = function(R) {
    switch (m) {
      case 1:
      case 2:
      case 3:
        var D = 3;
        break;
      default:
        D = m;
    }
    var T = m;
    m = D;
    try {
      return R();
    } finally {
      m = T;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(R, D) {
    switch (R) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        R = 3;
    }
    var T = m;
    m = R;
    try {
      return D();
    } finally {
      m = T;
    }
  }, e.unstable_scheduleCallback = function(R, D, T) {
    var Z = e.unstable_now();
    switch (typeof T == "object" && T !== null ? (T = T.delay, T = typeof T == "number" && 0 < T ? Z + T : Z) : T = Z, R) {
      case 1:
        var re = -1;
        break;
      case 2:
        re = 250;
        break;
      case 5:
        re = 1073741823;
        break;
      case 4:
        re = 1e4;
        break;
      default:
        re = 5e3;
    }
    return re = T + re, R = { id: g++, callback: D, priorityLevel: R, startTime: T, expirationTime: re, sortIndex: -1 }, T > Z ? (R.sortIndex = T, t(c, R), n(u) === null && R === n(c) && (C ? (f(k), k = -1) : C = !0, vr(y, T - Z))) : (R.sortIndex = re, t(u, R), w || v || (w = !0, yr(A))), R;
  }, e.unstable_shouldYield = M, e.unstable_wrapCallback = function(R) {
    var D = m;
    return function() {
      var T = m;
      m = D;
      try {
        return R.apply(this, arguments);
      } finally {
        m = T;
      }
    };
  };
})(Ac);
vc.exports = Ac;
var Rh = vc.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ih = F, je = Rh;
function E(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var wc = /* @__PURE__ */ new Set(), Vr = {};
function Sn(e, t) {
  sr(e, t), sr(e + "Capture", t);
}
function sr(e, t) {
  for (Vr[e] = t, e = 0; e < t.length; e++) wc.add(t[e]);
}
var St = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Io = Object.prototype.hasOwnProperty, Qh = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Pu = {}, Fu = {};
function Mh(e) {
  return Io.call(Fu, e) ? !0 : Io.call(Pu, e) ? !1 : Qh.test(e) ? Fu[e] = !0 : (Pu[e] = !0, !1);
}
function Ph(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function Fh(e, t, n, r) {
  if (t === null || typeof t > "u" || Ph(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function xe(e, t, n, r, i, l, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = l, this.removeEmptyString = o;
}
var pe = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  pe[e] = new xe(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  pe[t] = new xe(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  pe[e] = new xe(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  pe[e] = new xe(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  pe[e] = new xe(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  pe[e] = new xe(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  pe[e] = new xe(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  pe[e] = new xe(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  pe[e] = new xe(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Qs = /[\-:]([a-z])/g;
function Ms(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Qs,
    Ms
  );
  pe[t] = new xe(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Qs, Ms);
  pe[t] = new xe(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Qs, Ms);
  pe[t] = new xe(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  pe[e] = new xe(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
pe.xlinkHref = new xe("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  pe[e] = new xe(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Ps(e, t, n, r) {
  var i = pe.hasOwnProperty(t) ? pe[t] : null;
  (i !== null ? i.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Fh(t, n, i, r) && (n = null), r || i === null ? Mh(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type === 3 ? !1 : "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (i = i.type, n = i === 3 || i === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Bt = Ih.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Si = Symbol.for("react.element"), In = Symbol.for("react.portal"), Qn = Symbol.for("react.fragment"), Fs = Symbol.for("react.strict_mode"), Qo = Symbol.for("react.profiler"), kc = Symbol.for("react.provider"), Sc = Symbol.for("react.context"), Ns = Symbol.for("react.forward_ref"), Mo = Symbol.for("react.suspense"), Po = Symbol.for("react.suspense_list"), Ds = Symbol.for("react.memo"), Qt = Symbol.for("react.lazy"), Cc = Symbol.for("react.offscreen"), Nu = Symbol.iterator;
function wr(e) {
  return e === null || typeof e != "object" ? null : (e = Nu && e[Nu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ee = Object.assign, Vl;
function Qr(e) {
  if (Vl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Vl = t && t[1] || "";
  }
  return `
` + Vl + e;
}
var Kl = !1;
function Wl(e, t) {
  if (!e || Kl) return "";
  Kl = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (c) {
        var r = c;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (c) {
        r = c;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (c) {
        r = c;
      }
      e();
    }
  } catch (c) {
    if (c && r && typeof c.stack == "string") {
      for (var i = c.stack.split(`
`), l = r.stack.split(`
`), o = i.length - 1, s = l.length - 1; 1 <= o && 0 <= s && i[o] !== l[s]; ) s--;
      for (; 1 <= o && 0 <= s; o--, s--) if (i[o] !== l[s]) {
        if (o !== 1 || s !== 1)
          do
            if (o--, s--, 0 > s || i[o] !== l[s]) {
              var u = `
` + i[o].replace(" at new ", " at ");
              return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
            }
          while (1 <= o && 0 <= s);
        break;
      }
    }
  } finally {
    Kl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? Qr(e) : "";
}
function Nh(e) {
  switch (e.tag) {
    case 5:
      return Qr(e.type);
    case 16:
      return Qr("Lazy");
    case 13:
      return Qr("Suspense");
    case 19:
      return Qr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Wl(e.type, !1), e;
    case 11:
      return e = Wl(e.type.render, !1), e;
    case 1:
      return e = Wl(e.type, !0), e;
    default:
      return "";
  }
}
function Fo(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Qn:
      return "Fragment";
    case In:
      return "Portal";
    case Qo:
      return "Profiler";
    case Fs:
      return "StrictMode";
    case Mo:
      return "Suspense";
    case Po:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case Sc:
      return (e.displayName || "Context") + ".Consumer";
    case kc:
      return (e._context.displayName || "Context") + ".Provider";
    case Ns:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Ds:
      return t = e.displayName || null, t !== null ? t : Fo(e.type) || "Memo";
    case Qt:
      t = e._payload, e = e._init;
      try {
        return Fo(e(t));
      } catch {
      }
  }
  return null;
}
function Dh(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Fo(t);
    case 8:
      return t === Fs ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function qt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function Ec(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Lh(e) {
  var t = Ec(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var i = n.get, l = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return i.call(this);
    }, set: function(o) {
      r = "" + o, l.call(this, o);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(o) {
      r = "" + o;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function Ci(e) {
  e._valueTracker || (e._valueTracker = Lh(e));
}
function xc(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Ec(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function bi(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function No(e, t) {
  var n = t.checked;
  return ee({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Du(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = qt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Bc(e, t) {
  t = t.checked, t != null && Ps(e, "checked", t, !1);
}
function Do(e, t) {
  Bc(e, t);
  var n = qt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Lo(e, t.type, n) : t.hasOwnProperty("defaultValue") && Lo(e, t.type, qt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Lu(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Lo(e, t, n) {
  (t !== "number" || bi(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Mr = Array.isArray;
function Hn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
    for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + qt(n), t = null, i = 0; i < e.length; i++) {
      if (e[i].value === n) {
        e[i].selected = !0, r && (e[i].defaultSelected = !0);
        return;
      }
      t !== null || e[i].disabled || (t = e[i]);
    }
    t !== null && (t.selected = !0);
  }
}
function To(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(E(91));
  return ee({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Tu(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(E(92));
      if (Mr(n)) {
        if (1 < n.length) throw Error(E(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: qt(n) };
}
function Rc(e, t) {
  var n = qt(t.value), r = qt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Ou(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Ic(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Oo(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? Ic(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var Ei, Qc = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, i);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (Ei = Ei || document.createElement("div"), Ei.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Ei.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function Kr(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Nr = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}, Th = ["Webkit", "ms", "Moz", "O"];
Object.keys(Nr).forEach(function(e) {
  Th.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Nr[t] = Nr[e];
  });
});
function Mc(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Nr.hasOwnProperty(e) && Nr[e] ? ("" + t).trim() : t + "px";
}
function Pc(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, i = Mc(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
  }
}
var Oh = ee({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function jo(e, t) {
  if (t) {
    if (Oh[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(E(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(E(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(E(62));
  }
}
function Uo(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var zo = null;
function Ls(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Ho = null, Gn = null, Yn = null;
function ju(e) {
  if (e = mi(e)) {
    if (typeof Ho != "function") throw Error(E(280));
    var t = e.stateNode;
    t && (t = Bl(t), Ho(e.stateNode, e.type, t));
  }
}
function Fc(e) {
  Gn ? Yn ? Yn.push(e) : Yn = [e] : Gn = e;
}
function Nc() {
  if (Gn) {
    var e = Gn, t = Yn;
    if (Yn = Gn = null, ju(e), t) for (e = 0; e < t.length; e++) ju(t[e]);
  }
}
function Dc(e, t) {
  return e(t);
}
function Lc() {
}
var Jl = !1;
function Tc(e, t, n) {
  if (Jl) return e(t, n);
  Jl = !0;
  try {
    return Dc(e, t, n);
  } finally {
    Jl = !1, (Gn !== null || Yn !== null) && (Lc(), Nc());
  }
}
function Wr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Bl(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(E(231, t, typeof n));
  return n;
}
var Go = !1;
if (St) try {
  var kr = {};
  Object.defineProperty(kr, "passive", { get: function() {
    Go = !0;
  } }), window.addEventListener("test", kr, kr), window.removeEventListener("test", kr, kr);
} catch {
  Go = !1;
}
function jh(e, t, n, r, i, l, o, s, u) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (g) {
    this.onError(g);
  }
}
var Dr = !1, _i = null, $i = !1, Yo = null, Uh = { onError: function(e) {
  Dr = !0, _i = e;
} };
function zh(e, t, n, r, i, l, o, s, u) {
  Dr = !1, _i = null, jh.apply(Uh, arguments);
}
function Hh(e, t, n, r, i, l, o, s, u) {
  if (zh.apply(this, arguments), Dr) {
    if (Dr) {
      var c = _i;
      Dr = !1, _i = null;
    } else throw Error(E(198));
    $i || ($i = !0, Yo = c);
  }
}
function Cn(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Oc(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Uu(e) {
  if (Cn(e) !== e) throw Error(E(188));
}
function Gh(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Cn(e), t === null) throw Error(E(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var i = n.return;
    if (i === null) break;
    var l = i.alternate;
    if (l === null) {
      if (r = i.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (i.child === l.child) {
      for (l = i.child; l; ) {
        if (l === n) return Uu(i), e;
        if (l === r) return Uu(i), t;
        l = l.sibling;
      }
      throw Error(E(188));
    }
    if (n.return !== r.return) n = i, r = l;
    else {
      for (var o = !1, s = i.child; s; ) {
        if (s === n) {
          o = !0, n = i, r = l;
          break;
        }
        if (s === r) {
          o = !0, r = i, n = l;
          break;
        }
        s = s.sibling;
      }
      if (!o) {
        for (s = l.child; s; ) {
          if (s === n) {
            o = !0, n = l, r = i;
            break;
          }
          if (s === r) {
            o = !0, r = l, n = i;
            break;
          }
          s = s.sibling;
        }
        if (!o) throw Error(E(189));
      }
    }
    if (n.alternate !== r) throw Error(E(190));
  }
  if (n.tag !== 3) throw Error(E(188));
  return n.stateNode.current === n ? e : t;
}
function jc(e) {
  return e = Gh(e), e !== null ? Uc(e) : null;
}
function Uc(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Uc(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var zc = je.unstable_scheduleCallback, zu = je.unstable_cancelCallback, Yh = je.unstable_shouldYield, Vh = je.unstable_requestPaint, ie = je.unstable_now, Kh = je.unstable_getCurrentPriorityLevel, Ts = je.unstable_ImmediatePriority, Hc = je.unstable_UserBlockingPriority, el = je.unstable_NormalPriority, Wh = je.unstable_LowPriority, Gc = je.unstable_IdlePriority, Sl = null, pt = null;
function Jh(e) {
  if (pt && typeof pt.onCommitFiberRoot == "function") try {
    pt.onCommitFiberRoot(Sl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var nt = Math.clz32 ? Math.clz32 : Zh, Xh = Math.log, qh = Math.LN2;
function Zh(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (Xh(e) / qh | 0) | 0;
}
var xi = 64, Bi = 4194304;
function Pr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function tl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, i = e.suspendedLanes, l = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var s = o & ~i;
    s !== 0 ? r = Pr(s) : (l &= o, l !== 0 && (r = Pr(l)));
  } else o = n & ~i, o !== 0 ? r = Pr(o) : l !== 0 && (r = Pr(l));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & i) && (i = r & -r, l = t & -t, i >= l || i === 16 && (l & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - nt(t), i = 1 << n, r |= e[n], t &= ~i;
  return r;
}
function bh(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function _h(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, l = e.pendingLanes; 0 < l; ) {
    var o = 31 - nt(l), s = 1 << o, u = i[o];
    u === -1 ? (!(s & n) || s & r) && (i[o] = bh(s, t)) : u <= t && (e.expiredLanes |= s), l &= ~s;
  }
}
function Vo(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Yc() {
  var e = xi;
  return xi <<= 1, !(xi & 4194240) && (xi = 64), e;
}
function Xl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function hi(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - nt(t), e[t] = n;
}
function $h(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var i = 31 - nt(n), l = 1 << i;
    t[i] = 0, r[i] = -1, e[i] = -1, n &= ~l;
  }
}
function Os(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - nt(n), i = 1 << r;
    i & t | e[r] & t && (e[r] |= t), n &= ~i;
  }
}
var W = 0;
function Vc(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Kc, js, Wc, Jc, Xc, Ko = !1, Ri = [], Ht = null, Gt = null, Yt = null, Jr = /* @__PURE__ */ new Map(), Xr = /* @__PURE__ */ new Map(), Pt = [], ep = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Hu(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Ht = null;
      break;
    case "dragenter":
    case "dragleave":
      Gt = null;
      break;
    case "mouseover":
    case "mouseout":
      Yt = null;
      break;
    case "pointerover":
    case "pointerout":
      Jr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Xr.delete(t.pointerId);
  }
}
function Sr(e, t, n, r, i, l) {
  return e === null || e.nativeEvent !== l ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: l, targetContainers: [i] }, t !== null && (t = mi(t), t !== null && js(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
}
function tp(e, t, n, r, i) {
  switch (t) {
    case "focusin":
      return Ht = Sr(Ht, e, t, n, r, i), !0;
    case "dragenter":
      return Gt = Sr(Gt, e, t, n, r, i), !0;
    case "mouseover":
      return Yt = Sr(Yt, e, t, n, r, i), !0;
    case "pointerover":
      var l = i.pointerId;
      return Jr.set(l, Sr(Jr.get(l) || null, e, t, n, r, i)), !0;
    case "gotpointercapture":
      return l = i.pointerId, Xr.set(l, Sr(Xr.get(l) || null, e, t, n, r, i)), !0;
  }
  return !1;
}
function qc(e) {
  var t = ln(e.target);
  if (t !== null) {
    var n = Cn(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Oc(n), t !== null) {
          e.blockedOn = t, Xc(e.priority, function() {
            Wc(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function zi(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Wo(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      zo = r, n.target.dispatchEvent(r), zo = null;
    } else return t = mi(n), t !== null && js(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Gu(e, t, n) {
  zi(e) && n.delete(t);
}
function np() {
  Ko = !1, Ht !== null && zi(Ht) && (Ht = null), Gt !== null && zi(Gt) && (Gt = null), Yt !== null && zi(Yt) && (Yt = null), Jr.forEach(Gu), Xr.forEach(Gu);
}
function Cr(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Ko || (Ko = !0, je.unstable_scheduleCallback(je.unstable_NormalPriority, np)));
}
function qr(e) {
  function t(i) {
    return Cr(i, e);
  }
  if (0 < Ri.length) {
    Cr(Ri[0], e);
    for (var n = 1; n < Ri.length; n++) {
      var r = Ri[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (Ht !== null && Cr(Ht, e), Gt !== null && Cr(Gt, e), Yt !== null && Cr(Yt, e), Jr.forEach(t), Xr.forEach(t), n = 0; n < Pt.length; n++) r = Pt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < Pt.length && (n = Pt[0], n.blockedOn === null); ) qc(n), n.blockedOn === null && Pt.shift();
}
var Vn = Bt.ReactCurrentBatchConfig, nl = !0;
function rp(e, t, n, r) {
  var i = W, l = Vn.transition;
  Vn.transition = null;
  try {
    W = 1, Us(e, t, n, r);
  } finally {
    W = i, Vn.transition = l;
  }
}
function ip(e, t, n, r) {
  var i = W, l = Vn.transition;
  Vn.transition = null;
  try {
    W = 4, Us(e, t, n, r);
  } finally {
    W = i, Vn.transition = l;
  }
}
function Us(e, t, n, r) {
  if (nl) {
    var i = Wo(e, t, n, r);
    if (i === null) io(e, t, r, rl, n), Hu(e, r);
    else if (tp(i, e, t, n, r)) r.stopPropagation();
    else if (Hu(e, r), t & 4 && -1 < ep.indexOf(e)) {
      for (; i !== null; ) {
        var l = mi(i);
        if (l !== null && Kc(l), l = Wo(e, t, n, r), l === null && io(e, t, r, rl, n), l === i) break;
        i = l;
      }
      i !== null && r.stopPropagation();
    } else io(e, t, r, null, n);
  }
}
var rl = null;
function Wo(e, t, n, r) {
  if (rl = null, e = Ls(r), e = ln(e), e !== null) if (t = Cn(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Oc(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return rl = e, null;
}
function Zc(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Kh()) {
        case Ts:
          return 1;
        case Hc:
          return 4;
        case el:
        case Wh:
          return 16;
        case Gc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Ut = null, zs = null, Hi = null;
function bc() {
  if (Hi) return Hi;
  var e, t = zs, n = t.length, r, i = "value" in Ut ? Ut.value : Ut.textContent, l = i.length;
  for (e = 0; e < n && t[e] === i[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === i[l - r]; r++) ;
  return Hi = i.slice(e, 1 < r ? 1 - r : void 0);
}
function Gi(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Ii() {
  return !0;
}
function Yu() {
  return !1;
}
function ze(e) {
  function t(n, r, i, l, o) {
    this._reactName = n, this._targetInst = i, this.type = r, this.nativeEvent = l, this.target = o, this.currentTarget = null;
    for (var s in e) e.hasOwnProperty(s) && (n = e[s], this[s] = n ? n(l) : l[s]);
    return this.isDefaultPrevented = (l.defaultPrevented != null ? l.defaultPrevented : l.returnValue === !1) ? Ii : Yu, this.isPropagationStopped = Yu, this;
  }
  return ee(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ii);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ii);
  }, persist: function() {
  }, isPersistent: Ii }), t;
}
var mr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Hs = ze(mr), pi = ee({}, mr, { view: 0, detail: 0 }), lp = ze(pi), ql, Zl, Er, Cl = ee({}, pi, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Gs, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Er && (Er && e.type === "mousemove" ? (ql = e.screenX - Er.screenX, Zl = e.screenY - Er.screenY) : Zl = ql = 0, Er = e), ql);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Zl;
} }), Vu = ze(Cl), op = ee({}, Cl, { dataTransfer: 0 }), sp = ze(op), up = ee({}, pi, { relatedTarget: 0 }), bl = ze(up), ap = ee({}, mr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), cp = ze(ap), fp = ee({}, mr, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), dp = ze(fp), hp = ee({}, mr, { data: 0 }), Ku = ze(hp), pp = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, mp = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, gp = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function yp(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = gp[e]) ? !!t[e] : !1;
}
function Gs() {
  return yp;
}
var vp = ee({}, pi, { key: function(e) {
  if (e.key) {
    var t = pp[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Gi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? mp[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Gs, charCode: function(e) {
  return e.type === "keypress" ? Gi(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Gi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Ap = ze(vp), wp = ee({}, Cl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Wu = ze(wp), kp = ee({}, pi, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Gs }), Sp = ze(kp), Cp = ee({}, mr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ep = ze(Cp), xp = ee({}, Cl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Bp = ze(xp), Rp = [9, 13, 27, 32], Ys = St && "CompositionEvent" in window, Lr = null;
St && "documentMode" in document && (Lr = document.documentMode);
var Ip = St && "TextEvent" in window && !Lr, _c = St && (!Ys || Lr && 8 < Lr && 11 >= Lr), Ju = " ", Xu = !1;
function $c(e, t) {
  switch (e) {
    case "keyup":
      return Rp.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function ef(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Mn = !1;
function Qp(e, t) {
  switch (e) {
    case "compositionend":
      return ef(t);
    case "keypress":
      return t.which !== 32 ? null : (Xu = !0, Ju);
    case "textInput":
      return e = t.data, e === Ju && Xu ? null : e;
    default:
      return null;
  }
}
function Mp(e, t) {
  if (Mn) return e === "compositionend" || !Ys && $c(e, t) ? (e = bc(), Hi = zs = Ut = null, Mn = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return _c && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Pp = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function qu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Pp[e.type] : t === "textarea";
}
function tf(e, t, n, r) {
  Fc(r), t = il(t, "onChange"), 0 < t.length && (n = new Hs("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Tr = null, Zr = null;
function Fp(e) {
  hf(e, 0);
}
function El(e) {
  var t = Nn(e);
  if (xc(t)) return e;
}
function Np(e, t) {
  if (e === "change") return t;
}
var nf = !1;
if (St) {
  var _l;
  if (St) {
    var $l = "oninput" in document;
    if (!$l) {
      var Zu = document.createElement("div");
      Zu.setAttribute("oninput", "return;"), $l = typeof Zu.oninput == "function";
    }
    _l = $l;
  } else _l = !1;
  nf = _l && (!document.documentMode || 9 < document.documentMode);
}
function bu() {
  Tr && (Tr.detachEvent("onpropertychange", rf), Zr = Tr = null);
}
function rf(e) {
  if (e.propertyName === "value" && El(Zr)) {
    var t = [];
    tf(t, Zr, e, Ls(e)), Tc(Fp, t);
  }
}
function Dp(e, t, n) {
  e === "focusin" ? (bu(), Tr = t, Zr = n, Tr.attachEvent("onpropertychange", rf)) : e === "focusout" && bu();
}
function Lp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return El(Zr);
}
function Tp(e, t) {
  if (e === "click") return El(t);
}
function Op(e, t) {
  if (e === "input" || e === "change") return El(t);
}
function jp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var it = typeof Object.is == "function" ? Object.is : jp;
function br(e, t) {
  if (it(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var i = n[r];
    if (!Io.call(t, i) || !it(e[i], t[i])) return !1;
  }
  return !0;
}
function _u(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function $u(e, t) {
  var n = _u(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = _u(n);
  }
}
function lf(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? lf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function of() {
  for (var e = window, t = bi(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = bi(e.document);
  }
  return t;
}
function Vs(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function Up(e) {
  var t = of(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && lf(n.ownerDocument.documentElement, n)) {
    if (r !== null && Vs(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var i = n.textContent.length, l = Math.min(r.start, i);
        r = r.end === void 0 ? l : Math.min(r.end, i), !e.extend && l > r && (i = r, r = l, l = i), i = $u(n, l);
        var o = $u(
          n,
          r
        );
        i && o && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(i.node, i.offset), e.removeAllRanges(), l > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var zp = St && "documentMode" in document && 11 >= document.documentMode, Pn = null, Jo = null, Or = null, Xo = !1;
function ea(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Xo || Pn == null || Pn !== bi(r) || (r = Pn, "selectionStart" in r && Vs(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Or && br(Or, r) || (Or = r, r = il(Jo, "onSelect"), 0 < r.length && (t = new Hs("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Pn)));
}
function Qi(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Fn = { animationend: Qi("Animation", "AnimationEnd"), animationiteration: Qi("Animation", "AnimationIteration"), animationstart: Qi("Animation", "AnimationStart"), transitionend: Qi("Transition", "TransitionEnd") }, eo = {}, sf = {};
St && (sf = document.createElement("div").style, "AnimationEvent" in window || (delete Fn.animationend.animation, delete Fn.animationiteration.animation, delete Fn.animationstart.animation), "TransitionEvent" in window || delete Fn.transitionend.transition);
function xl(e) {
  if (eo[e]) return eo[e];
  if (!Fn[e]) return e;
  var t = Fn[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in sf) return eo[e] = t[n];
  return e;
}
var uf = xl("animationend"), af = xl("animationiteration"), cf = xl("animationstart"), ff = xl("transitionend"), df = /* @__PURE__ */ new Map(), ta = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function bt(e, t) {
  df.set(e, t), Sn(t, [e]);
}
for (var to = 0; to < ta.length; to++) {
  var no = ta[to], Hp = no.toLowerCase(), Gp = no[0].toUpperCase() + no.slice(1);
  bt(Hp, "on" + Gp);
}
bt(uf, "onAnimationEnd");
bt(af, "onAnimationIteration");
bt(cf, "onAnimationStart");
bt("dblclick", "onDoubleClick");
bt("focusin", "onFocus");
bt("focusout", "onBlur");
bt(ff, "onTransitionEnd");
sr("onMouseEnter", ["mouseout", "mouseover"]);
sr("onMouseLeave", ["mouseout", "mouseover"]);
sr("onPointerEnter", ["pointerout", "pointerover"]);
sr("onPointerLeave", ["pointerout", "pointerover"]);
Sn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Sn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Sn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Sn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Sn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Sn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Fr = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Yp = new Set("cancel close invalid load scroll toggle".split(" ").concat(Fr));
function na(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Hh(r, t, void 0, e), e.currentTarget = null;
}
function hf(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], i = r.event;
    r = r.listeners;
    e: {
      var l = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var s = r[o], u = s.instance, c = s.currentTarget;
        if (s = s.listener, u !== l && i.isPropagationStopped()) break e;
        na(i, s, c), l = u;
      }
      else for (o = 0; o < r.length; o++) {
        if (s = r[o], u = s.instance, c = s.currentTarget, s = s.listener, u !== l && i.isPropagationStopped()) break e;
        na(i, s, c), l = u;
      }
    }
  }
  if ($i) throw e = Yo, $i = !1, Yo = null, e;
}
function X(e, t) {
  var n = t[$o];
  n === void 0 && (n = t[$o] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (pf(t, e, 2, !1), n.add(r));
}
function ro(e, t, n) {
  var r = 0;
  t && (r |= 4), pf(n, e, r, t);
}
var Mi = "_reactListening" + Math.random().toString(36).slice(2);
function _r(e) {
  if (!e[Mi]) {
    e[Mi] = !0, wc.forEach(function(n) {
      n !== "selectionchange" && (Yp.has(n) || ro(n, !1, e), ro(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Mi] || (t[Mi] = !0, ro("selectionchange", !1, t));
  }
}
function pf(e, t, n, r) {
  switch (Zc(t)) {
    case 1:
      var i = rp;
      break;
    case 4:
      i = ip;
      break;
    default:
      i = Us;
  }
  n = i.bind(null, t, n, e), i = void 0, !Go || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: i }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, { passive: i }) : e.addEventListener(t, n, !1);
}
function io(e, t, n, r, i) {
  var l = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var o = r.tag;
    if (o === 3 || o === 4) {
      var s = r.stateNode.containerInfo;
      if (s === i || s.nodeType === 8 && s.parentNode === i) break;
      if (o === 4) for (o = r.return; o !== null; ) {
        var u = o.tag;
        if ((u === 3 || u === 4) && (u = o.stateNode.containerInfo, u === i || u.nodeType === 8 && u.parentNode === i)) return;
        o = o.return;
      }
      for (; s !== null; ) {
        if (o = ln(s), o === null) return;
        if (u = o.tag, u === 5 || u === 6) {
          r = l = o;
          continue e;
        }
        s = s.parentNode;
      }
    }
    r = r.return;
  }
  Tc(function() {
    var c = l, g = Ls(n), h = [];
    e: {
      var m = df.get(e);
      if (m !== void 0) {
        var v = Hs, w = e;
        switch (e) {
          case "keypress":
            if (Gi(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = Ap;
            break;
          case "focusin":
            w = "focus", v = bl;
            break;
          case "focusout":
            w = "blur", v = bl;
            break;
          case "beforeblur":
          case "afterblur":
            v = bl;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = Vu;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = sp;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = Sp;
            break;
          case uf:
          case af:
          case cf:
            v = cp;
            break;
          case ff:
            v = Ep;
            break;
          case "scroll":
            v = lp;
            break;
          case "wheel":
            v = Bp;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = dp;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = Wu;
        }
        var C = (t & 4) !== 0, P = !C && e === "scroll", f = C ? m !== null ? m + "Capture" : null : m;
        C = [];
        for (var a = c, d; a !== null; ) {
          d = a;
          var y = d.stateNode;
          if (d.tag === 5 && y !== null && (d = y, f !== null && (y = Wr(a, f), y != null && C.push($r(a, y, d)))), P) break;
          a = a.return;
        }
        0 < C.length && (m = new v(m, w, null, n, g), h.push({ event: m, listeners: C }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (m = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", m && n !== zo && (w = n.relatedTarget || n.fromElement) && (ln(w) || w[Ct])) break e;
        if ((v || m) && (m = g.window === g ? g : (m = g.ownerDocument) ? m.defaultView || m.parentWindow : window, v ? (w = n.relatedTarget || n.toElement, v = c, w = w ? ln(w) : null, w !== null && (P = Cn(w), w !== P || w.tag !== 5 && w.tag !== 6) && (w = null)) : (v = null, w = c), v !== w)) {
          if (C = Vu, y = "onMouseLeave", f = "onMouseEnter", a = "mouse", (e === "pointerout" || e === "pointerover") && (C = Wu, y = "onPointerLeave", f = "onPointerEnter", a = "pointer"), P = v == null ? m : Nn(v), d = w == null ? m : Nn(w), m = new C(y, a + "leave", v, n, g), m.target = P, m.relatedTarget = d, y = null, ln(g) === c && (C = new C(f, a + "enter", w, n, g), C.target = d, C.relatedTarget = P, y = C), P = y, v && w) t: {
            for (C = v, f = w, a = 0, d = C; d; d = Bn(d)) a++;
            for (d = 0, y = f; y; y = Bn(y)) d++;
            for (; 0 < a - d; ) C = Bn(C), a--;
            for (; 0 < d - a; ) f = Bn(f), d--;
            for (; a--; ) {
              if (C === f || f !== null && C === f.alternate) break t;
              C = Bn(C), f = Bn(f);
            }
            C = null;
          }
          else C = null;
          v !== null && ra(h, m, v, C, !1), w !== null && P !== null && ra(h, P, w, C, !0);
        }
      }
      e: {
        if (m = c ? Nn(c) : window, v = m.nodeName && m.nodeName.toLowerCase(), v === "select" || v === "input" && m.type === "file") var A = Np;
        else if (qu(m)) if (nf) A = Op;
        else {
          A = Lp;
          var B = Dp;
        }
        else (v = m.nodeName) && v.toLowerCase() === "input" && (m.type === "checkbox" || m.type === "radio") && (A = Tp);
        if (A && (A = A(e, c))) {
          tf(h, A, n, g);
          break e;
        }
        B && B(e, m, c), e === "focusout" && (B = m._wrapperState) && B.controlled && m.type === "number" && Lo(m, "number", m.value);
      }
      switch (B = c ? Nn(c) : window, e) {
        case "focusin":
          (qu(B) || B.contentEditable === "true") && (Pn = B, Jo = c, Or = null);
          break;
        case "focusout":
          Or = Jo = Pn = null;
          break;
        case "mousedown":
          Xo = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Xo = !1, ea(h, n, g);
          break;
        case "selectionchange":
          if (zp) break;
        case "keydown":
        case "keyup":
          ea(h, n, g);
      }
      var x;
      if (Ys) e: {
        switch (e) {
          case "compositionstart":
            var k = "onCompositionStart";
            break e;
          case "compositionend":
            k = "onCompositionEnd";
            break e;
          case "compositionupdate":
            k = "onCompositionUpdate";
            break e;
        }
        k = void 0;
      }
      else Mn ? $c(e, n) && (k = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (k = "onCompositionStart");
      k && (_c && n.locale !== "ko" && (Mn || k !== "onCompositionStart" ? k === "onCompositionEnd" && Mn && (x = bc()) : (Ut = g, zs = "value" in Ut ? Ut.value : Ut.textContent, Mn = !0)), B = il(c, k), 0 < B.length && (k = new Ku(k, e, null, n, g), h.push({ event: k, listeners: B }), x ? k.data = x : (x = ef(n), x !== null && (k.data = x)))), (x = Ip ? Qp(e, n) : Mp(e, n)) && (c = il(c, "onBeforeInput"), 0 < c.length && (g = new Ku("onBeforeInput", "beforeinput", null, n, g), h.push({ event: g, listeners: c }), g.data = x));
    }
    hf(h, t);
  });
}
function $r(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function il(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var i = e, l = i.stateNode;
    i.tag === 5 && l !== null && (i = l, l = Wr(e, n), l != null && r.unshift($r(e, l, i)), l = Wr(e, t), l != null && r.push($r(e, l, i))), e = e.return;
  }
  return r;
}
function Bn(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function ra(e, t, n, r, i) {
  for (var l = t._reactName, o = []; n !== null && n !== r; ) {
    var s = n, u = s.alternate, c = s.stateNode;
    if (u !== null && u === r) break;
    s.tag === 5 && c !== null && (s = c, i ? (u = Wr(n, l), u != null && o.unshift($r(n, u, s))) : i || (u = Wr(n, l), u != null && o.push($r(n, u, s)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Vp = /\r\n?/g, Kp = /\u0000|\uFFFD/g;
function ia(e) {
  return (typeof e == "string" ? e : "" + e).replace(Vp, `
`).replace(Kp, "");
}
function Pi(e, t, n) {
  if (t = ia(t), ia(e) !== t && n) throw Error(E(425));
}
function ll() {
}
var qo = null, Zo = null;
function bo(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var _o = typeof setTimeout == "function" ? setTimeout : void 0, Wp = typeof clearTimeout == "function" ? clearTimeout : void 0, la = typeof Promise == "function" ? Promise : void 0, Jp = typeof queueMicrotask == "function" ? queueMicrotask : typeof la < "u" ? function(e) {
  return la.resolve(null).then(e).catch(Xp);
} : _o;
function Xp(e) {
  setTimeout(function() {
    throw e;
  });
}
function lo(e, t) {
  var n = t, r = 0;
  do {
    var i = n.nextSibling;
    if (e.removeChild(n), i && i.nodeType === 8) if (n = i.data, n === "/$") {
      if (r === 0) {
        e.removeChild(i), qr(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = i;
  } while (n);
  qr(t);
}
function Vt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function oa(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var gr = Math.random().toString(36).slice(2), ht = "__reactFiber$" + gr, ei = "__reactProps$" + gr, Ct = "__reactContainer$" + gr, $o = "__reactEvents$" + gr, qp = "__reactListeners$" + gr, Zp = "__reactHandles$" + gr;
function ln(e) {
  var t = e[ht];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[Ct] || n[ht]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = oa(e); e !== null; ) {
        if (n = e[ht]) return n;
        e = oa(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function mi(e) {
  return e = e[ht] || e[Ct], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Nn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(E(33));
}
function Bl(e) {
  return e[ei] || null;
}
var es = [], Dn = -1;
function _t(e) {
  return { current: e };
}
function q(e) {
  0 > Dn || (e.current = es[Dn], es[Dn] = null, Dn--);
}
function J(e, t) {
  Dn++, es[Dn] = e.current, e.current = t;
}
var Zt = {}, Ae = _t(Zt), Me = _t(!1), yn = Zt;
function ur(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Zt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var i = {}, l;
  for (l in n) i[l] = t[l];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
}
function Pe(e) {
  return e = e.childContextTypes, e != null;
}
function ol() {
  q(Me), q(Ae);
}
function sa(e, t, n) {
  if (Ae.current !== Zt) throw Error(E(168));
  J(Ae, t), J(Me, n);
}
function mf(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var i in r) if (!(i in t)) throw Error(E(108, Dh(e) || "Unknown", i));
  return ee({}, n, r);
}
function sl(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Zt, yn = Ae.current, J(Ae, e), J(Me, Me.current), !0;
}
function ua(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(E(169));
  n ? (e = mf(e, t, yn), r.__reactInternalMemoizedMergedChildContext = e, q(Me), q(Ae), J(Ae, e)) : q(Me), J(Me, n);
}
var vt = null, Rl = !1, oo = !1;
function gf(e) {
  vt === null ? vt = [e] : vt.push(e);
}
function bp(e) {
  Rl = !0, gf(e);
}
function $t() {
  if (!oo && vt !== null) {
    oo = !0;
    var e = 0, t = W;
    try {
      var n = vt;
      for (W = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      vt = null, Rl = !1;
    } catch (i) {
      throw vt !== null && (vt = vt.slice(e + 1)), zc(Ts, $t), i;
    } finally {
      W = t, oo = !1;
    }
  }
  return null;
}
var Ln = [], Tn = 0, ul = null, al = 0, Ve = [], Ke = 0, vn = null, At = 1, wt = "";
function nn(e, t) {
  Ln[Tn++] = al, Ln[Tn++] = ul, ul = e, al = t;
}
function yf(e, t, n) {
  Ve[Ke++] = At, Ve[Ke++] = wt, Ve[Ke++] = vn, vn = e;
  var r = At;
  e = wt;
  var i = 32 - nt(r) - 1;
  r &= ~(1 << i), n += 1;
  var l = 32 - nt(t) + i;
  if (30 < l) {
    var o = i - i % 5;
    l = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, At = 1 << 32 - nt(t) + i | n << i | r, wt = l + e;
  } else At = 1 << l | n << i | r, wt = e;
}
function Ks(e) {
  e.return !== null && (nn(e, 1), yf(e, 1, 0));
}
function Ws(e) {
  for (; e === ul; ) ul = Ln[--Tn], Ln[Tn] = null, al = Ln[--Tn], Ln[Tn] = null;
  for (; e === vn; ) vn = Ve[--Ke], Ve[Ke] = null, wt = Ve[--Ke], Ve[Ke] = null, At = Ve[--Ke], Ve[Ke] = null;
}
var Oe = null, Te = null, b = !1, tt = null;
function vf(e, t) {
  var n = We(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function aa(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Oe = e, Te = Vt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Oe = e, Te = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = vn !== null ? { id: At, overflow: wt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = We(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Oe = e, Te = null, !0) : !1;
    default:
      return !1;
  }
}
function ts(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function ns(e) {
  if (b) {
    var t = Te;
    if (t) {
      var n = t;
      if (!aa(e, t)) {
        if (ts(e)) throw Error(E(418));
        t = Vt(n.nextSibling);
        var r = Oe;
        t && aa(e, t) ? vf(r, n) : (e.flags = e.flags & -4097 | 2, b = !1, Oe = e);
      }
    } else {
      if (ts(e)) throw Error(E(418));
      e.flags = e.flags & -4097 | 2, b = !1, Oe = e;
    }
  }
}
function ca(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Oe = e;
}
function Fi(e) {
  if (e !== Oe) return !1;
  if (!b) return ca(e), b = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !bo(e.type, e.memoizedProps)), t && (t = Te)) {
    if (ts(e)) throw Af(), Error(E(418));
    for (; t; ) vf(e, t), t = Vt(t.nextSibling);
  }
  if (ca(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(E(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Te = Vt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Te = null;
    }
  } else Te = Oe ? Vt(e.stateNode.nextSibling) : null;
  return !0;
}
function Af() {
  for (var e = Te; e; ) e = Vt(e.nextSibling);
}
function ar() {
  Te = Oe = null, b = !1;
}
function Js(e) {
  tt === null ? tt = [e] : tt.push(e);
}
var _p = Bt.ReactCurrentBatchConfig;
function xr(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(E(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(E(147, e));
      var i = r, l = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === l ? t.ref : (t = function(o) {
        var s = i.refs;
        o === null ? delete s[l] : s[l] = o;
      }, t._stringRef = l, t);
    }
    if (typeof e != "string") throw Error(E(284));
    if (!n._owner) throw Error(E(290, e));
  }
  return e;
}
function Ni(e, t) {
  throw e = Object.prototype.toString.call(t), Error(E(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function fa(e) {
  var t = e._init;
  return t(e._payload);
}
function wf(e) {
  function t(f, a) {
    if (e) {
      var d = f.deletions;
      d === null ? (f.deletions = [a], f.flags |= 16) : d.push(a);
    }
  }
  function n(f, a) {
    if (!e) return null;
    for (; a !== null; ) t(f, a), a = a.sibling;
    return null;
  }
  function r(f, a) {
    for (f = /* @__PURE__ */ new Map(); a !== null; ) a.key !== null ? f.set(a.key, a) : f.set(a.index, a), a = a.sibling;
    return f;
  }
  function i(f, a) {
    return f = Xt(f, a), f.index = 0, f.sibling = null, f;
  }
  function l(f, a, d) {
    return f.index = d, e ? (d = f.alternate, d !== null ? (d = d.index, d < a ? (f.flags |= 2, a) : d) : (f.flags |= 2, a)) : (f.flags |= 1048576, a);
  }
  function o(f) {
    return e && f.alternate === null && (f.flags |= 2), f;
  }
  function s(f, a, d, y) {
    return a === null || a.tag !== 6 ? (a = po(d, f.mode, y), a.return = f, a) : (a = i(a, d), a.return = f, a);
  }
  function u(f, a, d, y) {
    var A = d.type;
    return A === Qn ? g(f, a, d.props.children, y, d.key) : a !== null && (a.elementType === A || typeof A == "object" && A !== null && A.$$typeof === Qt && fa(A) === a.type) ? (y = i(a, d.props), y.ref = xr(f, a, d), y.return = f, y) : (y = qi(d.type, d.key, d.props, null, f.mode, y), y.ref = xr(f, a, d), y.return = f, y);
  }
  function c(f, a, d, y) {
    return a === null || a.tag !== 4 || a.stateNode.containerInfo !== d.containerInfo || a.stateNode.implementation !== d.implementation ? (a = mo(d, f.mode, y), a.return = f, a) : (a = i(a, d.children || []), a.return = f, a);
  }
  function g(f, a, d, y, A) {
    return a === null || a.tag !== 7 ? (a = gn(d, f.mode, y, A), a.return = f, a) : (a = i(a, d), a.return = f, a);
  }
  function h(f, a, d) {
    if (typeof a == "string" && a !== "" || typeof a == "number") return a = po("" + a, f.mode, d), a.return = f, a;
    if (typeof a == "object" && a !== null) {
      switch (a.$$typeof) {
        case Si:
          return d = qi(a.type, a.key, a.props, null, f.mode, d), d.ref = xr(f, null, a), d.return = f, d;
        case In:
          return a = mo(a, f.mode, d), a.return = f, a;
        case Qt:
          var y = a._init;
          return h(f, y(a._payload), d);
      }
      if (Mr(a) || wr(a)) return a = gn(a, f.mode, d, null), a.return = f, a;
      Ni(f, a);
    }
    return null;
  }
  function m(f, a, d, y) {
    var A = a !== null ? a.key : null;
    if (typeof d == "string" && d !== "" || typeof d == "number") return A !== null ? null : s(f, a, "" + d, y);
    if (typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case Si:
          return d.key === A ? u(f, a, d, y) : null;
        case In:
          return d.key === A ? c(f, a, d, y) : null;
        case Qt:
          return A = d._init, m(
            f,
            a,
            A(d._payload),
            y
          );
      }
      if (Mr(d) || wr(d)) return A !== null ? null : g(f, a, d, y, null);
      Ni(f, d);
    }
    return null;
  }
  function v(f, a, d, y, A) {
    if (typeof y == "string" && y !== "" || typeof y == "number") return f = f.get(d) || null, s(a, f, "" + y, A);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Si:
          return f = f.get(y.key === null ? d : y.key) || null, u(a, f, y, A);
        case In:
          return f = f.get(y.key === null ? d : y.key) || null, c(a, f, y, A);
        case Qt:
          var B = y._init;
          return v(f, a, d, B(y._payload), A);
      }
      if (Mr(y) || wr(y)) return f = f.get(d) || null, g(a, f, y, A, null);
      Ni(a, y);
    }
    return null;
  }
  function w(f, a, d, y) {
    for (var A = null, B = null, x = a, k = a = 0, j = null; x !== null && k < d.length; k++) {
      x.index > k ? (j = x, x = null) : j = x.sibling;
      var L = m(f, x, d[k], y);
      if (L === null) {
        x === null && (x = j);
        break;
      }
      e && x && L.alternate === null && t(f, x), a = l(L, a, k), B === null ? A = L : B.sibling = L, B = L, x = j;
    }
    if (k === d.length) return n(f, x), b && nn(f, k), A;
    if (x === null) {
      for (; k < d.length; k++) x = h(f, d[k], y), x !== null && (a = l(x, a, k), B === null ? A = x : B.sibling = x, B = x);
      return b && nn(f, k), A;
    }
    for (x = r(f, x); k < d.length; k++) j = v(x, f, k, d[k], y), j !== null && (e && j.alternate !== null && x.delete(j.key === null ? k : j.key), a = l(j, a, k), B === null ? A = j : B.sibling = j, B = j);
    return e && x.forEach(function(M) {
      return t(f, M);
    }), b && nn(f, k), A;
  }
  function C(f, a, d, y) {
    var A = wr(d);
    if (typeof A != "function") throw Error(E(150));
    if (d = A.call(d), d == null) throw Error(E(151));
    for (var B = A = null, x = a, k = a = 0, j = null, L = d.next(); x !== null && !L.done; k++, L = d.next()) {
      x.index > k ? (j = x, x = null) : j = x.sibling;
      var M = m(f, x, L.value, y);
      if (M === null) {
        x === null && (x = j);
        break;
      }
      e && x && M.alternate === null && t(f, x), a = l(M, a, k), B === null ? A = M : B.sibling = M, B = M, x = j;
    }
    if (L.done) return n(
      f,
      x
    ), b && nn(f, k), A;
    if (x === null) {
      for (; !L.done; k++, L = d.next()) L = h(f, L.value, y), L !== null && (a = l(L, a, k), B === null ? A = L : B.sibling = L, B = L);
      return b && nn(f, k), A;
    }
    for (x = r(f, x); !L.done; k++, L = d.next()) L = v(x, f, k, L.value, y), L !== null && (e && L.alternate !== null && x.delete(L.key === null ? k : L.key), a = l(L, a, k), B === null ? A = L : B.sibling = L, B = L);
    return e && x.forEach(function(K) {
      return t(f, K);
    }), b && nn(f, k), A;
  }
  function P(f, a, d, y) {
    if (typeof d == "object" && d !== null && d.type === Qn && d.key === null && (d = d.props.children), typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case Si:
          e: {
            for (var A = d.key, B = a; B !== null; ) {
              if (B.key === A) {
                if (A = d.type, A === Qn) {
                  if (B.tag === 7) {
                    n(f, B.sibling), a = i(B, d.props.children), a.return = f, f = a;
                    break e;
                  }
                } else if (B.elementType === A || typeof A == "object" && A !== null && A.$$typeof === Qt && fa(A) === B.type) {
                  n(f, B.sibling), a = i(B, d.props), a.ref = xr(f, B, d), a.return = f, f = a;
                  break e;
                }
                n(f, B);
                break;
              } else t(f, B);
              B = B.sibling;
            }
            d.type === Qn ? (a = gn(d.props.children, f.mode, y, d.key), a.return = f, f = a) : (y = qi(d.type, d.key, d.props, null, f.mode, y), y.ref = xr(f, a, d), y.return = f, f = y);
          }
          return o(f);
        case In:
          e: {
            for (B = d.key; a !== null; ) {
              if (a.key === B) if (a.tag === 4 && a.stateNode.containerInfo === d.containerInfo && a.stateNode.implementation === d.implementation) {
                n(f, a.sibling), a = i(a, d.children || []), a.return = f, f = a;
                break e;
              } else {
                n(f, a);
                break;
              }
              else t(f, a);
              a = a.sibling;
            }
            a = mo(d, f.mode, y), a.return = f, f = a;
          }
          return o(f);
        case Qt:
          return B = d._init, P(f, a, B(d._payload), y);
      }
      if (Mr(d)) return w(f, a, d, y);
      if (wr(d)) return C(f, a, d, y);
      Ni(f, d);
    }
    return typeof d == "string" && d !== "" || typeof d == "number" ? (d = "" + d, a !== null && a.tag === 6 ? (n(f, a.sibling), a = i(a, d), a.return = f, f = a) : (n(f, a), a = po(d, f.mode, y), a.return = f, f = a), o(f)) : n(f, a);
  }
  return P;
}
var cr = wf(!0), kf = wf(!1), cl = _t(null), fl = null, On = null, Xs = null;
function qs() {
  Xs = On = fl = null;
}
function Zs(e) {
  var t = cl.current;
  q(cl), e._currentValue = t;
}
function rs(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Kn(e, t) {
  fl = e, Xs = On = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (Qe = !0), e.firstContext = null);
}
function Xe(e) {
  var t = e._currentValue;
  if (Xs !== e) if (e = { context: e, memoizedValue: t, next: null }, On === null) {
    if (fl === null) throw Error(E(308));
    On = e, fl.dependencies = { lanes: 0, firstContext: e };
  } else On = On.next = e;
  return t;
}
var on = null;
function bs(e) {
  on === null ? on = [e] : on.push(e);
}
function Sf(e, t, n, r) {
  var i = t.interleaved;
  return i === null ? (n.next = n, bs(t)) : (n.next = i.next, i.next = n), t.interleaved = n, Et(e, r);
}
function Et(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var Mt = !1;
function _s(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function Cf(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function kt(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function Kt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, Y & 2) {
    var i = r.pending;
    return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, Et(e, n);
  }
  return i = r.interleaved, i === null ? (t.next = t, bs(r)) : (t.next = i.next, i.next = t), r.interleaved = t, Et(e, n);
}
function Yi(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Os(e, n);
  }
}
function da(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var i = null, l = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var o = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        l === null ? i = l = o : l = l.next = o, n = n.next;
      } while (n !== null);
      l === null ? i = l = t : l = l.next = t;
    } else i = l = t;
    n = { baseState: r.baseState, firstBaseUpdate: i, lastBaseUpdate: l, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function dl(e, t, n, r) {
  var i = e.updateQueue;
  Mt = !1;
  var l = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
  if (s !== null) {
    i.shared.pending = null;
    var u = s, c = u.next;
    u.next = null, o === null ? l = c : o.next = c, o = u;
    var g = e.alternate;
    g !== null && (g = g.updateQueue, s = g.lastBaseUpdate, s !== o && (s === null ? g.firstBaseUpdate = c : s.next = c, g.lastBaseUpdate = u));
  }
  if (l !== null) {
    var h = i.baseState;
    o = 0, g = c = u = null, s = l;
    do {
      var m = s.lane, v = s.eventTime;
      if ((r & m) === m) {
        g !== null && (g = g.next = {
          eventTime: v,
          lane: 0,
          tag: s.tag,
          payload: s.payload,
          callback: s.callback,
          next: null
        });
        e: {
          var w = e, C = s;
          switch (m = t, v = n, C.tag) {
            case 1:
              if (w = C.payload, typeof w == "function") {
                h = w.call(v, h, m);
                break e;
              }
              h = w;
              break e;
            case 3:
              w.flags = w.flags & -65537 | 128;
            case 0:
              if (w = C.payload, m = typeof w == "function" ? w.call(v, h, m) : w, m == null) break e;
              h = ee({}, h, m);
              break e;
            case 2:
              Mt = !0;
          }
        }
        s.callback !== null && s.lane !== 0 && (e.flags |= 64, m = i.effects, m === null ? i.effects = [s] : m.push(s));
      } else v = { eventTime: v, lane: m, tag: s.tag, payload: s.payload, callback: s.callback, next: null }, g === null ? (c = g = v, u = h) : g = g.next = v, o |= m;
      if (s = s.next, s === null) {
        if (s = i.shared.pending, s === null) break;
        m = s, s = m.next, m.next = null, i.lastBaseUpdate = m, i.shared.pending = null;
      }
    } while (!0);
    if (g === null && (u = h), i.baseState = u, i.firstBaseUpdate = c, i.lastBaseUpdate = g, t = i.shared.interleaved, t !== null) {
      i = t;
      do
        o |= i.lane, i = i.next;
      while (i !== t);
    } else l === null && (i.shared.lanes = 0);
    wn |= o, e.lanes = o, e.memoizedState = h;
  }
}
function ha(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], i = r.callback;
    if (i !== null) {
      if (r.callback = null, r = n, typeof i != "function") throw Error(E(191, i));
      i.call(r);
    }
  }
}
var gi = {}, mt = _t(gi), ti = _t(gi), ni = _t(gi);
function sn(e) {
  if (e === gi) throw Error(E(174));
  return e;
}
function $s(e, t) {
  switch (J(ni, t), J(ti, e), J(mt, gi), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Oo(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Oo(t, e);
  }
  q(mt), J(mt, t);
}
function fr() {
  q(mt), q(ti), q(ni);
}
function Ef(e) {
  sn(ni.current);
  var t = sn(mt.current), n = Oo(t, e.type);
  t !== n && (J(ti, e), J(mt, n));
}
function eu(e) {
  ti.current === e && (q(mt), q(ti));
}
var _ = _t(0);
function hl(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var so = [];
function tu() {
  for (var e = 0; e < so.length; e++) so[e]._workInProgressVersionPrimary = null;
  so.length = 0;
}
var Vi = Bt.ReactCurrentDispatcher, uo = Bt.ReactCurrentBatchConfig, An = 0, $ = null, oe = null, ue = null, pl = !1, jr = !1, ri = 0, $p = 0;
function me() {
  throw Error(E(321));
}
function nu(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!it(e[n], t[n])) return !1;
  return !0;
}
function ru(e, t, n, r, i, l) {
  if (An = l, $ = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Vi.current = e === null || e.memoizedState === null ? rm : im, e = n(r, i), jr) {
    l = 0;
    do {
      if (jr = !1, ri = 0, 25 <= l) throw Error(E(301));
      l += 1, ue = oe = null, t.updateQueue = null, Vi.current = lm, e = n(r, i);
    } while (jr);
  }
  if (Vi.current = ml, t = oe !== null && oe.next !== null, An = 0, ue = oe = $ = null, pl = !1, t) throw Error(E(300));
  return e;
}
function iu() {
  var e = ri !== 0;
  return ri = 0, e;
}
function ut() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ue === null ? $.memoizedState = ue = e : ue = ue.next = e, ue;
}
function qe() {
  if (oe === null) {
    var e = $.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = oe.next;
  var t = ue === null ? $.memoizedState : ue.next;
  if (t !== null) ue = t, oe = e;
  else {
    if (e === null) throw Error(E(310));
    oe = e, e = { memoizedState: oe.memoizedState, baseState: oe.baseState, baseQueue: oe.baseQueue, queue: oe.queue, next: null }, ue === null ? $.memoizedState = ue = e : ue = ue.next = e;
  }
  return ue;
}
function ii(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ao(e) {
  var t = qe(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = oe, i = r.baseQueue, l = n.pending;
  if (l !== null) {
    if (i !== null) {
      var o = i.next;
      i.next = l.next, l.next = o;
    }
    r.baseQueue = i = l, n.pending = null;
  }
  if (i !== null) {
    l = i.next, r = r.baseState;
    var s = o = null, u = null, c = l;
    do {
      var g = c.lane;
      if ((An & g) === g) u !== null && (u = u.next = { lane: 0, action: c.action, hasEagerState: c.hasEagerState, eagerState: c.eagerState, next: null }), r = c.hasEagerState ? c.eagerState : e(r, c.action);
      else {
        var h = {
          lane: g,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null
        };
        u === null ? (s = u = h, o = r) : u = u.next = h, $.lanes |= g, wn |= g;
      }
      c = c.next;
    } while (c !== null && c !== l);
    u === null ? o = r : u.next = s, it(r, t.memoizedState) || (Qe = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    i = e;
    do
      l = i.lane, $.lanes |= l, wn |= l, i = i.next;
    while (i !== e);
  } else i === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function co(e) {
  var t = qe(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, i = n.pending, l = t.memoizedState;
  if (i !== null) {
    n.pending = null;
    var o = i = i.next;
    do
      l = e(l, o.action), o = o.next;
    while (o !== i);
    it(l, t.memoizedState) || (Qe = !0), t.memoizedState = l, t.baseQueue === null && (t.baseState = l), n.lastRenderedState = l;
  }
  return [l, r];
}
function xf() {
}
function Bf(e, t) {
  var n = $, r = qe(), i = t(), l = !it(r.memoizedState, i);
  if (l && (r.memoizedState = i, Qe = !0), r = r.queue, lu(Qf.bind(null, n, r, e), [e]), r.getSnapshot !== t || l || ue !== null && ue.memoizedState.tag & 1) {
    if (n.flags |= 2048, li(9, If.bind(null, n, r, i, t), void 0, null), ae === null) throw Error(E(349));
    An & 30 || Rf(n, t, i);
  }
  return i;
}
function Rf(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = $.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, $.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function If(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Mf(t) && Pf(e);
}
function Qf(e, t, n) {
  return n(function() {
    Mf(t) && Pf(e);
  });
}
function Mf(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !it(e, n);
  } catch {
    return !0;
  }
}
function Pf(e) {
  var t = Et(e, 1);
  t !== null && rt(t, e, 1, -1);
}
function pa(e) {
  var t = ut();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ii, lastRenderedState: e }, t.queue = e, e = e.dispatch = nm.bind(null, $, e), [t.memoizedState, e];
}
function li(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = $.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, $.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Ff() {
  return qe().memoizedState;
}
function Ki(e, t, n, r) {
  var i = ut();
  $.flags |= e, i.memoizedState = li(1 | t, n, void 0, r === void 0 ? null : r);
}
function Il(e, t, n, r) {
  var i = qe();
  r = r === void 0 ? null : r;
  var l = void 0;
  if (oe !== null) {
    var o = oe.memoizedState;
    if (l = o.destroy, r !== null && nu(r, o.deps)) {
      i.memoizedState = li(t, n, l, r);
      return;
    }
  }
  $.flags |= e, i.memoizedState = li(1 | t, n, l, r);
}
function ma(e, t) {
  return Ki(8390656, 8, e, t);
}
function lu(e, t) {
  return Il(2048, 8, e, t);
}
function Nf(e, t) {
  return Il(4, 2, e, t);
}
function Df(e, t) {
  return Il(4, 4, e, t);
}
function Lf(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Tf(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Il(4, 4, Lf.bind(null, t, e), n);
}
function ou() {
}
function Of(e, t) {
  var n = qe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && nu(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function jf(e, t) {
  var n = qe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && nu(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Uf(e, t, n) {
  return An & 21 ? (it(n, t) || (n = Yc(), $.lanes |= n, wn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Qe = !0), e.memoizedState = n);
}
function em(e, t) {
  var n = W;
  W = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = uo.transition;
  uo.transition = {};
  try {
    e(!1), t();
  } finally {
    W = n, uo.transition = r;
  }
}
function zf() {
  return qe().memoizedState;
}
function tm(e, t, n) {
  var r = Jt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Hf(e)) Gf(t, n);
  else if (n = Sf(e, t, n, r), n !== null) {
    var i = Ce();
    rt(n, e, r, i), Yf(n, t, r);
  }
}
function nm(e, t, n) {
  var r = Jt(e), i = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Hf(e)) Gf(t, i);
  else {
    var l = e.alternate;
    if (e.lanes === 0 && (l === null || l.lanes === 0) && (l = t.lastRenderedReducer, l !== null)) try {
      var o = t.lastRenderedState, s = l(o, n);
      if (i.hasEagerState = !0, i.eagerState = s, it(s, o)) {
        var u = t.interleaved;
        u === null ? (i.next = i, bs(t)) : (i.next = u.next, u.next = i), t.interleaved = i;
        return;
      }
    } catch {
    } finally {
    }
    n = Sf(e, t, i, r), n !== null && (i = Ce(), rt(n, e, r, i), Yf(n, t, r));
  }
}
function Hf(e) {
  var t = e.alternate;
  return e === $ || t !== null && t === $;
}
function Gf(e, t) {
  jr = pl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Yf(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Os(e, n);
  }
}
var ml = { readContext: Xe, useCallback: me, useContext: me, useEffect: me, useImperativeHandle: me, useInsertionEffect: me, useLayoutEffect: me, useMemo: me, useReducer: me, useRef: me, useState: me, useDebugValue: me, useDeferredValue: me, useTransition: me, useMutableSource: me, useSyncExternalStore: me, useId: me, unstable_isNewReconciler: !1 }, rm = { readContext: Xe, useCallback: function(e, t) {
  return ut().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Xe, useEffect: ma, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ki(
    4194308,
    4,
    Lf.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Ki(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Ki(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = ut();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = ut();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = tm.bind(null, $, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = ut();
  return e = { current: e }, t.memoizedState = e;
}, useState: pa, useDebugValue: ou, useDeferredValue: function(e) {
  return ut().memoizedState = e;
}, useTransition: function() {
  var e = pa(!1), t = e[0];
  return e = em.bind(null, e[1]), ut().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = $, i = ut();
  if (b) {
    if (n === void 0) throw Error(E(407));
    n = n();
  } else {
    if (n = t(), ae === null) throw Error(E(349));
    An & 30 || Rf(r, t, n);
  }
  i.memoizedState = n;
  var l = { value: n, getSnapshot: t };
  return i.queue = l, ma(Qf.bind(
    null,
    r,
    l,
    e
  ), [e]), r.flags |= 2048, li(9, If.bind(null, r, l, n, t), void 0, null), n;
}, useId: function() {
  var e = ut(), t = ae.identifierPrefix;
  if (b) {
    var n = wt, r = At;
    n = (r & ~(1 << 32 - nt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ri++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = $p++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, im = {
  readContext: Xe,
  useCallback: Of,
  useContext: Xe,
  useEffect: lu,
  useImperativeHandle: Tf,
  useInsertionEffect: Nf,
  useLayoutEffect: Df,
  useMemo: jf,
  useReducer: ao,
  useRef: Ff,
  useState: function() {
    return ao(ii);
  },
  useDebugValue: ou,
  useDeferredValue: function(e) {
    var t = qe();
    return Uf(t, oe.memoizedState, e);
  },
  useTransition: function() {
    var e = ao(ii)[0], t = qe().memoizedState;
    return [e, t];
  },
  useMutableSource: xf,
  useSyncExternalStore: Bf,
  useId: zf,
  unstable_isNewReconciler: !1
}, lm = { readContext: Xe, useCallback: Of, useContext: Xe, useEffect: lu, useImperativeHandle: Tf, useInsertionEffect: Nf, useLayoutEffect: Df, useMemo: jf, useReducer: co, useRef: Ff, useState: function() {
  return co(ii);
}, useDebugValue: ou, useDeferredValue: function(e) {
  var t = qe();
  return oe === null ? t.memoizedState = e : Uf(t, oe.memoizedState, e);
}, useTransition: function() {
  var e = co(ii)[0], t = qe().memoizedState;
  return [e, t];
}, useMutableSource: xf, useSyncExternalStore: Bf, useId: zf, unstable_isNewReconciler: !1 };
function be(e, t) {
  if (e && e.defaultProps) {
    t = ee({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function is(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : ee({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Ql = { isMounted: function(e) {
  return (e = e._reactInternals) ? Cn(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = Ce(), i = Jt(e), l = kt(r, i);
  l.payload = t, n != null && (l.callback = n), t = Kt(e, l, i), t !== null && (rt(t, e, i, r), Yi(t, e, i));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = Ce(), i = Jt(e), l = kt(r, i);
  l.tag = 1, l.payload = t, n != null && (l.callback = n), t = Kt(e, l, i), t !== null && (rt(t, e, i, r), Yi(t, e, i));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = Ce(), r = Jt(e), i = kt(n, r);
  i.tag = 2, t != null && (i.callback = t), t = Kt(e, i, r), t !== null && (rt(t, e, r, n), Yi(t, e, r));
} };
function ga(e, t, n, r, i, l, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, l, o) : t.prototype && t.prototype.isPureReactComponent ? !br(n, r) || !br(i, l) : !0;
}
function Vf(e, t, n) {
  var r = !1, i = Zt, l = t.contextType;
  return typeof l == "object" && l !== null ? l = Xe(l) : (i = Pe(t) ? yn : Ae.current, r = t.contextTypes, l = (r = r != null) ? ur(e, i) : Zt), t = new t(n, l), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Ql, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = l), t;
}
function ya(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ql.enqueueReplaceState(t, t.state, null);
}
function ls(e, t, n, r) {
  var i = e.stateNode;
  i.props = n, i.state = e.memoizedState, i.refs = {}, _s(e);
  var l = t.contextType;
  typeof l == "object" && l !== null ? i.context = Xe(l) : (l = Pe(t) ? yn : Ae.current, i.context = ur(e, l)), i.state = e.memoizedState, l = t.getDerivedStateFromProps, typeof l == "function" && (is(e, t, l, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && Ql.enqueueReplaceState(i, i.state, null), dl(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
}
function dr(e, t) {
  try {
    var n = "", r = t;
    do
      n += Nh(r), r = r.return;
    while (r);
    var i = n;
  } catch (l) {
    i = `
Error generating stack: ` + l.message + `
` + l.stack;
  }
  return { value: e, source: t, stack: i, digest: null };
}
function fo(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function os(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var om = typeof WeakMap == "function" ? WeakMap : Map;
function Kf(e, t, n) {
  n = kt(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    yl || (yl = !0, gs = r), os(e, t);
  }, n;
}
function Wf(e, t, n) {
  n = kt(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var i = t.value;
    n.payload = function() {
      return r(i);
    }, n.callback = function() {
      os(e, t);
    };
  }
  var l = e.stateNode;
  return l !== null && typeof l.componentDidCatch == "function" && (n.callback = function() {
    os(e, t), typeof r != "function" && (Wt === null ? Wt = /* @__PURE__ */ new Set([this]) : Wt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function va(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new om();
    var i = /* @__PURE__ */ new Set();
    r.set(t, i);
  } else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
  i.has(n) || (i.add(n), e = wm.bind(null, e, t, n), t.then(e, e));
}
function Aa(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function wa(e, t, n, r, i) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = kt(-1, 1), t.tag = 2, Kt(n, t, 1))), n.lanes |= 1), e);
}
var sm = Bt.ReactCurrentOwner, Qe = !1;
function Se(e, t, n, r) {
  t.child = e === null ? kf(t, null, n, r) : cr(t, e.child, n, r);
}
function ka(e, t, n, r, i) {
  n = n.render;
  var l = t.ref;
  return Kn(t, i), r = ru(e, t, n, r, l, i), n = iu(), e !== null && !Qe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, xt(e, t, i)) : (b && n && Ks(t), t.flags |= 1, Se(e, t, r, i), t.child);
}
function Sa(e, t, n, r, i) {
  if (e === null) {
    var l = n.type;
    return typeof l == "function" && !pu(l) && l.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = l, Jf(e, t, l, r, i)) : (e = qi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (l = e.child, !(e.lanes & i)) {
    var o = l.memoizedProps;
    if (n = n.compare, n = n !== null ? n : br, n(o, r) && e.ref === t.ref) return xt(e, t, i);
  }
  return t.flags |= 1, e = Xt(l, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Jf(e, t, n, r, i) {
  if (e !== null) {
    var l = e.memoizedProps;
    if (br(l, r) && e.ref === t.ref) if (Qe = !1, t.pendingProps = r = l, (e.lanes & i) !== 0) e.flags & 131072 && (Qe = !0);
    else return t.lanes = e.lanes, xt(e, t, i);
  }
  return ss(e, t, n, r, i);
}
function Xf(e, t, n) {
  var r = t.pendingProps, i = r.children, l = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, J(Un, Le), Le |= n;
  else {
    if (!(n & 1073741824)) return e = l !== null ? l.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, J(Un, Le), Le |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = l !== null ? l.baseLanes : n, J(Un, Le), Le |= r;
  }
  else l !== null ? (r = l.baseLanes | n, t.memoizedState = null) : r = n, J(Un, Le), Le |= r;
  return Se(e, t, i, n), t.child;
}
function qf(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function ss(e, t, n, r, i) {
  var l = Pe(n) ? yn : Ae.current;
  return l = ur(t, l), Kn(t, i), n = ru(e, t, n, r, l, i), r = iu(), e !== null && !Qe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, xt(e, t, i)) : (b && r && Ks(t), t.flags |= 1, Se(e, t, n, i), t.child);
}
function Ca(e, t, n, r, i) {
  if (Pe(n)) {
    var l = !0;
    sl(t);
  } else l = !1;
  if (Kn(t, i), t.stateNode === null) Wi(e, t), Vf(t, n, r), ls(t, n, r, i), r = !0;
  else if (e === null) {
    var o = t.stateNode, s = t.memoizedProps;
    o.props = s;
    var u = o.context, c = n.contextType;
    typeof c == "object" && c !== null ? c = Xe(c) : (c = Pe(n) ? yn : Ae.current, c = ur(t, c));
    var g = n.getDerivedStateFromProps, h = typeof g == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    h || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || u !== c) && ya(t, o, r, c), Mt = !1;
    var m = t.memoizedState;
    o.state = m, dl(t, r, o, i), u = t.memoizedState, s !== r || m !== u || Me.current || Mt ? (typeof g == "function" && (is(t, n, g, r), u = t.memoizedState), (s = Mt || ga(t, n, s, r, m, u, c)) ? (h || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), o.props = r, o.state = u, o.context = c, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, Cf(e, t), s = t.memoizedProps, c = t.type === t.elementType ? s : be(t.type, s), o.props = c, h = t.pendingProps, m = o.context, u = n.contextType, typeof u == "object" && u !== null ? u = Xe(u) : (u = Pe(n) ? yn : Ae.current, u = ur(t, u));
    var v = n.getDerivedStateFromProps;
    (g = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== h || m !== u) && ya(t, o, r, u), Mt = !1, m = t.memoizedState, o.state = m, dl(t, r, o, i);
    var w = t.memoizedState;
    s !== h || m !== w || Me.current || Mt ? (typeof v == "function" && (is(t, n, v, r), w = t.memoizedState), (c = Mt || ga(t, n, c, r, m, w, u) || !1) ? (g || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, w, u), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, w, u)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = w), o.props = r, o.state = w, o.context = u, r = c) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return us(e, t, n, r, l, i);
}
function us(e, t, n, r, i, l) {
  qf(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return i && ua(t, n, !1), xt(e, t, l);
  r = t.stateNode, sm.current = t;
  var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = cr(t, e.child, null, l), t.child = cr(t, null, s, l)) : Se(e, t, s, l), t.memoizedState = r.state, i && ua(t, n, !0), t.child;
}
function Zf(e) {
  var t = e.stateNode;
  t.pendingContext ? sa(e, t.pendingContext, t.pendingContext !== t.context) : t.context && sa(e, t.context, !1), $s(e, t.containerInfo);
}
function Ea(e, t, n, r, i) {
  return ar(), Js(i), t.flags |= 256, Se(e, t, n, r), t.child;
}
var as = { dehydrated: null, treeContext: null, retryLane: 0 };
function cs(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function bf(e, t, n) {
  var r = t.pendingProps, i = _.current, l = !1, o = (t.flags & 128) !== 0, s;
  if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : (i & 2) !== 0), s ? (l = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), J(_, i & 1), e === null)
    return ns(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, l ? (r = t.mode, l = t.child, o = { mode: "hidden", children: o }, !(r & 1) && l !== null ? (l.childLanes = 0, l.pendingProps = o) : l = Fl(o, r, 0, null), e = gn(e, r, n, null), l.return = t, e.return = t, l.sibling = e, t.child = l, t.child.memoizedState = cs(n), t.memoizedState = as, e) : su(t, o));
  if (i = e.memoizedState, i !== null && (s = i.dehydrated, s !== null)) return um(e, t, o, r, s, i, n);
  if (l) {
    l = r.fallback, o = t.mode, i = e.child, s = i.sibling;
    var u = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = Xt(i, u), r.subtreeFlags = i.subtreeFlags & 14680064), s !== null ? l = Xt(s, l) : (l = gn(l, o, n, null), l.flags |= 2), l.return = t, r.return = t, r.sibling = l, t.child = r, r = l, l = t.child, o = e.child.memoizedState, o = o === null ? cs(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, l.memoizedState = o, l.childLanes = e.childLanes & ~n, t.memoizedState = as, r;
  }
  return l = e.child, e = l.sibling, r = Xt(l, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function su(e, t) {
  return t = Fl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Di(e, t, n, r) {
  return r !== null && Js(r), cr(t, e.child, null, n), e = su(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function um(e, t, n, r, i, l, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = fo(Error(E(422))), Di(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (l = r.fallback, i = t.mode, r = Fl({ mode: "visible", children: r.children }, i, 0, null), l = gn(l, i, o, null), l.flags |= 2, r.return = t, l.return = t, r.sibling = l, t.child = r, t.mode & 1 && cr(t, e.child, null, o), t.child.memoizedState = cs(o), t.memoizedState = as, l);
  if (!(t.mode & 1)) return Di(e, t, o, null);
  if (i.data === "$!") {
    if (r = i.nextSibling && i.nextSibling.dataset, r) var s = r.dgst;
    return r = s, l = Error(E(419)), r = fo(l, r, void 0), Di(e, t, o, r);
  }
  if (s = (o & e.childLanes) !== 0, Qe || s) {
    if (r = ae, r !== null) {
      switch (o & -o) {
        case 4:
          i = 2;
          break;
        case 16:
          i = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          i = 32;
          break;
        case 536870912:
          i = 268435456;
          break;
        default:
          i = 0;
      }
      i = i & (r.suspendedLanes | o) ? 0 : i, i !== 0 && i !== l.retryLane && (l.retryLane = i, Et(e, i), rt(r, e, i, -1));
    }
    return hu(), r = fo(Error(E(421))), Di(e, t, o, r);
  }
  return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = km.bind(null, e), i._reactRetry = t, null) : (e = l.treeContext, Te = Vt(i.nextSibling), Oe = t, b = !0, tt = null, e !== null && (Ve[Ke++] = At, Ve[Ke++] = wt, Ve[Ke++] = vn, At = e.id, wt = e.overflow, vn = t), t = su(t, r.children), t.flags |= 4096, t);
}
function xa(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), rs(e.return, t, n);
}
function ho(e, t, n, r, i) {
  var l = e.memoizedState;
  l === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: i } : (l.isBackwards = t, l.rendering = null, l.renderingStartTime = 0, l.last = r, l.tail = n, l.tailMode = i);
}
function _f(e, t, n) {
  var r = t.pendingProps, i = r.revealOrder, l = r.tail;
  if (Se(e, t, r.children, n), r = _.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && xa(e, n, t);
      else if (e.tag === 19) xa(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (J(_, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (i) {
    case "forwards":
      for (n = t.child, i = null; n !== null; ) e = n.alternate, e !== null && hl(e) === null && (i = n), n = n.sibling;
      n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), ho(t, !1, i, n, l);
      break;
    case "backwards":
      for (n = null, i = t.child, t.child = null; i !== null; ) {
        if (e = i.alternate, e !== null && hl(e) === null) {
          t.child = i;
          break;
        }
        e = i.sibling, i.sibling = n, n = i, i = e;
      }
      ho(t, !0, n, null, l);
      break;
    case "together":
      ho(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Wi(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function xt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), wn |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(E(153));
  if (t.child !== null) {
    for (e = t.child, n = Xt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Xt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function am(e, t, n) {
  switch (t.tag) {
    case 3:
      Zf(t), ar();
      break;
    case 5:
      Ef(t);
      break;
    case 1:
      Pe(t.type) && sl(t);
      break;
    case 4:
      $s(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, i = t.memoizedProps.value;
      J(cl, r._currentValue), r._currentValue = i;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (J(_, _.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? bf(e, t, n) : (J(_, _.current & 1), e = xt(e, t, n), e !== null ? e.sibling : null);
      J(_, _.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return _f(e, t, n);
        t.flags |= 128;
      }
      if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), J(_, _.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Xf(e, t, n);
  }
  return xt(e, t, n);
}
var $f, fs, ed, td;
$f = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
fs = function() {
};
ed = function(e, t, n, r) {
  var i = e.memoizedProps;
  if (i !== r) {
    e = t.stateNode, sn(mt.current);
    var l = null;
    switch (n) {
      case "input":
        i = No(e, i), r = No(e, r), l = [];
        break;
      case "select":
        i = ee({}, i, { value: void 0 }), r = ee({}, r, { value: void 0 }), l = [];
        break;
      case "textarea":
        i = To(e, i), r = To(e, r), l = [];
        break;
      default:
        typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = ll);
    }
    jo(n, r);
    var o;
    n = null;
    for (c in i) if (!r.hasOwnProperty(c) && i.hasOwnProperty(c) && i[c] != null) if (c === "style") {
      var s = i[c];
      for (o in s) s.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else c !== "dangerouslySetInnerHTML" && c !== "children" && c !== "suppressContentEditableWarning" && c !== "suppressHydrationWarning" && c !== "autoFocus" && (Vr.hasOwnProperty(c) ? l || (l = []) : (l = l || []).push(c, null));
    for (c in r) {
      var u = r[c];
      if (s = i != null ? i[c] : void 0, r.hasOwnProperty(c) && u !== s && (u != null || s != null)) if (c === "style") if (s) {
        for (o in s) !s.hasOwnProperty(o) || u && u.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in u) u.hasOwnProperty(o) && s[o] !== u[o] && (n || (n = {}), n[o] = u[o]);
      } else n || (l || (l = []), l.push(
        c,
        n
      )), n = u;
      else c === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, s = s ? s.__html : void 0, u != null && s !== u && (l = l || []).push(c, u)) : c === "children" ? typeof u != "string" && typeof u != "number" || (l = l || []).push(c, "" + u) : c !== "suppressContentEditableWarning" && c !== "suppressHydrationWarning" && (Vr.hasOwnProperty(c) ? (u != null && c === "onScroll" && X("scroll", e), l || s === u || (l = [])) : (l = l || []).push(c, u));
    }
    n && (l = l || []).push("style", n);
    var c = l;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
td = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Br(e, t) {
  if (!b) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function ge(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
  else for (i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function cm(e, t, n) {
  var r = t.pendingProps;
  switch (Ws(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return ge(t), null;
    case 1:
      return Pe(t.type) && ol(), ge(t), null;
    case 3:
      return r = t.stateNode, fr(), q(Me), q(Ae), tu(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Fi(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, tt !== null && (As(tt), tt = null))), fs(e, t), ge(t), null;
    case 5:
      eu(t);
      var i = sn(ni.current);
      if (n = t.type, e !== null && t.stateNode != null) ed(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(E(166));
          return ge(t), null;
        }
        if (e = sn(mt.current), Fi(t)) {
          r = t.stateNode, n = t.type;
          var l = t.memoizedProps;
          switch (r[ht] = t, r[ei] = l, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              X("cancel", r), X("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              X("load", r);
              break;
            case "video":
            case "audio":
              for (i = 0; i < Fr.length; i++) X(Fr[i], r);
              break;
            case "source":
              X("error", r);
              break;
            case "img":
            case "image":
            case "link":
              X(
                "error",
                r
              ), X("load", r);
              break;
            case "details":
              X("toggle", r);
              break;
            case "input":
              Du(r, l), X("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!l.multiple }, X("invalid", r);
              break;
            case "textarea":
              Tu(r, l), X("invalid", r);
          }
          jo(n, l), i = null;
          for (var o in l) if (l.hasOwnProperty(o)) {
            var s = l[o];
            o === "children" ? typeof s == "string" ? r.textContent !== s && (l.suppressHydrationWarning !== !0 && Pi(r.textContent, s, e), i = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (l.suppressHydrationWarning !== !0 && Pi(
              r.textContent,
              s,
              e
            ), i = ["children", "" + s]) : Vr.hasOwnProperty(o) && s != null && o === "onScroll" && X("scroll", r);
          }
          switch (n) {
            case "input":
              Ci(r), Lu(r, l, !0);
              break;
            case "textarea":
              Ci(r), Ou(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof l.onClick == "function" && (r.onclick = ll);
          }
          r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Ic(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[ht] = t, e[ei] = r, $f(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = Uo(n, r), n) {
              case "dialog":
                X("cancel", e), X("close", e), i = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                X("load", e), i = r;
                break;
              case "video":
              case "audio":
                for (i = 0; i < Fr.length; i++) X(Fr[i], e);
                i = r;
                break;
              case "source":
                X("error", e), i = r;
                break;
              case "img":
              case "image":
              case "link":
                X(
                  "error",
                  e
                ), X("load", e), i = r;
                break;
              case "details":
                X("toggle", e), i = r;
                break;
              case "input":
                Du(e, r), i = No(e, r), X("invalid", e);
                break;
              case "option":
                i = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, i = ee({}, r, { value: void 0 }), X("invalid", e);
                break;
              case "textarea":
                Tu(e, r), i = To(e, r), X("invalid", e);
                break;
              default:
                i = r;
            }
            jo(n, i), s = i;
            for (l in s) if (s.hasOwnProperty(l)) {
              var u = s[l];
              l === "style" ? Pc(e, u) : l === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Qc(e, u)) : l === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && Kr(e, u) : typeof u == "number" && Kr(e, "" + u) : l !== "suppressContentEditableWarning" && l !== "suppressHydrationWarning" && l !== "autoFocus" && (Vr.hasOwnProperty(l) ? u != null && l === "onScroll" && X("scroll", e) : u != null && Ps(e, l, u, o));
            }
            switch (n) {
              case "input":
                Ci(e), Lu(e, r, !1);
                break;
              case "textarea":
                Ci(e), Ou(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + qt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, l = r.value, l != null ? Hn(e, !!r.multiple, l, !1) : r.defaultValue != null && Hn(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof i.onClick == "function" && (e.onclick = ll);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return ge(t), null;
    case 6:
      if (e && t.stateNode != null) td(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(E(166));
        if (n = sn(ni.current), sn(mt.current), Fi(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[ht] = t, (l = r.nodeValue !== n) && (e = Oe, e !== null)) switch (e.tag) {
            case 3:
              Pi(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && Pi(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          l && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[ht] = t, t.stateNode = r;
      }
      return ge(t), null;
    case 13:
      if (q(_), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (b && Te !== null && t.mode & 1 && !(t.flags & 128)) Af(), ar(), t.flags |= 98560, l = !1;
        else if (l = Fi(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!l) throw Error(E(318));
            if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(E(317));
            l[ht] = t;
          } else ar(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          ge(t), l = !1;
        } else tt !== null && (As(tt), tt = null), l = !0;
        if (!l) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || _.current & 1 ? se === 0 && (se = 3) : hu())), t.updateQueue !== null && (t.flags |= 4), ge(t), null);
    case 4:
      return fr(), fs(e, t), e === null && _r(t.stateNode.containerInfo), ge(t), null;
    case 10:
      return Zs(t.type._context), ge(t), null;
    case 17:
      return Pe(t.type) && ol(), ge(t), null;
    case 19:
      if (q(_), l = t.memoizedState, l === null) return ge(t), null;
      if (r = (t.flags & 128) !== 0, o = l.rendering, o === null) if (r) Br(l, !1);
      else {
        if (se !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = hl(e), o !== null) {
            for (t.flags |= 128, Br(l, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) l = n, e = r, l.flags &= 14680066, o = l.alternate, o === null ? (l.childLanes = 0, l.lanes = e, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = o.childLanes, l.lanes = o.lanes, l.child = o.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = o.memoizedProps, l.memoizedState = o.memoizedState, l.updateQueue = o.updateQueue, l.type = o.type, e = o.dependencies, l.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return J(_, _.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        l.tail !== null && ie() > hr && (t.flags |= 128, r = !0, Br(l, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = hl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Br(l, !0), l.tail === null && l.tailMode === "hidden" && !o.alternate && !b) return ge(t), null;
        } else 2 * ie() - l.renderingStartTime > hr && n !== 1073741824 && (t.flags |= 128, r = !0, Br(l, !1), t.lanes = 4194304);
        l.isBackwards ? (o.sibling = t.child, t.child = o) : (n = l.last, n !== null ? n.sibling = o : t.child = o, l.last = o);
      }
      return l.tail !== null ? (t = l.tail, l.rendering = t, l.tail = t.sibling, l.renderingStartTime = ie(), t.sibling = null, n = _.current, J(_, r ? n & 1 | 2 : n & 1), t) : (ge(t), null);
    case 22:
    case 23:
      return du(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Le & 1073741824 && (ge(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ge(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(E(156, t.tag));
}
function fm(e, t) {
  switch (Ws(t), t.tag) {
    case 1:
      return Pe(t.type) && ol(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return fr(), q(Me), q(Ae), tu(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return eu(t), null;
    case 13:
      if (q(_), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(E(340));
        ar();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return q(_), null;
    case 4:
      return fr(), null;
    case 10:
      return Zs(t.type._context), null;
    case 22:
    case 23:
      return du(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Li = !1, ve = !1, dm = typeof WeakSet == "function" ? WeakSet : Set, I = null;
function jn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    ne(e, t, r);
  }
  else n.current = null;
}
function ds(e, t, n) {
  try {
    n();
  } catch (r) {
    ne(e, t, r);
  }
}
var Ba = !1;
function hm(e, t) {
  if (qo = nl, e = of(), Vs(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var i = r.anchorOffset, l = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, l.nodeType;
        } catch {
          n = null;
          break e;
        }
        var o = 0, s = -1, u = -1, c = 0, g = 0, h = e, m = null;
        t: for (; ; ) {
          for (var v; h !== n || i !== 0 && h.nodeType !== 3 || (s = o + i), h !== l || r !== 0 && h.nodeType !== 3 || (u = o + r), h.nodeType === 3 && (o += h.nodeValue.length), (v = h.firstChild) !== null; )
            m = h, h = v;
          for (; ; ) {
            if (h === e) break t;
            if (m === n && ++c === i && (s = o), m === l && ++g === r && (u = o), (v = h.nextSibling) !== null) break;
            h = m, m = h.parentNode;
          }
          h = v;
        }
        n = s === -1 || u === -1 ? null : { start: s, end: u };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Zo = { focusedElem: e, selectionRange: n }, nl = !1, I = t; I !== null; ) if (t = I, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, I = e;
  else for (; I !== null; ) {
    t = I;
    try {
      var w = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (w !== null) {
            var C = w.memoizedProps, P = w.memoizedState, f = t.stateNode, a = f.getSnapshotBeforeUpdate(t.elementType === t.type ? C : be(t.type, C), P);
            f.__reactInternalSnapshotBeforeUpdate = a;
          }
          break;
        case 3:
          var d = t.stateNode.containerInfo;
          d.nodeType === 1 ? d.textContent = "" : d.nodeType === 9 && d.documentElement && d.removeChild(d.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(E(163));
      }
    } catch (y) {
      ne(t, t.return, y);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, I = e;
      break;
    }
    I = t.return;
  }
  return w = Ba, Ba = !1, w;
}
function Ur(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var i = r = r.next;
    do {
      if ((i.tag & e) === e) {
        var l = i.destroy;
        i.destroy = void 0, l !== void 0 && ds(t, n, l);
      }
      i = i.next;
    } while (i !== r);
  }
}
function Ml(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function hs(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function nd(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, nd(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[ht], delete t[ei], delete t[$o], delete t[qp], delete t[Zp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function rd(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Ra(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || rd(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function ps(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = ll));
  else if (r !== 4 && (e = e.child, e !== null)) for (ps(e, t, n), e = e.sibling; e !== null; ) ps(e, t, n), e = e.sibling;
}
function ms(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (ms(e, t, n), e = e.sibling; e !== null; ) ms(e, t, n), e = e.sibling;
}
var fe = null, $e = !1;
function Rt(e, t, n) {
  for (n = n.child; n !== null; ) id(e, t, n), n = n.sibling;
}
function id(e, t, n) {
  if (pt && typeof pt.onCommitFiberUnmount == "function") try {
    pt.onCommitFiberUnmount(Sl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      ve || jn(n, t);
    case 6:
      var r = fe, i = $e;
      fe = null, Rt(e, t, n), fe = r, $e = i, fe !== null && ($e ? (e = fe, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : fe.removeChild(n.stateNode));
      break;
    case 18:
      fe !== null && ($e ? (e = fe, n = n.stateNode, e.nodeType === 8 ? lo(e.parentNode, n) : e.nodeType === 1 && lo(e, n), qr(e)) : lo(fe, n.stateNode));
      break;
    case 4:
      r = fe, i = $e, fe = n.stateNode.containerInfo, $e = !0, Rt(e, t, n), fe = r, $e = i;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!ve && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        i = r = r.next;
        do {
          var l = i, o = l.destroy;
          l = l.tag, o !== void 0 && (l & 2 || l & 4) && ds(n, t, o), i = i.next;
        } while (i !== r);
      }
      Rt(e, t, n);
      break;
    case 1:
      if (!ve && (jn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (s) {
        ne(n, t, s);
      }
      Rt(e, t, n);
      break;
    case 21:
      Rt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (ve = (r = ve) || n.memoizedState !== null, Rt(e, t, n), ve = r) : Rt(e, t, n);
      break;
    default:
      Rt(e, t, n);
  }
}
function Ia(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new dm()), t.forEach(function(r) {
      var i = Sm.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(i, i));
    });
  }
}
function Ze(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var i = n[r];
    try {
      var l = e, o = t, s = o;
      e: for (; s !== null; ) {
        switch (s.tag) {
          case 5:
            fe = s.stateNode, $e = !1;
            break e;
          case 3:
            fe = s.stateNode.containerInfo, $e = !0;
            break e;
          case 4:
            fe = s.stateNode.containerInfo, $e = !0;
            break e;
        }
        s = s.return;
      }
      if (fe === null) throw Error(E(160));
      id(l, o, i), fe = null, $e = !1;
      var u = i.alternate;
      u !== null && (u.return = null), i.return = null;
    } catch (c) {
      ne(i, t, c);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) ld(t, e), t = t.sibling;
}
function ld(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Ze(t, e), st(e), r & 4) {
        try {
          Ur(3, e, e.return), Ml(3, e);
        } catch (C) {
          ne(e, e.return, C);
        }
        try {
          Ur(5, e, e.return);
        } catch (C) {
          ne(e, e.return, C);
        }
      }
      break;
    case 1:
      Ze(t, e), st(e), r & 512 && n !== null && jn(n, n.return);
      break;
    case 5:
      if (Ze(t, e), st(e), r & 512 && n !== null && jn(n, n.return), e.flags & 32) {
        var i = e.stateNode;
        try {
          Kr(i, "");
        } catch (C) {
          ne(e, e.return, C);
        }
      }
      if (r & 4 && (i = e.stateNode, i != null)) {
        var l = e.memoizedProps, o = n !== null ? n.memoizedProps : l, s = e.type, u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          s === "input" && l.type === "radio" && l.name != null && Bc(i, l), Uo(s, o);
          var c = Uo(s, l);
          for (o = 0; o < u.length; o += 2) {
            var g = u[o], h = u[o + 1];
            g === "style" ? Pc(i, h) : g === "dangerouslySetInnerHTML" ? Qc(i, h) : g === "children" ? Kr(i, h) : Ps(i, g, h, c);
          }
          switch (s) {
            case "input":
              Do(i, l);
              break;
            case "textarea":
              Rc(i, l);
              break;
            case "select":
              var m = i._wrapperState.wasMultiple;
              i._wrapperState.wasMultiple = !!l.multiple;
              var v = l.value;
              v != null ? Hn(i, !!l.multiple, v, !1) : m !== !!l.multiple && (l.defaultValue != null ? Hn(
                i,
                !!l.multiple,
                l.defaultValue,
                !0
              ) : Hn(i, !!l.multiple, l.multiple ? [] : "", !1));
          }
          i[ei] = l;
        } catch (C) {
          ne(e, e.return, C);
        }
      }
      break;
    case 6:
      if (Ze(t, e), st(e), r & 4) {
        if (e.stateNode === null) throw Error(E(162));
        i = e.stateNode, l = e.memoizedProps;
        try {
          i.nodeValue = l;
        } catch (C) {
          ne(e, e.return, C);
        }
      }
      break;
    case 3:
      if (Ze(t, e), st(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        qr(t.containerInfo);
      } catch (C) {
        ne(e, e.return, C);
      }
      break;
    case 4:
      Ze(t, e), st(e);
      break;
    case 13:
      Ze(t, e), st(e), i = e.child, i.flags & 8192 && (l = i.memoizedState !== null, i.stateNode.isHidden = l, !l || i.alternate !== null && i.alternate.memoizedState !== null || (cu = ie())), r & 4 && Ia(e);
      break;
    case 22:
      if (g = n !== null && n.memoizedState !== null, e.mode & 1 ? (ve = (c = ve) || g, Ze(t, e), ve = c) : Ze(t, e), st(e), r & 8192) {
        if (c = e.memoizedState !== null, (e.stateNode.isHidden = c) && !g && e.mode & 1) for (I = e, g = e.child; g !== null; ) {
          for (h = I = g; I !== null; ) {
            switch (m = I, v = m.child, m.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Ur(4, m, m.return);
                break;
              case 1:
                jn(m, m.return);
                var w = m.stateNode;
                if (typeof w.componentWillUnmount == "function") {
                  r = m, n = m.return;
                  try {
                    t = r, w.props = t.memoizedProps, w.state = t.memoizedState, w.componentWillUnmount();
                  } catch (C) {
                    ne(r, n, C);
                  }
                }
                break;
              case 5:
                jn(m, m.return);
                break;
              case 22:
                if (m.memoizedState !== null) {
                  Ma(h);
                  continue;
                }
            }
            v !== null ? (v.return = m, I = v) : Ma(h);
          }
          g = g.sibling;
        }
        e: for (g = null, h = e; ; ) {
          if (h.tag === 5) {
            if (g === null) {
              g = h;
              try {
                i = h.stateNode, c ? (l = i.style, typeof l.setProperty == "function" ? l.setProperty("display", "none", "important") : l.display = "none") : (s = h.stateNode, u = h.memoizedProps.style, o = u != null && u.hasOwnProperty("display") ? u.display : null, s.style.display = Mc("display", o));
              } catch (C) {
                ne(e, e.return, C);
              }
            }
          } else if (h.tag === 6) {
            if (g === null) try {
              h.stateNode.nodeValue = c ? "" : h.memoizedProps;
            } catch (C) {
              ne(e, e.return, C);
            }
          } else if ((h.tag !== 22 && h.tag !== 23 || h.memoizedState === null || h === e) && h.child !== null) {
            h.child.return = h, h = h.child;
            continue;
          }
          if (h === e) break e;
          for (; h.sibling === null; ) {
            if (h.return === null || h.return === e) break e;
            g === h && (g = null), h = h.return;
          }
          g === h && (g = null), h.sibling.return = h.return, h = h.sibling;
        }
      }
      break;
    case 19:
      Ze(t, e), st(e), r & 4 && Ia(e);
      break;
    case 21:
      break;
    default:
      Ze(
        t,
        e
      ), st(e);
  }
}
function st(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (rd(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(E(160));
      }
      switch (r.tag) {
        case 5:
          var i = r.stateNode;
          r.flags & 32 && (Kr(i, ""), r.flags &= -33);
          var l = Ra(e);
          ms(e, l, i);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, s = Ra(e);
          ps(e, s, o);
          break;
        default:
          throw Error(E(161));
      }
    } catch (u) {
      ne(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function pm(e, t, n) {
  I = e, od(e);
}
function od(e, t, n) {
  for (var r = (e.mode & 1) !== 0; I !== null; ) {
    var i = I, l = i.child;
    if (i.tag === 22 && r) {
      var o = i.memoizedState !== null || Li;
      if (!o) {
        var s = i.alternate, u = s !== null && s.memoizedState !== null || ve;
        s = Li;
        var c = ve;
        if (Li = o, (ve = u) && !c) for (I = i; I !== null; ) o = I, u = o.child, o.tag === 22 && o.memoizedState !== null ? Pa(i) : u !== null ? (u.return = o, I = u) : Pa(i);
        for (; l !== null; ) I = l, od(l), l = l.sibling;
        I = i, Li = s, ve = c;
      }
      Qa(e);
    } else i.subtreeFlags & 8772 && l !== null ? (l.return = i, I = l) : Qa(e);
  }
}
function Qa(e) {
  for (; I !== null; ) {
    var t = I;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            ve || Ml(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !ve) if (n === null) r.componentDidMount();
            else {
              var i = t.elementType === t.type ? n.memoizedProps : be(t.type, n.memoizedProps);
              r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var l = t.updateQueue;
            l !== null && ha(t, l, r);
            break;
          case 3:
            var o = t.updateQueue;
            if (o !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              ha(t, o, n);
            }
            break;
          case 5:
            var s = t.stateNode;
            if (n === null && t.flags & 4) {
              n = s;
              var u = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u.autoFocus && n.focus();
                  break;
                case "img":
                  u.src && (n.src = u.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var c = t.alternate;
              if (c !== null) {
                var g = c.memoizedState;
                if (g !== null) {
                  var h = g.dehydrated;
                  h !== null && qr(h);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(E(163));
        }
        ve || t.flags & 512 && hs(t);
      } catch (m) {
        ne(t, t.return, m);
      }
    }
    if (t === e) {
      I = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, I = n;
      break;
    }
    I = t.return;
  }
}
function Ma(e) {
  for (; I !== null; ) {
    var t = I;
    if (t === e) {
      I = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, I = n;
      break;
    }
    I = t.return;
  }
}
function Pa(e) {
  for (; I !== null; ) {
    var t = I;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Ml(4, t);
          } catch (u) {
            ne(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var i = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              ne(t, i, u);
            }
          }
          var l = t.return;
          try {
            hs(t);
          } catch (u) {
            ne(t, l, u);
          }
          break;
        case 5:
          var o = t.return;
          try {
            hs(t);
          } catch (u) {
            ne(t, o, u);
          }
      }
    } catch (u) {
      ne(t, t.return, u);
    }
    if (t === e) {
      I = null;
      break;
    }
    var s = t.sibling;
    if (s !== null) {
      s.return = t.return, I = s;
      break;
    }
    I = t.return;
  }
}
var mm = Math.ceil, gl = Bt.ReactCurrentDispatcher, uu = Bt.ReactCurrentOwner, Je = Bt.ReactCurrentBatchConfig, Y = 0, ae = null, le = null, he = 0, Le = 0, Un = _t(0), se = 0, oi = null, wn = 0, Pl = 0, au = 0, zr = null, Ie = null, cu = 0, hr = 1 / 0, yt = null, yl = !1, gs = null, Wt = null, Ti = !1, zt = null, vl = 0, Hr = 0, ys = null, Ji = -1, Xi = 0;
function Ce() {
  return Y & 6 ? ie() : Ji !== -1 ? Ji : Ji = ie();
}
function Jt(e) {
  return e.mode & 1 ? Y & 2 && he !== 0 ? he & -he : _p.transition !== null ? (Xi === 0 && (Xi = Yc()), Xi) : (e = W, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Zc(e.type)), e) : 1;
}
function rt(e, t, n, r) {
  if (50 < Hr) throw Hr = 0, ys = null, Error(E(185));
  hi(e, n, r), (!(Y & 2) || e !== ae) && (e === ae && (!(Y & 2) && (Pl |= n), se === 4 && Ft(e, he)), Fe(e, r), n === 1 && Y === 0 && !(t.mode & 1) && (hr = ie() + 500, Rl && $t()));
}
function Fe(e, t) {
  var n = e.callbackNode;
  _h(e, t);
  var r = tl(e, e === ae ? he : 0);
  if (r === 0) n !== null && zu(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && zu(n), t === 1) e.tag === 0 ? bp(Fa.bind(null, e)) : gf(Fa.bind(null, e)), Jp(function() {
      !(Y & 6) && $t();
    }), n = null;
    else {
      switch (Vc(r)) {
        case 1:
          n = Ts;
          break;
        case 4:
          n = Hc;
          break;
        case 16:
          n = el;
          break;
        case 536870912:
          n = Gc;
          break;
        default:
          n = el;
      }
      n = pd(n, sd.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function sd(e, t) {
  if (Ji = -1, Xi = 0, Y & 6) throw Error(E(327));
  var n = e.callbackNode;
  if (Wn() && e.callbackNode !== n) return null;
  var r = tl(e, e === ae ? he : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Al(e, r);
  else {
    t = r;
    var i = Y;
    Y |= 2;
    var l = ad();
    (ae !== e || he !== t) && (yt = null, hr = ie() + 500, mn(e, t));
    do
      try {
        vm();
        break;
      } catch (s) {
        ud(e, s);
      }
    while (!0);
    qs(), gl.current = l, Y = i, le !== null ? t = 0 : (ae = null, he = 0, t = se);
  }
  if (t !== 0) {
    if (t === 2 && (i = Vo(e), i !== 0 && (r = i, t = vs(e, i))), t === 1) throw n = oi, mn(e, 0), Ft(e, r), Fe(e, ie()), n;
    if (t === 6) Ft(e, r);
    else {
      if (i = e.current.alternate, !(r & 30) && !gm(i) && (t = Al(e, r), t === 2 && (l = Vo(e), l !== 0 && (r = l, t = vs(e, l))), t === 1)) throw n = oi, mn(e, 0), Ft(e, r), Fe(e, ie()), n;
      switch (e.finishedWork = i, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(E(345));
        case 2:
          rn(e, Ie, yt);
          break;
        case 3:
          if (Ft(e, r), (r & 130023424) === r && (t = cu + 500 - ie(), 10 < t)) {
            if (tl(e, 0) !== 0) break;
            if (i = e.suspendedLanes, (i & r) !== r) {
              Ce(), e.pingedLanes |= e.suspendedLanes & i;
              break;
            }
            e.timeoutHandle = _o(rn.bind(null, e, Ie, yt), t);
            break;
          }
          rn(e, Ie, yt);
          break;
        case 4:
          if (Ft(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, i = -1; 0 < r; ) {
            var o = 31 - nt(r);
            l = 1 << o, o = t[o], o > i && (i = o), r &= ~l;
          }
          if (r = i, r = ie() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * mm(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = _o(rn.bind(null, e, Ie, yt), r);
            break;
          }
          rn(e, Ie, yt);
          break;
        case 5:
          rn(e, Ie, yt);
          break;
        default:
          throw Error(E(329));
      }
    }
  }
  return Fe(e, ie()), e.callbackNode === n ? sd.bind(null, e) : null;
}
function vs(e, t) {
  var n = zr;
  return e.current.memoizedState.isDehydrated && (mn(e, t).flags |= 256), e = Al(e, t), e !== 2 && (t = Ie, Ie = n, t !== null && As(t)), e;
}
function As(e) {
  Ie === null ? Ie = e : Ie.push.apply(Ie, e);
}
function gm(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var i = n[r], l = i.getSnapshot;
        i = i.value;
        try {
          if (!it(l(), i)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function Ft(e, t) {
  for (t &= ~au, t &= ~Pl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - nt(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Fa(e) {
  if (Y & 6) throw Error(E(327));
  Wn();
  var t = tl(e, 0);
  if (!(t & 1)) return Fe(e, ie()), null;
  var n = Al(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Vo(e);
    r !== 0 && (t = r, n = vs(e, r));
  }
  if (n === 1) throw n = oi, mn(e, 0), Ft(e, t), Fe(e, ie()), n;
  if (n === 6) throw Error(E(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, rn(e, Ie, yt), Fe(e, ie()), null;
}
function fu(e, t) {
  var n = Y;
  Y |= 1;
  try {
    return e(t);
  } finally {
    Y = n, Y === 0 && (hr = ie() + 500, Rl && $t());
  }
}
function kn(e) {
  zt !== null && zt.tag === 0 && !(Y & 6) && Wn();
  var t = Y;
  Y |= 1;
  var n = Je.transition, r = W;
  try {
    if (Je.transition = null, W = 1, e) return e();
  } finally {
    W = r, Je.transition = n, Y = t, !(Y & 6) && $t();
  }
}
function du() {
  Le = Un.current, q(Un);
}
function mn(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, Wp(n)), le !== null) for (n = le.return; n !== null; ) {
    var r = n;
    switch (Ws(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && ol();
        break;
      case 3:
        fr(), q(Me), q(Ae), tu();
        break;
      case 5:
        eu(r);
        break;
      case 4:
        fr();
        break;
      case 13:
        q(_);
        break;
      case 19:
        q(_);
        break;
      case 10:
        Zs(r.type._context);
        break;
      case 22:
      case 23:
        du();
    }
    n = n.return;
  }
  if (ae = e, le = e = Xt(e.current, null), he = Le = t, se = 0, oi = null, au = Pl = wn = 0, Ie = zr = null, on !== null) {
    for (t = 0; t < on.length; t++) if (n = on[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var i = r.next, l = n.pending;
      if (l !== null) {
        var o = l.next;
        l.next = i, r.next = o;
      }
      n.pending = r;
    }
    on = null;
  }
  return e;
}
function ud(e, t) {
  do {
    var n = le;
    try {
      if (qs(), Vi.current = ml, pl) {
        for (var r = $.memoizedState; r !== null; ) {
          var i = r.queue;
          i !== null && (i.pending = null), r = r.next;
        }
        pl = !1;
      }
      if (An = 0, ue = oe = $ = null, jr = !1, ri = 0, uu.current = null, n === null || n.return === null) {
        se = 1, oi = t, le = null;
        break;
      }
      e: {
        var l = e, o = n.return, s = n, u = t;
        if (t = he, s.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
          var c = u, g = s, h = g.tag;
          if (!(g.mode & 1) && (h === 0 || h === 11 || h === 15)) {
            var m = g.alternate;
            m ? (g.updateQueue = m.updateQueue, g.memoizedState = m.memoizedState, g.lanes = m.lanes) : (g.updateQueue = null, g.memoizedState = null);
          }
          var v = Aa(o);
          if (v !== null) {
            v.flags &= -257, wa(v, o, s, l, t), v.mode & 1 && va(l, c, t), t = v, u = c;
            var w = t.updateQueue;
            if (w === null) {
              var C = /* @__PURE__ */ new Set();
              C.add(u), t.updateQueue = C;
            } else w.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              va(l, c, t), hu();
              break e;
            }
            u = Error(E(426));
          }
        } else if (b && s.mode & 1) {
          var P = Aa(o);
          if (P !== null) {
            !(P.flags & 65536) && (P.flags |= 256), wa(P, o, s, l, t), Js(dr(u, s));
            break e;
          }
        }
        l = u = dr(u, s), se !== 4 && (se = 2), zr === null ? zr = [l] : zr.push(l), l = o;
        do {
          switch (l.tag) {
            case 3:
              l.flags |= 65536, t &= -t, l.lanes |= t;
              var f = Kf(l, u, t);
              da(l, f);
              break e;
            case 1:
              s = u;
              var a = l.type, d = l.stateNode;
              if (!(l.flags & 128) && (typeof a.getDerivedStateFromError == "function" || d !== null && typeof d.componentDidCatch == "function" && (Wt === null || !Wt.has(d)))) {
                l.flags |= 65536, t &= -t, l.lanes |= t;
                var y = Wf(l, s, t);
                da(l, y);
                break e;
              }
          }
          l = l.return;
        } while (l !== null);
      }
      fd(n);
    } catch (A) {
      t = A, le === n && n !== null && (le = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function ad() {
  var e = gl.current;
  return gl.current = ml, e === null ? ml : e;
}
function hu() {
  (se === 0 || se === 3 || se === 2) && (se = 4), ae === null || !(wn & 268435455) && !(Pl & 268435455) || Ft(ae, he);
}
function Al(e, t) {
  var n = Y;
  Y |= 2;
  var r = ad();
  (ae !== e || he !== t) && (yt = null, mn(e, t));
  do
    try {
      ym();
      break;
    } catch (i) {
      ud(e, i);
    }
  while (!0);
  if (qs(), Y = n, gl.current = r, le !== null) throw Error(E(261));
  return ae = null, he = 0, se;
}
function ym() {
  for (; le !== null; ) cd(le);
}
function vm() {
  for (; le !== null && !Yh(); ) cd(le);
}
function cd(e) {
  var t = hd(e.alternate, e, Le);
  e.memoizedProps = e.pendingProps, t === null ? fd(e) : le = t, uu.current = null;
}
function fd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = fm(n, t), n !== null) {
        n.flags &= 32767, le = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        se = 6, le = null;
        return;
      }
    } else if (n = cm(n, t, Le), n !== null) {
      le = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      le = t;
      return;
    }
    le = t = e;
  } while (t !== null);
  se === 0 && (se = 5);
}
function rn(e, t, n) {
  var r = W, i = Je.transition;
  try {
    Je.transition = null, W = 1, Am(e, t, n, r);
  } finally {
    Je.transition = i, W = r;
  }
  return null;
}
function Am(e, t, n, r) {
  do
    Wn();
  while (zt !== null);
  if (Y & 6) throw Error(E(327));
  n = e.finishedWork;
  var i = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(E(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var l = n.lanes | n.childLanes;
  if ($h(e, l), e === ae && (le = ae = null, he = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Ti || (Ti = !0, pd(el, function() {
    return Wn(), null;
  })), l = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || l) {
    l = Je.transition, Je.transition = null;
    var o = W;
    W = 1;
    var s = Y;
    Y |= 4, uu.current = null, hm(e, n), ld(n, e), Up(Zo), nl = !!qo, Zo = qo = null, e.current = n, pm(n), Vh(), Y = s, W = o, Je.transition = l;
  } else e.current = n;
  if (Ti && (Ti = !1, zt = e, vl = i), l = e.pendingLanes, l === 0 && (Wt = null), Jh(n.stateNode), Fe(e, ie()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, { componentStack: i.stack, digest: i.digest });
  if (yl) throw yl = !1, e = gs, gs = null, e;
  return vl & 1 && e.tag !== 0 && Wn(), l = e.pendingLanes, l & 1 ? e === ys ? Hr++ : (Hr = 0, ys = e) : Hr = 0, $t(), null;
}
function Wn() {
  if (zt !== null) {
    var e = Vc(vl), t = Je.transition, n = W;
    try {
      if (Je.transition = null, W = 16 > e ? 16 : e, zt === null) var r = !1;
      else {
        if (e = zt, zt = null, vl = 0, Y & 6) throw Error(E(331));
        var i = Y;
        for (Y |= 4, I = e.current; I !== null; ) {
          var l = I, o = l.child;
          if (I.flags & 16) {
            var s = l.deletions;
            if (s !== null) {
              for (var u = 0; u < s.length; u++) {
                var c = s[u];
                for (I = c; I !== null; ) {
                  var g = I;
                  switch (g.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ur(8, g, l);
                  }
                  var h = g.child;
                  if (h !== null) h.return = g, I = h;
                  else for (; I !== null; ) {
                    g = I;
                    var m = g.sibling, v = g.return;
                    if (nd(g), g === c) {
                      I = null;
                      break;
                    }
                    if (m !== null) {
                      m.return = v, I = m;
                      break;
                    }
                    I = v;
                  }
                }
              }
              var w = l.alternate;
              if (w !== null) {
                var C = w.child;
                if (C !== null) {
                  w.child = null;
                  do {
                    var P = C.sibling;
                    C.sibling = null, C = P;
                  } while (C !== null);
                }
              }
              I = l;
            }
          }
          if (l.subtreeFlags & 2064 && o !== null) o.return = l, I = o;
          else e: for (; I !== null; ) {
            if (l = I, l.flags & 2048) switch (l.tag) {
              case 0:
              case 11:
              case 15:
                Ur(9, l, l.return);
            }
            var f = l.sibling;
            if (f !== null) {
              f.return = l.return, I = f;
              break e;
            }
            I = l.return;
          }
        }
        var a = e.current;
        for (I = a; I !== null; ) {
          o = I;
          var d = o.child;
          if (o.subtreeFlags & 2064 && d !== null) d.return = o, I = d;
          else e: for (o = a; I !== null; ) {
            if (s = I, s.flags & 2048) try {
              switch (s.tag) {
                case 0:
                case 11:
                case 15:
                  Ml(9, s);
              }
            } catch (A) {
              ne(s, s.return, A);
            }
            if (s === o) {
              I = null;
              break e;
            }
            var y = s.sibling;
            if (y !== null) {
              y.return = s.return, I = y;
              break e;
            }
            I = s.return;
          }
        }
        if (Y = i, $t(), pt && typeof pt.onPostCommitFiberRoot == "function") try {
          pt.onPostCommitFiberRoot(Sl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      W = n, Je.transition = t;
    }
  }
  return !1;
}
function Na(e, t, n) {
  t = dr(n, t), t = Kf(e, t, 1), e = Kt(e, t, 1), t = Ce(), e !== null && (hi(e, 1, t), Fe(e, t));
}
function ne(e, t, n) {
  if (e.tag === 3) Na(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Na(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Wt === null || !Wt.has(r))) {
        e = dr(n, e), e = Wf(t, e, 1), t = Kt(t, e, 1), e = Ce(), t !== null && (hi(t, 1, e), Fe(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function wm(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = Ce(), e.pingedLanes |= e.suspendedLanes & n, ae === e && (he & n) === n && (se === 4 || se === 3 && (he & 130023424) === he && 500 > ie() - cu ? mn(e, 0) : au |= n), Fe(e, t);
}
function dd(e, t) {
  t === 0 && (e.mode & 1 ? (t = Bi, Bi <<= 1, !(Bi & 130023424) && (Bi = 4194304)) : t = 1);
  var n = Ce();
  e = Et(e, t), e !== null && (hi(e, t, n), Fe(e, n));
}
function km(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), dd(e, n);
}
function Sm(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, i = e.memoizedState;
      i !== null && (n = i.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(E(314));
  }
  r !== null && r.delete(t), dd(e, n);
}
var hd;
hd = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Me.current) Qe = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return Qe = !1, am(e, t, n);
    Qe = !!(e.flags & 131072);
  }
  else Qe = !1, b && t.flags & 1048576 && yf(t, al, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Wi(e, t), e = t.pendingProps;
      var i = ur(t, Ae.current);
      Kn(t, n), i = ru(null, t, r, e, i, n);
      var l = iu();
      return t.flags |= 1, typeof i == "object" && i !== null && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Pe(r) ? (l = !0, sl(t)) : l = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, _s(t), i.updater = Ql, t.stateNode = i, i._reactInternals = t, ls(t, r, e, n), t = us(null, t, r, !0, l, n)) : (t.tag = 0, b && l && Ks(t), Se(null, t, i, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Wi(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = Em(r), e = be(r, e), i) {
          case 0:
            t = ss(null, t, r, e, n);
            break e;
          case 1:
            t = Ca(null, t, r, e, n);
            break e;
          case 11:
            t = ka(null, t, r, e, n);
            break e;
          case 14:
            t = Sa(null, t, r, be(r.type, e), n);
            break e;
        }
        throw Error(E(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : be(r, i), ss(e, t, r, i, n);
    case 1:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : be(r, i), Ca(e, t, r, i, n);
    case 3:
      e: {
        if (Zf(t), e === null) throw Error(E(387));
        r = t.pendingProps, l = t.memoizedState, i = l.element, Cf(e, t), dl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, l.isDehydrated) if (l = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = l, t.memoizedState = l, t.flags & 256) {
          i = dr(Error(E(423)), t), t = Ea(e, t, r, n, i);
          break e;
        } else if (r !== i) {
          i = dr(Error(E(424)), t), t = Ea(e, t, r, n, i);
          break e;
        } else for (Te = Vt(t.stateNode.containerInfo.firstChild), Oe = t, b = !0, tt = null, n = kf(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (ar(), r === i) {
            t = xt(e, t, n);
            break e;
          }
          Se(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return Ef(t), e === null && ns(t), r = t.type, i = t.pendingProps, l = e !== null ? e.memoizedProps : null, o = i.children, bo(r, i) ? o = null : l !== null && bo(r, l) && (t.flags |= 32), qf(e, t), Se(e, t, o, n), t.child;
    case 6:
      return e === null && ns(t), null;
    case 13:
      return bf(e, t, n);
    case 4:
      return $s(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = cr(t, null, r, n) : Se(e, t, r, n), t.child;
    case 11:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : be(r, i), ka(e, t, r, i, n);
    case 7:
      return Se(e, t, t.pendingProps, n), t.child;
    case 8:
      return Se(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return Se(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, i = t.pendingProps, l = t.memoizedProps, o = i.value, J(cl, r._currentValue), r._currentValue = o, l !== null) if (it(l.value, o)) {
          if (l.children === i.children && !Me.current) {
            t = xt(e, t, n);
            break e;
          }
        } else for (l = t.child, l !== null && (l.return = t); l !== null; ) {
          var s = l.dependencies;
          if (s !== null) {
            o = l.child;
            for (var u = s.firstContext; u !== null; ) {
              if (u.context === r) {
                if (l.tag === 1) {
                  u = kt(-1, n & -n), u.tag = 2;
                  var c = l.updateQueue;
                  if (c !== null) {
                    c = c.shared;
                    var g = c.pending;
                    g === null ? u.next = u : (u.next = g.next, g.next = u), c.pending = u;
                  }
                }
                l.lanes |= n, u = l.alternate, u !== null && (u.lanes |= n), rs(
                  l.return,
                  n,
                  t
                ), s.lanes |= n;
                break;
              }
              u = u.next;
            }
          } else if (l.tag === 10) o = l.type === t.type ? null : l.child;
          else if (l.tag === 18) {
            if (o = l.return, o === null) throw Error(E(341));
            o.lanes |= n, s = o.alternate, s !== null && (s.lanes |= n), rs(o, n, t), o = l.sibling;
          } else o = l.child;
          if (o !== null) o.return = l;
          else for (o = l; o !== null; ) {
            if (o === t) {
              o = null;
              break;
            }
            if (l = o.sibling, l !== null) {
              l.return = o.return, o = l;
              break;
            }
            o = o.return;
          }
          l = o;
        }
        Se(e, t, i.children, n), t = t.child;
      }
      return t;
    case 9:
      return i = t.type, r = t.pendingProps.children, Kn(t, n), i = Xe(i), r = r(i), t.flags |= 1, Se(e, t, r, n), t.child;
    case 14:
      return r = t.type, i = be(r, t.pendingProps), i = be(r.type, i), Sa(e, t, r, i, n);
    case 15:
      return Jf(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : be(r, i), Wi(e, t), t.tag = 1, Pe(r) ? (e = !0, sl(t)) : e = !1, Kn(t, n), Vf(t, r, i), ls(t, r, i, n), us(null, t, r, !0, e, n);
    case 19:
      return _f(e, t, n);
    case 22:
      return Xf(e, t, n);
  }
  throw Error(E(156, t.tag));
};
function pd(e, t) {
  return zc(e, t);
}
function Cm(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function We(e, t, n, r) {
  return new Cm(e, t, n, r);
}
function pu(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Em(e) {
  if (typeof e == "function") return pu(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Ns) return 11;
    if (e === Ds) return 14;
  }
  return 2;
}
function Xt(e, t) {
  var n = e.alternate;
  return n === null ? (n = We(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function qi(e, t, n, r, i, l) {
  var o = 2;
  if (r = e, typeof e == "function") pu(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Qn:
      return gn(n.children, i, l, t);
    case Fs:
      o = 8, i |= 8;
      break;
    case Qo:
      return e = We(12, n, t, i | 2), e.elementType = Qo, e.lanes = l, e;
    case Mo:
      return e = We(13, n, t, i), e.elementType = Mo, e.lanes = l, e;
    case Po:
      return e = We(19, n, t, i), e.elementType = Po, e.lanes = l, e;
    case Cc:
      return Fl(n, i, l, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case kc:
          o = 10;
          break e;
        case Sc:
          o = 9;
          break e;
        case Ns:
          o = 11;
          break e;
        case Ds:
          o = 14;
          break e;
        case Qt:
          o = 16, r = null;
          break e;
      }
      throw Error(E(130, e == null ? e : typeof e, ""));
  }
  return t = We(o, n, t, i), t.elementType = e, t.type = r, t.lanes = l, t;
}
function gn(e, t, n, r) {
  return e = We(7, e, r, t), e.lanes = n, e;
}
function Fl(e, t, n, r) {
  return e = We(22, e, r, t), e.elementType = Cc, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function po(e, t, n) {
  return e = We(6, e, null, t), e.lanes = n, e;
}
function mo(e, t, n) {
  return t = We(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function xm(e, t, n, r, i) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Xl(0), this.expirationTimes = Xl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xl(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
}
function mu(e, t, n, r, i, l, o, s, u) {
  return e = new xm(e, t, n, s, u), t === 1 ? (t = 1, l === !0 && (t |= 8)) : t = 0, l = We(3, null, null, t), e.current = l, l.stateNode = e, l.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, _s(l), e;
}
function Bm(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: In, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function md(e) {
  if (!e) return Zt;
  e = e._reactInternals;
  e: {
    if (Cn(e) !== e || e.tag !== 1) throw Error(E(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Pe(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(E(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Pe(n)) return mf(e, n, t);
  }
  return t;
}
function gd(e, t, n, r, i, l, o, s, u) {
  return e = mu(n, r, !0, e, i, l, o, s, u), e.context = md(null), n = e.current, r = Ce(), i = Jt(n), l = kt(r, i), l.callback = t ?? null, Kt(n, l, i), e.current.lanes = i, hi(e, i, r), Fe(e, r), e;
}
function Nl(e, t, n, r) {
  var i = t.current, l = Ce(), o = Jt(i);
  return n = md(n), t.context === null ? t.context = n : t.pendingContext = n, t = kt(l, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Kt(i, t, o), e !== null && (rt(e, i, o, l), Yi(e, i, o)), o;
}
function wl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Da(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function gu(e, t) {
  Da(e, t), (e = e.alternate) && Da(e, t);
}
function Rm() {
  return null;
}
var yd = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function yu(e) {
  this._internalRoot = e;
}
Dl.prototype.render = yu.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(E(409));
  Nl(e, t, null, null);
};
Dl.prototype.unmount = yu.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    kn(function() {
      Nl(null, e, null, null);
    }), t[Ct] = null;
  }
};
function Dl(e) {
  this._internalRoot = e;
}
Dl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Jc();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Pt.length && t !== 0 && t < Pt[n].priority; n++) ;
    Pt.splice(n, 0, e), n === 0 && qc(e);
  }
};
function vu(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Ll(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function La() {
}
function Im(e, t, n, r, i) {
  if (i) {
    if (typeof r == "function") {
      var l = r;
      r = function() {
        var c = wl(o);
        l.call(c);
      };
    }
    var o = gd(t, r, e, 0, null, !1, !1, "", La);
    return e._reactRootContainer = o, e[Ct] = o.current, _r(e.nodeType === 8 ? e.parentNode : e), kn(), o;
  }
  for (; i = e.lastChild; ) e.removeChild(i);
  if (typeof r == "function") {
    var s = r;
    r = function() {
      var c = wl(u);
      s.call(c);
    };
  }
  var u = mu(e, 0, !1, null, null, !1, !1, "", La);
  return e._reactRootContainer = u, e[Ct] = u.current, _r(e.nodeType === 8 ? e.parentNode : e), kn(function() {
    Nl(t, u, n, r);
  }), u;
}
function Tl(e, t, n, r, i) {
  var l = n._reactRootContainer;
  if (l) {
    var o = l;
    if (typeof i == "function") {
      var s = i;
      i = function() {
        var u = wl(o);
        s.call(u);
      };
    }
    Nl(t, o, e, i);
  } else o = Im(n, t, e, i, r);
  return wl(o);
}
Kc = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Pr(t.pendingLanes);
        n !== 0 && (Os(t, n | 1), Fe(t, ie()), !(Y & 6) && (hr = ie() + 500, $t()));
      }
      break;
    case 13:
      kn(function() {
        var r = Et(e, 1);
        if (r !== null) {
          var i = Ce();
          rt(r, e, 1, i);
        }
      }), gu(e, 1);
  }
};
js = function(e) {
  if (e.tag === 13) {
    var t = Et(e, 134217728);
    if (t !== null) {
      var n = Ce();
      rt(t, e, 134217728, n);
    }
    gu(e, 134217728);
  }
};
Wc = function(e) {
  if (e.tag === 13) {
    var t = Jt(e), n = Et(e, t);
    if (n !== null) {
      var r = Ce();
      rt(n, e, t, r);
    }
    gu(e, t);
  }
};
Jc = function() {
  return W;
};
Xc = function(e, t) {
  var n = W;
  try {
    return W = e, t();
  } finally {
    W = n;
  }
};
Ho = function(e, t, n) {
  switch (t) {
    case "input":
      if (Do(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var i = Bl(r);
            if (!i) throw Error(E(90));
            xc(r), Do(r, i);
          }
        }
      }
      break;
    case "textarea":
      Rc(e, n);
      break;
    case "select":
      t = n.value, t != null && Hn(e, !!n.multiple, t, !1);
  }
};
Dc = fu;
Lc = kn;
var Qm = { usingClientEntryPoint: !1, Events: [mi, Nn, Bl, Fc, Nc, fu] }, Rr = { findFiberByHostInstance: ln, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Mm = { bundleType: Rr.bundleType, version: Rr.version, rendererPackageName: Rr.rendererPackageName, rendererConfig: Rr.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: Bt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = jc(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Rr.findFiberByHostInstance || Rm, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Oi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Oi.isDisabled && Oi.supportsFiber) try {
    Sl = Oi.inject(Mm), pt = Oi;
  } catch {
  }
}
Ue.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Qm;
Ue.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!vu(t)) throw Error(E(200));
  return Bm(e, t, null, n);
};
Ue.createRoot = function(e, t) {
  if (!vu(e)) throw Error(E(299));
  var n = !1, r = "", i = yd;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = mu(e, 1, !1, null, null, n, !1, r, i), e[Ct] = t.current, _r(e.nodeType === 8 ? e.parentNode : e), new yu(t);
};
Ue.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(E(188)) : (e = Object.keys(e).join(","), Error(E(268, e)));
  return e = jc(t), e = e === null ? null : e.stateNode, e;
};
Ue.flushSync = function(e) {
  return kn(e);
};
Ue.hydrate = function(e, t, n) {
  if (!Ll(t)) throw Error(E(200));
  return Tl(null, e, t, !0, n);
};
Ue.hydrateRoot = function(e, t, n) {
  if (!vu(e)) throw Error(E(405));
  var r = n != null && n.hydratedSources || null, i = !1, l = "", o = yd;
  if (n != null && (n.unstable_strictMode === !0 && (i = !0), n.identifierPrefix !== void 0 && (l = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = gd(t, null, e, 1, n ?? null, i, !1, l, o), e[Ct] = t.current, _r(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(
    n,
    i
  );
  return new Dl(t);
};
Ue.render = function(e, t, n) {
  if (!Ll(t)) throw Error(E(200));
  return Tl(null, e, t, !1, n);
};
Ue.unmountComponentAtNode = function(e) {
  if (!Ll(e)) throw Error(E(40));
  return e._reactRootContainer ? (kn(function() {
    Tl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[Ct] = null;
    });
  }), !0) : !1;
};
Ue.unstable_batchedUpdates = fu;
Ue.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Ll(n)) throw Error(E(200));
  if (e == null || e._reactInternals === void 0) throw Error(E(38));
  return Tl(e, t, n, !1, r);
};
Ue.version = "18.3.1-next-f1338f8080-20240426";
function vd() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(vd);
    } catch (e) {
      console.error(e);
    }
}
vd(), yc.exports = Ue;
var Pm = yc.exports, Ad, Ta = Pm;
Ad = Ta.createRoot, Ta.hydrateRoot;
function yi() {
  return "https://app.coolstory.me";
}
function Fm() {
  var n;
  const e = new URL(import.meta.url);
  return ((n = e == null ? void 0 : e.searchParams) == null ? void 0 : n.get("id")) ?? void 0;
}
async function Nm(e, t) {
  try {
    if (!(await fetch(
      `${yi()}/api/${e}/stories/${t}/views`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )).ok)
      throw new Error("An error occurred while incrementing story views");
  } catch (n) {
    throw new Error(`Failed to increment story views: ${n}`);
  }
}
async function Oa(e, t, n) {
  try {
    return (await fetch(
      `${yi()}/api/${e}/stories/${t}/response`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ response: n })
      }
    )).status;
  } catch (r) {
    throw new Error(`Failed to send a response to story: ${r}`);
  }
}
function ws(e) {
  const t = localStorage.getItem(e);
  return t === null ? !1 : JSON.parse(t).viewed;
}
function Dm(e) {
  localStorage.setItem(e, JSON.stringify({ viewed: !0 }));
}
window.dataLayer = window.dataLayer || [];
function Rn(e, t) {
  window.dataLayer.push({
    event: e,
    ...t
  }), console.log(`Custom event '${e}' sent to Data Layer`, t);
}
async function Lm(e, t, n) {
  if (!e)
    throw new Error("No uid provided");
  const r = await fetch(
    `${yi()}/api/${e}/stories${t ? `?wid=${t}` : ""}`
  );
  if (!r.ok)
    throw new Error(
      `Response error: ${r.status}, ${r.statusText}`
    );
  const { stories: i } = await r.json();
  return i.filter(
    (o) => !(o.behaviour === "view_once" && ws(o.id))
  ).filter((o) => {
    var s;
    return n ? (s = o == null ? void 0 : o.segment) != null && s.filters ? Object.entries(n).every(
      ([u, c]) => {
        var g;
        return ((g = o == null ? void 0 : o.segment) == null ? void 0 : g.filters[u]) === c;
      }
    ) : !1 : !0;
  });
}
async function Tm(e, t, n) {
  try {
    if (!(await fetch(
      `${yi()}/api/${e}/stories/poll/${t}/${n}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )).ok)
      throw new Error("An error occurred while voting");
  } catch (r) {
    throw new Error(`Failed to send a vote: ${r}`);
  }
}
const Om = (e, t) => {
  localStorage.setItem(e, JSON.stringify({ option_id: t }));
}, jm = (e) => {
  const t = localStorage.getItem(e);
  return t ? JSON.parse(t) : null;
};
async function Um(e, t) {
  try {
    const n = await fetch(
      `${yi()}/api/${e}/widgets/${t}/status`,
      {
        method: "PATCH"
      }
    );
    if (!n.ok)
      throw new Error(
        `An error occured while updating widget status: ${n.statusText}`
      );
    return await n.json();
  } catch (n) {
    throw new Error(`Failed to update widget status: ${JSON.stringify(n)}`);
  }
}
const zm = "_storyPreviewButton_83aj5_1", Hm = "_storyPreviewImage_83aj5_26", ja = {
  storyPreviewButton: zm,
  storyPreviewImage: Hm
}, Gm = "data:image/jpeg;base64,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";
function Ym({
  preview: e,
  bezelColor: t,
  onClick: n
}) {
  return /* @__PURE__ */ S.jsx(
    "button",
    {
      onClick: n,
      className: ja.storyPreviewButton,
      style: { background: t ?? "linear-gradient(45deg, #ffa95f 5%, #f99c4a 15%, #f47838 30%, #e75157 45%, #d92d7a 70%, #cc2a92 80%, #c32e92 95%)" },
      children: /* @__PURE__ */ S.jsx(
        "img",
        {
          src: e ?? Gm,
          alt: "Preview",
          className: ja.storyPreviewImage
        }
      )
    }
  );
}
const Vm = "_playerContainer_eyxrn_1", Km = "_navigationButton_eyxrn_11", Wm = "_topBar_eyxrn_31", Jm = "_progressBar_eyxrn_44", Xm = "_progressBarItem_eyxrn_52", qm = "_progressBarItem_viewed_eyxrn_58", Zm = "_progressBarItem_active_eyxrn_62", bm = "_controlsBar_eyxrn_68", _m = "_controlsButton_eyxrn_74", $m = "_playerControls_eyxrn_88", eg = "_coolstoryPlayer_eyxrn_94", tg = "_storyContent_eyxrn_105", ng = "_cta_eyxrn_124", rg = "_ctaButton_eyxrn_138", ig = "_replySection_eyxrn_159", lg = "_replyInputContainer_eyxrn_168", og = "_replyInput_eyxrn_168", sg = "_sendButton_eyxrn_191", ug = "_filterLayer_eyxrn_212", ag = "_quickReactions_eyxrn_226", cg = "_quickReactionButton_eyxrn_235", fg = "_toast_eyxrn_250", dg = "_popup_eyxrn_1", hg = "_poll_eyxrn_280", pg = "_pollQuestion_eyxrn_296", mg = "_pollOptionsList_eyxrn_307", gg = "_pollOptionButton_eyxrn_317", U = {
  playerContainer: Vm,
  navigationButton: Km,
  topBar: Wm,
  progressBar: Jm,
  progressBarItem: Xm,
  progressBarItem_viewed: qm,
  progressBarItem_active: Zm,
  controlsBar: bm,
  controlsButton: _m,
  playerControls: $m,
  coolstoryPlayer: eg,
  storyContent: tg,
  cta: ng,
  ctaButton: rg,
  replySection: ig,
  replyInputContainer: lg,
  replyInput: og,
  sendButton: sg,
  filterLayer: ug,
  quickReactions: ag,
  quickReactionButton: cg,
  toast: fg,
  popup: dg,
  poll: hg,
  pollQuestion: pg,
  pollOptionsList: mg,
  pollOptionButton: gg
}, yg = "data:image/png;base64,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", vg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABiVSURBVHgB7Vx5jCRXef9eXX3PTM/M7uwsO3v7AhYDPgWLDwyIBJzEMnEkoigmoEREyoVEACVISBGICItI/AmJOBRFSgBBcCyLBHyujbPYxmYxXsN6197dzNq7szM709Pddbyql+97R9frmu459jD8wSe96arqqve+71ff9b73egB+Q0Pp8S9uq8BvaHVi8GtAD37mFm/Q9Vs/8xCHXzG9pgAREF54tlHxF7ZtagQ7Gg2YcQKxx4G0wXyn7jgsoPuyTMQiyZYzcFtZzF5steDEmVb8cjdpnuTlidZrCdwlB4hAqYVHt2+q8+ua06XrgrT9Fn+EXSGY2OpWXOZ4CUA1GPxwJ4aM+5B2U7ydzSZL4gXulo+cPcUfOLPs/bhd3n38UoN1yQB69JP7mtvH229vTvDbA7f7DqfCrvQbGYNSClDOsJUAfLzRd9QDvtvfQZLqT7wXMYQwwob3Ri4kLUdkXXEkTisPLpz17j0+X3vsHZ8/tACXgC46QATMtvrZ90xt5n/qu91rnYnKiNNIclCqKGRQRUBGsU3htc0A7ha8VkMgyBXhPYBgiEW0NZQ5PoPXTyI483jcQa3KcrCWY+BzzlKSVp4M0/q3jhzNvnP9F156BS4iXTSAKCS+jge3bRpb/hsCxpvMRqAeKGAaKHStjuBcjp9vwmtvBnB24egT2CiSDoumXWxoQdlZBOwUgvICiM6PgbUOI1B43sqB6rawj47zwKunvS+fqjrfe9vHTnbhItBFAejgJ7fv3j269Fejm9O7vVE+Ag28SOAQMKNXICg34OfNCMpOHLFeeNpbo/eCixFdBVb3JwALDwGcO6iAQpCghXcvekuLp917X+rU//Hafzh5CC6QLgggcsA7vV/cOTXa+rvKeLIP6uhHJj1lSpMIzPh7UTluxFHQjKDgYwwwzF99EJHoAwNUan23jEA9i0D9F8CZg8r05vC+5RS68/6hVxcbn71QbTpvgMjX7CjPfnR6Jv6EV05GYJIprRlDfzJ1O2rMu7D3yQEjlqwTG7SiJtmaY4MS6YPE+h6Pl55CcL6JQD2ntGlOAA990qavPb8485nzdeIunAcd/PjOLZc3T39686b2p9xxKENTgzPzDoAdH0GtuQ6BoK4zLYgRhs4FKIGxMUefW9d6TeRNgmKuJ1a/WX5cQoc/do3S3vQYXovBYVmpLOLr66I784G3bnn8K4+fW4YN0oYBInB2j5+7p9nsfMSZdJn0N5P4Z8edAJvvUo4XrLfMwBIIoB+sGAaDY7cQciCi/k8JXGJdQ3GqaNrl7XhpFr9aAOY5DEHaV/fiy+68ZsvBrxxY3JAmbQggC5wP9sBp7gDY9kcAE29TjLIUVgJiHbMB1/pAM8ImBeETCxQbrMKxQNBLaNqVy/CUUoRXJUhBmlxRd5Kdd75560Mb0aR1A0Q+h8xqtLb8EXfKy8GZ+QCCg+Fb+gyuGbWOB2pQ4bgPNMt0VmhI0g8IgSHHMZ9hPjblWpU9eIz5VDzbA6nC0unbr7vswa8eOB3CxQKIotUu78W/nhxtfcqbQHDI5xhw6tvQEpBxF5lmLGdQNqGZz/rBG6pFyQCgbO2xAbHAkPdwC1gMWjGeuxgha5YmpYwFPNzXcMLq771v8uF/+f7SmtOUtZIQSRTKNwVLn/DqDpOhvIRZ8OZb8BP9TYLM+GRWrsKjjyIdtQwQOqQLe+gQhrPBhxxbEawX1Qrjkv9K9Pvf/G5MB9o41DHwoozVwvbdE3Me5Uj/DGvQmhpESeC0N/eV2jhsZU30O6Mo8OvegxFjl3qjgXamKUYk16QbtpO1z2PVBmoaH9Ai6DNX0gzZh+mvAyudOl6LmXrWRSA5vgAXxQyaCNDLeEsEnitKrJNcftf+LY98+ZGl03C+ANH0Ya/X+vvRkfC33TFXmdYEhvBJnC5kqRo4ReE8RzHnGH9iMxwNAC0aDNyKZgMRrQRiUNQjjcq0Kkdmwot9eeiTgjHMkY7jeQK+4BM4ORlFU7t/NVNb1cRoblVz23dL0yqh5FXUmvHLVQZrPy6c/FyqfKnQU1RIEPU1SSVYnaLBl1eYlnUu2vog0+da/sYm9J17EaBDxtRun+5Ufwe/+XcYQkM1iKLWRHrynsYIv8ppoPaM4Bxq09WYY2D4SskBIhgpMuA6SovwFnkurxkNsHOcCIZr02ptgAmtuK5zpVio8Yli86nBiUPFN1UNFucQpA6VUoK4Fc/8wfXb7hsW+odqEJUsxoP4hp72NDYrcAw5+i3R+CU/dzdU16Fr0uxiq0dTFCs47HWTPbWI+7/iGgwa0tSR6NVHibrWu6CpuRNxPg0kW70b3zjKl98PQxy2M+giaU8QL37YK4sGlPCWKqJe26K+jHDK7C6r6JVop0yMMN3IKVIThbbCv7Q32PRzYkmNaffNrWb4iDSghk/imXgnqmIUrk0DyVauMDHitT9MSfAAKAZrEFUCq3G03wk0fmXMTF0qU9AAZGI6x3LLcnARJMBEwZfQLaR5kcBgp0yLBXhP+QJXUkIcLz6X9zeEBIuAxVpLDb/S32mQ6uiP2qeAZCwHydWbghjrMSt90QqAKCnszj39W+MTouKQVZCQVP2TzGErt5QLKAXWwG4OgmU53TMteO7ACfjFoTl5fvm+SXjD/hmobBqBtZ1zkSLsb2lwf43c9IVtiamVLEdaA80lryzlcoJ55vmi0sg6t2PUXlEaWQGQKrDH7yTVI3mhNK46S1FFA0+5Ar+sBqwo22eETVl3pX1itxvDQ995Hn74rZOw3FZ+4YkHz8BNv5yH933oag3S+onAue+rz8Ij978KsXbA1N97ZhfhtrveCJWK8nEyxQo1E8aBdPVBEipXZBx3mXiYl2YWnwuvCTp1DHFwaFWAaPXBAb5DnpD/Ia9viDqWIOFAAVdvg8zQKSum/DydOPbMKXjkuyfAx9tnppWDXO4IeOIHp2HvW4/Dm2/bCxuhF549Lp+toYVOTeT9PXbfLOy+vAmvv366X6xMq0qs54Oxl8vQu62mZMQFJsfhOxppeEMRoBVOOlpavolUrud/yM7I+UUYFtOOLnlaWkgMEDPUIj04fj7zI5WgTk06KBBTDY99T8DPH8ca8xKF3Xh9De+lZ+jZYn9Ecixr7D5wDBm+SQaShat7RDAi/RDJ3A3DW4qLmH0nFL0awdHL5Diey8pBQyXGZNgyGcTbQzwOhPZDOqSSeZd0GEVf1Mb1rIXTXahXKX3yoKLvczDzbncS+V0nbkF1nQ67E3fX7K/daUGN1h1NjTSyqpCR5i0jRplKHIUGD/M4kpXylKl6uiduv0Rl0FcGAkQrnmma7OM+A1UPxM8MO0vxzKU0XqjEkD5psJSmG0HOUKk/7yQ/7jkcDNd0XLLXCNMhWfIQWrM/GAAOaWBGE2maLzIFDAEky1b5fSRzkqY7Qx5utwHqM7HOQndPAulU/2i6LkMgJVxny6kakIvcDBiVGNCRpy3wcdrT3DxcO6a21zC1cmC95JXUM6v1R2PS2D1wDF/EowQnVbwn2hTlnK2QcDrpFpZEfc6xj8upETaJC539hfxMd8jRbjM0ryxSyNOAmQaJPk1xD99SgOWP179tQj4WW2HXHO99a1P3Ga+rBZiVm2eG9UdjKg3RvsbmzfCaaY3Nkp5sWdpfo9kxSWtTOfWZ2EIr3lEZs7DJhHDShDFa8fQtLM18x3xSmZXjPY7KDMhRvv5NNTj59mk48r+voCDqvpgzeMMt2zDiYF4VbWAlJu3KZ04d3QYvHPi/vv6uxDFoLIjoxTE1k8+0nyHTovlX5uS8EjhyOTtDxUpWDNXpJK+DYQCNVWCcPhNKf4CyUc4EDsKkFgWqYyICS1b3POXA5dxL27UMqXh3EME775qBTbsacOJnKvOdeeMYvGX/GJaQIvVWN0ABRoWb79gK49uqff3tu476w6lIbExLP8CNSrOc18SKaiiTwJYi/9xzwcz1Qp6NUiQzmyJ6ANHFcOnJ0apOcClCSi+SaX9DnRstomO6j2vzC1zFEE1Que4VGa56y3DD/roERQnJ1fo612rtbWBZDrWy6qUr+1tezier3AYHctAMz/ZngRL5ZgW+t2y8NHLEN72tSBRJ88qm7IUAOBi1BrrTjEyK6ssB2aI2L8Og7pkYPdeBgOGJW2AMiwQ9oCQnBbB4oX5LpkPlDCxbyMBFFUxhJX2CtMAChMzM89RLJF4h6xNSvnQdxbJ4uDYPnKwmaNt29BQIABtUOaKBXc0sMUCA0GSMhBWWgMzcA3lYkKBaoHABQ8lUCCkXKyqAMDkOU5GWTD7T/dKY2eCKDskkb+E5yKQcxfvWH2utXlTPmrHUtmvNGBf5sbwuciHN7SQsRR3TimR/R/cWwaH+bHCMNtngpAVeC+aVWbyTUgyi/jwoyuuYNDnn6IioE3JmMtyTH6PSKff7B5YC+6oZMiBlAwbOCq0IiA1Y8T55zYCt+5f5mDuYD5uI99TrOWiSjcf9oLmuMx8t7U1WAERe23Hc2QiZiy3BpQoaR21TOqRaywtmQyG2J4gWjsJv5g4GYRB45n56llvAUN+2aQ7SAsOneakmr7OyaF2pAZJ9uQvz9ra+PgMNMzZbSzGqS9VzlPPCiRydM+mHyM/gNQqLcpqhGXA8lV84bs6oawDQIBE5mRLMsQTfCPWZre5EaBHstEG+UF/lQKB5JAfO1bI45T8kk+1/Qlwqwi6Y5zmL9pB9JuYw7xTOC7EyxUXSTVHOQI9nmZl5A3LJRzcCRDJkJ5MmL7FMRmqTo7PaDeRB5v7e807etz2WPHYUL8QTBQxb0zX/IsuBISVINN8keyLc5+2h+zSo2qy8GM+1zsYObC1rvshGXakgmCmgpkiWuJeDZIgY8oRiUIZ0T0VdV+TCmGMjYKamAtEih27HwSxWzY0mJj0oVfCesvElhVhi+yh5LHOK/AUZUzP5UNqvPTSm8T9xFkhkoJtiYGOhKJWODAWI9iEHztkTCMbWOPVx7iZwDB+TZMqHAok8cxw1yeOBEtRnVpJogQRmScgGxhoOfVqEdZ7DL4Tw7FNzcOJ4WxbAiKjOs+eKcbjmmjHYOhMooPrCdToAqCHgyOO0T3v6zAsXFcnnRngtY/7hslc+DsMAok3abPHYwSSKb0gSAQEuoWQB2aaP1Q6sumHJQ+ZEjDqnSiIyjvdJkExJBO+VS76SaQskIjcXbPblZfjBf78CP/1ZG+dWOBb2QdVHCrdHT2TY5uCnPzkLt9w2DddeNwKlkaLWQD5GTwBjcnrzVmJeDJcv1dYekinGmX2CSpChryL/k4LzXFTbiQXvl3pd9nnJrz/0UvahG2tNL4vf7wXoilErGArIMKFzHXzcUcdSi6RDZmonGfkquVnMURNXGWpd1ZjOYajELZhs585EcO+3j8HTh7pyQ9j0JgZjCMA4loib2EYaDgKGk2dc4Tl8eBlGRwLYvqWmEkvqg5w709HQhDp6MXRsfI6pAVHwkBPXRDln1CaO7iLlLn6iiXVSCDsZhC2B0+fyV2/9wgsHh2oQUaneeCJZ6hzjYXolx8qdhxpka5GZ1K3MMIMcc5emIFYR34M8YuFbe/TR0/DzI4ksmxIgZTQhuxBGVK8wqGGN59W5DB764SnYurkGu64czYfL9AKlWYCU4d4kr6ALZYlyB3JyzPu0JyHtCVW5IyOgUudsfbJxQO4nsmiFnLS9P2Pe4ykOSGbGcf6TUMNOEq5CvqqxWFGNGEljizm3kJ9AbyI5+8qyNJ2m1hYqo1IJ1ScTs1pNl1fJH5Fv+tFzOIPvxiv6y8ExY9vgGL9DCa8K7SQDySIDEJpqFGIUi8jXeo/FTThSxGMFQJQkcVa+N4nYYhqRp0fUE418TPbqymMaUNl0PAQkzbhpWrBjxzpSYAKAwCEwhhEBV68oEGcPz+G8l1szdqtvMx4UwVF+R/BIRy2G50IBhdqTYBQjGbHkFYFf+u6g7cID52KsvvVhxw8eJ2RtLUrxTXCuBpLJ4zCQbKCgX6D5+VgKTIKvBo4h8kUEJi3DLZxJ8r4M2cAMAIdpzZEvWGhLQFlIeziBRNoj/GdKldEHBo0/ECDaU9xJS/9KyCbowKIQbTRUeQMNQAPJN4Khkt4OUEu7GqgkZ9gWoDiwu67NbRLEwBsy07fBITI+R6YhkeSNeDSmRRZAMnByH5b2dCH4+rDfeAyfzde33Y8rFg+QL0ol6ggUdUjuhzRK+yNjbtInkTOk2jXv9muTZQJmBXSjRKsXpVrBpGytoTFp7FS/MO2QBXeEAYdKtSRDhJEr6eTaU602vzNs3KEAkRa108qXyRdx0h7y+BGFRC4HMiARAz2QksgyuXglUEibpgIpbJZyWA8lOpcZH/OhSr8rKwJjaY3QPBAvSrsdEacZM+BIf8pV1CKZSHtiVv7Sar8QWrUe5O2ufD9hpW9HoZDqSKZGA9BABiRigBgRCfolofySMrloJVBxDDtmqlJYSg6N8GtRBxdBt++dhDFaaEzaucbIvnOtkf4GeSBeBoFDbiJqc6k9JFMnCb4nLWUVWnU6TXv3PvreqWO8Hd6KBjVJVUK5bkHJoszZGNAqEeaBjAqIVJyl3IxOGB0I89MDoRM2gYmhB069DC/+ckkm2cEqjpoApIjXnKzBre+cgrLQwUAnfjL5Q1NiuDQk5PqX+irh8kUynuTgkN+RfhStIO6iT028w2ll7G9vuufoi3C+ABHRLtA/vmFkweHxu9CvluXPK2RGC30gyV3AQq0hgPxKLcH0gMrUZJH2VDenKwiyD7MnWrLyShC5LusDhq4TOJRE3nzzNphupmrThIlOcsWX9iVlurxMBXcheCoYBZEiOMbvkGnFXbbYZdXP3fyls/+5lvzrCiV88ur/SM8+fVXc7XwcWSkxh694NCDtceWOV5YiMC5anuMwJsGjiY6cFaRyilJCK6H5VR2nEDRRXT5HO8hET5vM3Gxmz4SasI6h5nbaEgzqQ64/aKdvFv5oDQ/HZZSG0DBFcMiHEjhkWpGofCPY2/haMWseRGsnIppoY4PbOnpP4IR/Uipjgld1wCt74GNBLSjjMS79UPXDx6Uhl/THpfmbAomed9z+oRjtZaw14FwcwMsnOnDm1VjuKSIaHw9g166qKnu0O3KpqFjQLAJDCaDJc2R1owAO+dBuW2AyXvpmaWTzX673p5vrBoiI9vFFS6e/VAmi36/UEIBSDpKDKxklOsdjFyezNJcdBJQEC/QmCNC/mqLfVdi7EKi4jo5XhNbmBoqUFrtFYOTsJ1O5Gpqa9DeUmvSD499XaiI4nz9+FNZJ66550sLi/s89s/TRd08/FbbjregF3yD3oEnvjH6IMbXQgH/ILwly6Djzlm6dKrag/JNQHko6daH3FQhcZGddKlrpFoVyetO7R+3uFeaY/Aw5YTJlVQvTyR864DzzHw4OyUKVi/XIvSENMkuypEm8c+azJRb9YVCBkocm5qJpUdbroKmRyZHTpVIJmZ2tUXJQbW6kWesZlzSFPoU2K1tj1EYTpTUEEuVqkcxxMu2Q0cownJeak5804Gzkt/YbAggskMgn+e2XP+amnb/wS2I0KDHhVT0MTo7cKu2UXFzYZH1AKVCcXm3fZesbPtWLkKaMPRAYPX2gJJDAiZZpls4WI1H+RlCf/Bz5nI2CQ7RhgIjMNjVaw06Ptu/ws86nPZdfSc67qE3kmzy9rDwIrPVQalZBLVCIDDBUeJfzLUo+OypShZF7hPuVLwZ7Gl8z61zn818azgsgQwaoRnrkquXT8x+rufEdzBWjxoHTur4EikwKjz1MAxz9HxbsvIe5jsUQrf/m5yI14GgtQt/EdcnVBoZ8Dc2tul0WchHcK6oj96SjVz5t+jnff2Gx8aXnAUS/Tw+uGP/zrjN6dyfyDyydg3B5XiVmYUf5BN5NVAaLqb6MMCHvNRmSdZOlCPscv6cJJj1Dz5IDpr5oykB9h2hK4VIKNOZS2z/AvcaHobnnz276p1cOXig4RBekQUT2rlDjwDudhTucJPqg7/BrfV+UaZOFX0JN8pX5uXoniKM1p5gj2ZTpAhcRTq2kf8l0RZBMKUlYmGTek5lf+jealbdl0T2nC/3nJxcMkKFBQIXd1o1Z0v1dT/D9rpNtM2C5HpOO2tH7jdgQPRa9TWGZrvIKuZtFgeKeypj7sOuX/oeKXUVgDB9wgXTRADJUBIp+lBcswN7uQnsfzrZvxDLHW3w3243Sy91sBNpafRIgiOI8roAezZhzBDz/YH28cYBqyFQmLY4JF5EuOkCGBjEt/5dQ+6VJudUWFyczwae9LL2KZ1mDJh6oK1X1hIPeBdqe47S44z5PS+KI5Cwt6vFpvmhqx5cSGEOXDCBDg/79li2MnTLY9wwKzWv1dSnokgM0iIb9z7L10Gv+f81+Hf4VHgFmQCt+/qrp/wGQ0vLk2iGtOwAAAABJRU5ErkJggg==", Ag = "data:image/png;base64,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", wg = "data:image/png;base64,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", kg = "data:image/png;base64,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", Sg = "data:image/png;base64,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", Cg = "data:image/png;base64,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", Eg = "data:image/png;base64,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";
function xg({
  story: e,
  active: t,
  onClose: n,
  onNextStory: r,
  onPreviousStory: i
}) {
  var D, T, Z, re, en, lt, xn, ot, tn, Au;
  const [l, o] = F.useState(0), [s, u] = F.useState(!1), [c, g] = F.useState(!1), [h, m] = F.useState(""), [v, w] = F.useState(!1), [C, P] = F.useState(!1), [f, a] = F.useState(0), [d, y] = F.useState(!1), A = F.useRef(null), B = F.useRef(null), x = F.useRef(null);
  F.useEffect(() => {
    t && e.content[l].type === "video" || e.content[l].type === "video" && l > 0 ? A.current && (A.current.currentTime = 0, A.current.play()) : (t && e.content[l].type === "image" || e.content[l].type === "image" && l > 0) && u(!0);
  }, [t, e, l]), F.useEffect(() => {
    C && setTimeout(() => P(!1), 2e3);
  }, [C]), F.useEffect(() => {
    e.poll_enabled && e.polls !== null && (jm(e.polls.id) !== null ? y(!1) : y(!0));
  }, [e]), F.useEffect(() => {
    g(e.widgets[0].muted);
  }, [e]), F.useEffect(() => {
    (async () => {
      e && t && (await Nm(e.customer_id, e.id), e.analytics_enabled && Rn("story_viewed", {
        story_id: e.id,
        story_name: e.name,
        widget_id: e.widgets[0].id
      }));
    })();
  }, [e, t]);
  const k = F.useCallback(() => {
    var O;
    (O = A.current) == null || O.pause(), g(!1), o(0), u(!1), h.length > 0 && m(""), a(0), e.analytics_enabled && Rn("story_closed", {
      story_id: e.id,
      story_name: e.name,
      widget_id: e.widgets[0].id
    }), n();
  }, [e, n, h]);
  F.useEffect(() => {
    const O = (ce) => {
      t && ce.code === "Escape" && k();
    };
    return document.addEventListener("keyup", O), () => document.removeEventListener("keyup", O);
  }, [t, k]);
  const j = F.useCallback(() => {
    e.content[l].type === "video" ? A.current && (s ? A.current.pause() : A.current.play()) : u((O) => !O);
  }, [e, l, s]), L = F.useCallback(() => {
    e.content[l].type === "video" ? A.current && (s || A.current.play()) : u(!0);
  }, [e, l, s]), M = F.useCallback(() => {
    e.content[l].type === "video" ? A.current && s && A.current.pause() : u(!1);
  }, [e, l, s]), K = F.useCallback(() => {
    a(0), l < e.content.length - 1 ? o((O) => O + 1) : (o(0), h.length > 0 && m(""), r() && k());
  }, [l, e, h, r, k]), Ne = F.useCallback(() => {
    a(0), l > 0 ? o((O) => O - 1) : (o(0), h.length > 0 && m(""), i() && k());
  }, [l, h, i, k]);
  F.useEffect(() => (e.content[l].type === "image" && t && s && (B.current = setTimeout(() => {
    K(), e.analytics_enabled && Rn("finished_viewing", {
      story_id: e.id,
      story_name: e.name,
      widget_id: e.widgets[0].id
    });
  }, 5e3)), () => {
    B.current && (clearTimeout(B.current), B.current = null);
  }), [e, t, l, s, K]), F.useEffect(() => (e.content[l].type === "image" && t && s && (a(0), x.current = setInterval(() => {
    a((ce) => {
      const He = Math.min(100, ce + 2);
      return He >= 100 && x.current && clearInterval(x.current), He;
    });
  }, 100)), () => {
    x.current && (clearInterval(x.current), x.current = null);
  }), [e, t, l, s]);
  const En = (O) => {
    const {
      offsetWidth: ce,
      offsetHeight: He,
      offsetLeft: Ar,
      offsetTop: Ul
    } = O.currentTarget, zl = O.clientX - Ar, vi = O.clientY - Ul, kd = ce * 0.2, Sd = ce * 0.8, Cd = He * 0.1, Ed = He * 0.9;
    return {
      clickX: zl,
      clickY: vi,
      leftRegionWidth: kd,
      rightRegionStart: Sd,
      topNonInteractiveHeight: Cd,
      bottomNonInteractiveStart: Ed
    };
  }, jl = (O) => {
    const {
      clickX: ce,
      clickY: He,
      leftRegionWidth: Ar,
      rightRegionStart: Ul,
      topNonInteractiveHeight: zl,
      bottomNonInteractiveStart: vi
    } = En(O);
    He < zl || e.cta_link && He > vi || e.replies_enabled && He > vi || (ce < Ar ? Ne() : ce > Ul ? K() : j());
  }, yr = () => {
    e.cta_link && (e.content[l].type === "video" && A.current ? A.current.pause() : u(!1), window.open(e.cta_link, "_blank"), e.analytics_enabled && Rn("cta_pressed", {
      story_id: e.id,
      story_name: e.name,
      widget_id: e.widgets[0].id
    }));
  }, vr = async () => {
    h.length !== 0 && (e && (m(""), P(!0), await Oa(e.customer_id, e.id, h)), h.length > 0 && m(""));
  }, R = async (O) => {
    e && (w(!1), P(!0), h.length > 0 && m(""), await Oa(e.customer_id, e.id, O)), h.length > 0 && m("");
  };
  return /* @__PURE__ */ S.jsxs("div", { className: U.playerContainer, children: [
    /* @__PURE__ */ S.jsx(
      "button",
      {
        onClick: Ne,
        className: U.navigationButton,
        children: /* @__PURE__ */ S.jsx(Pg, {})
      }
    ),
    /* @__PURE__ */ S.jsxs("div", { className: U.coolstoryPlayer, onClick: jl, children: [
      v && /* @__PURE__ */ S.jsx("div", { className: U.filterLayer, children: e.quick_reactions && /* @__PURE__ */ S.jsxs("div", { className: U.quickReactions, children: [
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("tears_of_joy"),
            children: /* @__PURE__ */ S.jsx("img", { src: yg, alt: "Face with tears of joy" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("open_mouth"),
            children: /* @__PURE__ */ S.jsx("img", { src: vg, alt: "face with open mouth" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("heart_eyes"),
            children: /* @__PURE__ */ S.jsx("img", { src: Ag, alt: "Face with heart eyes" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("crying_face"),
            children: /* @__PURE__ */ S.jsx("img", { src: wg, alt: "Crying face" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("clapping_hands"),
            children: /* @__PURE__ */ S.jsx("img", { src: kg, alt: "Clapping hands" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("fire"),
            children: /* @__PURE__ */ S.jsx("img", { src: Sg, alt: "Fire" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("party_popper"),
            children: /* @__PURE__ */ S.jsx("img", { src: Cg, alt: "Party popper" })
          }
        ),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.quickReactionButton,
            onClick: async () => await R("hundred"),
            children: /* @__PURE__ */ S.jsx("img", { src: Eg, alt: "Hundred" })
          }
        )
      ] }) }),
      C && /* @__PURE__ */ S.jsx("p", { className: U.toast, children: "Reply sent!" }),
      /* @__PURE__ */ S.jsx("svg", { width: 0, height: 0, children: /* @__PURE__ */ S.jsxs(
        "filter",
        {
          id: "blur-n-scale",
          y: "-50%",
          x: "-50%",
          width: "200%",
          height: "200%",
          children: [
            /* @__PURE__ */ S.jsx(
              "feGaussianBlur",
              {
                in: "SourceGraphic",
                stdDeviation: 20,
                result: "blurred"
              }
            ),
            /* @__PURE__ */ S.jsx("feColorMatrix", { type: "saturate", in: "blurred", values: "4" }),
            /* @__PURE__ */ S.jsx("feComposite", { in: "SourceGraphic", operator: "over" })
          ]
        }
      ) }),
      /* @__PURE__ */ S.jsxs("div", { className: U.topBar, children: [
        /* @__PURE__ */ S.jsx("div", { className: U.progressBar, children: e.content.map((O, ce) => /* @__PURE__ */ S.jsx(
          "div",
          {
            className: [
              U.progressBarItem,
              ce < l ? U.progressBarItem_viewed : ""
            ].join(" "),
            children: /* @__PURE__ */ S.jsx(
              "div",
              {
                className: U.progressBarItem_active,
                style: {
                  width: ce === l ? `${f}%` : 0
                }
              }
            )
          },
          O.id
        )) }),
        /* @__PURE__ */ S.jsxs("div", { className: U.controlsBar, children: [
          /* @__PURE__ */ S.jsx(
            "button",
            {
              onClick: k,
              className: U.controlsButton,
              children: /* @__PURE__ */ S.jsx(Bg, { color: (D = e.color_schema) == null ? void 0 : D.close_button })
            }
          ),
          /* @__PURE__ */ S.jsxs("div", { className: U.playerControls, children: [
            /* @__PURE__ */ S.jsx(
              "button",
              {
                onClick: j,
                className: U.controlsButton,
                children: s ? /* @__PURE__ */ S.jsx(Ig, { color: (T = e.color_schema) == null ? void 0 : T.play_pause_button }) : /* @__PURE__ */ S.jsx(Rg, { color: (Z = e.color_schema) == null ? void 0 : Z.play_pause_button })
              }
            ),
            /* @__PURE__ */ S.jsx(
              "button",
              {
                onClick: () => g((O) => !O),
                className: U.controlsButton,
                children: c ? /* @__PURE__ */ S.jsx(Mg, { color: (re = e.color_schema) == null ? void 0 : re.mute_unmute_button }) : /* @__PURE__ */ S.jsx(Qg, { color: (en = e.color_schema) == null ? void 0 : en.mute_unmute_button })
              }
            )
          ] })
        ] })
      ] }),
      e.content[l].type === "image" ? /* @__PURE__ */ S.jsx(
        "img",
        {
          src: e.content[l].url,
          alt: "Story content",
          className: U.storyContent,
          decoding: "async",
          loading: "lazy"
        }
      ) : /* @__PURE__ */ S.jsx(
        "video",
        {
          ref: A,
          src: e.content[l].url,
          controls: !1,
          disablePictureInPicture: !0,
          playsInline: !0,
          loop: !1,
          muted: c,
          onPlay: () => u(!0),
          onPause: () => u(!1),
          onEnded: () => {
            a(0), K(), e.analytics_enabled && Rn("finished_viewing", {
              story_id: e.id,
              story_name: e.name,
              widget_id: e.widgets[0].id
            });
          },
          className: U.storyContent,
          onTimeUpdate: (O) => {
            const ce = Math.min(
              100,
              O.currentTarget.currentTime / O.currentTarget.duration * 100
            );
            a(ce);
          }
        }
      ),
      e.poll_enabled && e.polls !== null && d && /* @__PURE__ */ S.jsxs(
        "div",
        {
          className: U.poll,
          style: {
            backgroundColor: ((lt = e.color_schema) == null ? void 0 : lt.poll_body_bg) ?? "#FFFFFF"
          },
          children: [
            /* @__PURE__ */ S.jsx(
              "p",
              {
                className: U.pollQuestion,
                style: {
                  color: ((xn = e.color_schema) == null ? void 0 : xn.poll_question_text) ?? "#FFFFFF",
                  backgroundColor: ((ot = e.color_schema) == null ? void 0 : ot.poll_question_bg) ?? "#0f1318"
                },
                children: e.polls.question
              }
            ),
            /* @__PURE__ */ S.jsx("ul", { className: U.pollOptionsList, children: e.polls.options.map((O) => {
              var ce, He;
              return /* @__PURE__ */ S.jsx("li", { children: /* @__PURE__ */ S.jsx(
                "button",
                {
                  className: U.pollOptionButton,
                  style: {
                    color: ((ce = e.color_schema) == null ? void 0 : ce.poll_option_text) ?? "#0f1318",
                    background: ((He = e.color_schema) == null ? void 0 : He.poll_option_bg) ?? "none"
                  },
                  onClick: async (Ar) => {
                    Ar.stopPropagation(), e.polls && (Om(e.polls.id, O.id), y(!1), await Tm(
                      e.customer_id,
                      e.polls.id,
                      O.id
                    ), P(!0));
                  },
                  children: O.text
                }
              ) }, O.id);
            }) })
          ]
        }
      ),
      e.replies_enabled && /* @__PURE__ */ S.jsx("div", { className: U.replySection, children: /* @__PURE__ */ S.jsxs("div", { className: U.replyInputContainer, children: [
        /* @__PURE__ */ S.jsx(
          "input",
          {
            type: "text",
            placeholder: "Write your reply here",
            value: h || "",
            onChange: (O) => m(O.currentTarget.value),
            onFocus: () => {
              w(!0), M();
            },
            onBlur: (O) => {
              O.relatedTarget && O.relatedTarget.className.includes("quickReactionButton") || (w(!1), L());
            },
            className: U.replyInput
          }
        ),
        h.length > 0 && /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.sendButton,
            onClick: vr,
            children: /* @__PURE__ */ S.jsx(Dg, {})
          }
        )
      ] }) }),
      e.cta_enabled && e.cta_link && /* @__PURE__ */ S.jsxs("div", { className: U.cta, children: [
        /* @__PURE__ */ S.jsx(Ng, {}),
        /* @__PURE__ */ S.jsx(
          "button",
          {
            className: U.ctaButton,
            onClick: yr,
            style: {
              color: ((tn = e.color_schema) == null ? void 0 : tn.cta_text) ?? "#0f1318",
              backgroundColor: ((Au = e.color_schema) == null ? void 0 : Au.cta_bg) ?? "#FFFFFF"
            },
            children: e.cta_button_text ? e.cta_button_text : "Learn more"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ S.jsx(
      "button",
      {
        onClick: K,
        className: U.navigationButton,
        children: /* @__PURE__ */ S.jsx(Fg, {})
      }
    )
  ] });
}
function Bg({ color: e }) {
  return /* @__PURE__ */ S.jsx("svg", { width: "16", height: "16", viewBox: "0 0 14 14", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M13 1L1 13M1 1L13 13",
      stroke: e ?? "#FFFFFF",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Rg({ color: e }) {
  return /* @__PURE__ */ S.jsx("svg", { width: "16", height: "18", viewBox: "0 0 16 20", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M1 1L15 10L1 19V1Z",
      stroke: e ?? "#FFFFFF",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Ig({ color: e }) {
  return /* @__PURE__ */ S.jsxs("svg", { width: "14", height: "18", viewBox: "0 0 14 18", fill: "none", children: [
    /* @__PURE__ */ S.jsx(
      "path",
      {
        d: "M5 1H1V17H5V1Z",
        stroke: e ?? "#FFFFFF",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ S.jsx(
      "path",
      {
        d: "M13 1H9V17H13V1Z",
        stroke: e ?? "#FFFFFF",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function Qg({ color: e }) {
  return /* @__PURE__ */ S.jsx("svg", { width: "22", height: "18", viewBox: "0 0 22 18", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M18.07 1.93005C19.9447 3.80533 20.9979 6.34841 20.9979 9.00005C20.9979 11.6517 19.9447 14.1948 18.07 16.0701M14.54 5.46005C15.4774 6.39769 16.0039 7.66923 16.0039 8.99505C16.0039 10.3209 15.4774 11.5924 14.54 12.5301M10 2.00005L5 6.00005H1V12.0001H5L10 16.0001V2.00005Z",
      stroke: e ?? "#FFFFFF",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Mg({ color: e }) {
  return /* @__PURE__ */ S.jsx("svg", { width: "22", height: "18", viewBox: "0 0 23 16", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M22 5L16 11M16 5L22 11M10 1L5 5H1V11H5L10 15V1Z",
      stroke: e ?? "#FFFFFF",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Pg() {
  return /* @__PURE__ */ S.jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M15 8H1M1 8L8 15M1 8L8 1",
      stroke: "#0f1318",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Fg() {
  return /* @__PURE__ */ S.jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M1 8H15M15 8L8 1M15 8L8 15",
      stroke: "#0f1318",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Ng() {
  return /* @__PURE__ */ S.jsx(
    "svg",
    {
      width: "14",
      height: "16",
      viewBox: "0 0 14 8",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ S.jsx(
        "path",
        {
          d: "M13 7L7 1L1 7",
          stroke: "#FFFFFF",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: /* @__PURE__ */ S.jsx(
            "animateTransform",
            {
              attributeName: "transform",
              type: "translate",
              from: "0,0",
              to: "0,-3",
              dur: "1s",
              repeatCount: "indefinite",
              keyTimes: "0;0.5;1",
              values: "0,0;0,-3;0,0"
            }
          )
        }
      )
    }
  );
}
function Dg() {
  return /* @__PURE__ */ S.jsx("svg", { width: "22", height: "22", viewBox: "0 0 22 22", fill: "none", children: /* @__PURE__ */ S.jsx(
    "path",
    {
      d: "M21 1L10 12M21 1L14 21L10 12M21 1L1 8L10 12",
      stroke: "#FFFFFF",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
const Lg = "_container_1ui76_1", Tg = "_storyList_1ui76_6", Og = "_storyListItem_1ui76_17", jg = "_storyListItemName_1ui76_24", Ug = "_modal_1ui76_37", zg = "_modalSolid_1ui76_49", Hg = "_modalBlurred_1ui76_53", Gg = "_modalOpen_1ui76_1", Yg = "_close_1ui76_63", Vg = "_modalClose_1ui76_1", Kg = "_modalFullScreen_1ui76_89", Wg = "_modalWithMargins_1ui76_97", Jg = "_responseInput_1ui76_127", Xg = "_sendResponseButton_1ui76_137", qg = "_toast_1ui76_163", Zg = "_skeleton_1ui76_176", bg = "_shimmer_1ui76_1", Be = {
  container: Lg,
  storyList: Tg,
  storyListItem: Og,
  storyListItemName: jg,
  modal: Ug,
  modalSolid: zg,
  modalBlurred: Hg,
  modalOpen: Gg,
  close: Yg,
  modalClose: Vg,
  modalFullScreen: Kg,
  modalWithMargins: Wg,
  responseInput: Jg,
  sendResponseButton: Xg,
  toast: qg,
  skeleton: Zg,
  shimmer: bg
}, _g = F.forwardRef(function({ uid: e, wid: t, customTriggered: n, segmentationConfig: r }, i) {
  var x, k, j, L;
  const { data: l, isPending: o } = Bh({
    queryKey: ["stories", e, t],
    queryFn: () => Lm(e, t, r)
  }), [s, u] = F.useState(!1), [c, g] = F.useState(null), h = F.useRef(null), m = F.useRef(null), v = F.useRef(!1), w = F.useRef(0), C = F.useRef(0);
  F.useEffect(() => {
    t && Um(e, t);
  }, [e, t]), F.useImperativeHandle(
    i,
    () => ({
      showStory(M) {
        const K = l == null ? void 0 : l.find((Ne) => Ne.id === M);
        if (!K)
          throw new Error(
            `Story with provided ID: ${M} does not exist.`
          );
        P(K);
      }
    }),
    [l]
  );
  const P = (M, K) => {
    g(M), u(!0), h.current && K ? (h.current.classList.remove(Be.close), h.current.style.transformOrigin = `${K.clientX}px ${K.clientY}px`, h.current.showModal()) : h.current && (h.current.classList.remove(Be.close), h.current.showModal()), M.analytics_enabled && Rn("story_clicked", {
      story_id: M.id,
      story_name: M.name,
      widget_id: M.widgets[0].id
    }), M.behaviour === "view_once" && !ws(M.id) && Dm(M.id);
  }, f = () => {
    var M;
    (M = h.current) == null || M.classList.add(Be.close), u(!1), setTimeout(() => {
      var K;
      (K = h.current) == null || K.close();
    }, 200);
  }, a = () => {
    if (l && c) {
      const M = l == null ? void 0 : l.findIndex(
        (K) => K.id === (c == null ? void 0 : c.id)
      );
      if (M === l.length - 1)
        return !0;
      M < l.length - 1 && g(l[M + 1]);
    }
  }, d = () => {
    if (l && c) {
      const M = l == null ? void 0 : l.findIndex(
        (K) => K.id === (c == null ? void 0 : c.id)
      );
      if (M === 0)
        return !0;
      M > 0 && g(l[M - 1]);
    }
  }, y = (M) => {
    m.current && (v.current = !0, w.current = M.clientX, C.current = m.current.scrollLeft, m.current.style.scrollBehavior = "auto");
  }, A = () => {
    v.current = !1;
  }, B = (M) => {
    if (!v.current || !m.current) return;
    M.preventDefault();
    const K = M.clientX - w.current;
    m.current.scrollLeft = C.current - K;
  };
  return l ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
    /* @__PURE__ */ S.jsxs(
      "ul",
      {
        className: Be.storyList,
        style: { display: n ? "none" : "flex" },
        ref: m,
        onMouseDown: y,
        onMouseLeave: A,
        onMouseUp: A,
        onMouseMove: B,
        children: [
          o && !n && /* @__PURE__ */ S.jsx("li", { className: Be.skeleton }),
          l.length > 0 && (l == null ? void 0 : l.map((M) => {
            var Ne;
            const K = M.widgets[0].autoplay && M.content[0].animated_preview_url ? M.content[0].animated_preview_url : M.thumbnail.url;
            if (!(M.behaviour === "view_once" && ws(M.id)))
              return /* @__PURE__ */ S.jsxs("li", { className: Be.storyListItem, children: [
                /* @__PURE__ */ S.jsx(
                  Ym,
                  {
                    preview: K,
                    bezelColor: M.widgets[0].bezel_color,
                    onClick: (En) => P(M, En)
                  }
                ),
                M.widgets[0].story_name && /* @__PURE__ */ S.jsx(
                  "p",
                  {
                    className: Be.storyListItemName,
                    style: {
                      color: ((Ne = M.color_schema) == null ? void 0 : Ne.story_name) ?? "inherit"
                    },
                    children: M.name
                  }
                )
              ] }, M.id);
          }))
        ]
      }
    ),
    /* @__PURE__ */ S.jsx(
      "dialog",
      {
        ref: h,
        className: [
          Be.modal,
          (k = (x = l[0]) == null ? void 0 : x.widgets[0]) != null && k.smaller_player ? Be.modalWithMargins : Be.modalFullScreen,
          (L = (j = l[0]) == null ? void 0 : j.widgets[0]) != null && L.blur ? Be.modalBlurred : Be.modalSolid
        ].join(" "),
        children: c && /* @__PURE__ */ S.jsx(
          xg,
          {
            story: c,
            active: s,
            onClose: f,
            onNextStory: a,
            onPreviousStory: d
          }
        )
      }
    )
  ] }) : /* @__PURE__ */ S.jsx("div", { className: Be.skeleton });
}), $g = new uh(), Ol = document.createElement("link");
Ol.href = "https://app.coolstory.me/widget/style.css";
Ol.rel = "stylesheet";
Ol.type = "text/css";
document.head.appendChild(Ol);
const wd = F.forwardRef(function(e, t) {
  return /* @__PURE__ */ S.jsx(F.StrictMode, { children: /* @__PURE__ */ S.jsx(hh, { client: $g, children: /* @__PURE__ */ S.jsx(
    _g,
    {
      uid: e.uid,
      wid: e.wid,
      ref: t,
      customTriggered: e.customTriggered,
      segmentationConfig: e.segmentationConfig
    }
  ) }) });
});
class ey {
  constructor() {
    this.containers = /* @__PURE__ */ new Map(), this.segmentationConfig = null;
  }
  /**
   * Embeds a new widget into the specified container.
   * Ensures any existing widget instance in the same container is cleaned up before rendering.
   */
  embedWidget({
    uid: t,
    wid: n,
    customTriggered: r,
    container: i
  }) {
    this.cleanup(i);
    const l = F.createRef(), o = Ad(i);
    try {
      o.render(
        /* @__PURE__ */ S.jsx(
          wd,
          {
            uid: t,
            wid: n,
            ref: l,
            customTriggered: r,
            segmentationConfig: this.segmentationConfig
          }
        )
      );
    } catch (s) {
      console.error("Failed to render widget:", s);
    }
    return this.containers.set(i, { root: o, ref: l }), {
      showStory: (s) => {
        var u;
        (u = l.current) == null || u.showStory(s);
      }
    };
  }
  fetchUserData(t) {
    return Promise.resolve(t()).then((r) => (this.segmentationConfig = r, r)).catch((r) => (console.warn("No metadata provided:", r), this.segmentationConfig = null, null));
  }
  /**
   * Cleans up a single container by unmounting its widget and removing it from the map.
   */
  cleanup(t) {
    const n = this.containers.get(t);
    if (n) {
      try {
        n.root.unmount();
      } catch (r) {
        console.debug("Cleanup of existing widget instance failed:", r);
      }
      this.containers.delete(t);
    }
  }
  /**
   * Cleans up all active widget instances.
   */
  cleanupAll() {
    this.containers.forEach((t, n) => {
      this.cleanup(n);
    }), this.containers.clear();
  }
}
const ks = new ey();
document.addEventListener("DOMContentLoaded", () => {
  const e = Fm(), t = document.querySelectorAll("[data-coolstory-id]");
  e && t.length && t.forEach((n) => {
    const r = n.getAttribute("data-coolstory-id");
    n.querySelector(`.${Be.storyList}`) || ks.embedWidget({
      uid: e,
      wid: r,
      container: n
    });
  });
});
const ty = {
  embedWidget: (e) => ks.embedWidget(e),
  fetchUserData: (e) => ks.fetchUserData(e),
  WidgetRoot: wd
};
window.coolstory || (window.coolstory = ty);
export {
  ty as default
};
