// node_modules/svelte/internal/index.mjs
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
var is_client = typeof window !== "undefined";
var tasks = new Set();
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function element(name) {
  return document.createElement(name);
}
function text(data2) {
  return document.createTextNode(data2);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data2) {
  data2 = "" + data2;
  if (text2.wholeText !== data2)
    text2.data = data2;
}
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
var active_docs = new Set();
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
var flushing = false;
var seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var outroing = new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor) {
  const {fragment, on_mount, on_destroy, after_update} = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = on_mount.map(run).filter(is_function);
    if (on_destroy) {
      on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance4, create_fragment4, not_equal, props, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const prop_values = options.props || {};
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    before_update: [],
    after_update: [],
    context: new Map(parent_component ? parent_component.$$.context : []),
    callbacks: blank_object(),
    dirty,
    skip_bound: false
  };
  let ready = false;
  $$.ctx = instance4 ? instance4(component, prop_values, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment4 ? create_fragment4($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    flush();
  }
  set_current_component(parent_component);
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: "open"});
    }
    connectedCallback() {
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};

// src/menu.svelte
function create_fragment(ctx) {
  let br0;
  let t0;
  let label0;
  let t1;
  let select;
  let option0;
  let option1;
  let option2;
  let t5;
  let label1;
  let t6;
  let input;
  let t7;
  let br1;
  let t8;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      br0 = element("br");
      t0 = space();
      label0 = element("label");
      t1 = text("Flag count:\n    ");
      select = element("select");
      option0 = element("option");
      option0.textContent = "10 flags";
      option1 = element("option");
      option1.textContent = "25 flags";
      option2 = element("option");
      option2.textContent = "197 flags";
      t5 = space();
      label1 = element("label");
      t6 = text("Timed:\n    ");
      input = element("input");
      t7 = space();
      br1 = element("br");
      t8 = space();
      button = element("button");
      button.textContent = "Start";
      option0.__value = "10";
      option0.value = option0.__value;
      option1.selected = "selected";
      option1.__value = "25";
      option1.value = option1.__value;
      option2.__value = "197";
      option2.value = option2.__value;
      if (ctx[0] === void 0)
        add_render_callback(() => ctx[3].call(select));
      attr(input, "type", "checkbox");
      attr(input, "name", "scales");
    },
    m(target, anchor) {
      insert(target, br0, anchor);
      insert(target, t0, anchor);
      insert(target, label0, anchor);
      append(label0, t1);
      append(label0, select);
      append(select, option0);
      append(select, option1);
      append(select, option2);
      select_option(select, ctx[0]);
      insert(target, t5, anchor);
      insert(target, label1, anchor);
      append(label1, t6);
      append(label1, input);
      input.checked = ctx[1];
      insert(target, t7, anchor);
      insert(target, br1, anchor);
      insert(target, t8, anchor);
      insert(target, button, anchor);
      if (!mounted) {
        dispose = [
          listen(select, "change", ctx[3]),
          listen(input, "change", ctx[4]),
          listen(button, "click", ctx[2])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        select_option(select, ctx2[0]);
      }
      if (dirty & 2) {
        input.checked = ctx2[1];
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(br0);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(label0);
      if (detaching)
        detach(t5);
      if (detaching)
        detach(label1);
      if (detaching)
        detach(t7);
      if (detaching)
        detach(br1);
      if (detaching)
        detach(t8);
      if (detaching)
        detach(button);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  const dispatch = createEventDispatcher();
  let flagcount;
  let timerenabled = true;
  function startgame() {
    dispatch("startgame", {count: flagcount, timerenabled});
  }
  function select_change_handler() {
    flagcount = select_value(this);
    $$invalidate(0, flagcount);
  }
  function input_change_handler() {
    timerenabled = this.checked;
    $$invalidate(1, timerenabled);
  }
  return [
    flagcount,
    timerenabled,
    startgame,
    select_change_handler,
    input_change_handler
  ];
}
var Menu = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
};
var menu_default = Menu;

// src/data.js
var countryflags = [
  {
    name: "Afghanistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/1080px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png"
  },
  {
    name: "Albania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Flag_of_Albania.svg/1080px-Flag_of_Albania.svg.png"
  },
  {
    name: "Algeria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/1080px-Flag_of_Algeria.svg.png"
  },
  {
    name: "Andorra",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Andorra.svg/1080px-Flag_of_Andorra.svg.png"
  },
  {
    name: "Angola",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Flag_of_Angola.svg/1080px-Flag_of_Angola.svg.png"
  },
  {
    name: "Antigua and Barbuda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Antigua_and_Barbuda.svg/1080px-Flag_of_Antigua_and_Barbuda.svg.png"
  },
  {
    name: "Argentina",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1080px-Flag_of_Argentina.svg.png"
  },
  {
    name: "Armenia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flag_of_Armenia.svg/1080px-Flag_of_Armenia.svg.png"
  },
  {
    name: "Australia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1080px-Flag_of_Australia_%28converted%29.svg.png"
  },
  {
    name: "Austria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/1080px-Flag_of_Austria.svg.png"
  },
  {
    name: "Azerbaijan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Azerbaijan.svg/1080px-Flag_of_Azerbaijan.svg.png"
  },
  {
    name: "Bahamas",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flag_of_the_Bahamas.svg/1080px-Flag_of_the_Bahamas.svg.png"
  },
  {
    name: "Bahrain",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Bahrain.svg/1080px-Flag_of_Bahrain.svg.png"
  },
  {
    name: "Bangladesh",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/1080px-Flag_of_Bangladesh.svg.png"
  },
  {
    name: "Barbados",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1080px-Flag_of_Barbados.svg.png"
  },
  {
    name: "Belarus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Flag_of_Belarus.svg/1080px-Flag_of_Belarus.svg.png"
  },
  {
    name: "Belgium",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Belgium.svg/1080px-Flag_of_Belgium.svg.png"
  },
  {
    name: "Belize",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Flag_of_Belize.svg/1080px-Flag_of_Belize.svg.png"
  },
  {
    name: "Benin",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Benin.svg/1080px-Flag_of_Benin.svg.png"
  },
  {
    name: "Bhutan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Flag_of_Bhutan.svg/1080px-Flag_of_Bhutan.svg.png"
  },
  {
    name: "Bolivia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bandera_de_Bolivia_%28Estado%29.svg/1080px-Bandera_de_Bolivia_%28Estado%29.svg.png"
  },
  {
    name: "Bosnia and Herzegovina",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Flag_of_Bosnia_and_Herzegovina.svg/1080px-Flag_of_Bosnia_and_Herzegovina.svg.png"
  },
  {
    name: "Botswana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_Botswana.svg/1080px-Flag_of_Botswana.svg.png"
  },
  {
    name: "Brazil",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/1080px-Flag_of_Brazil.svg.png"
  },
  {
    name: "Brunei",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Brunei.svg/1080px-Flag_of_Brunei.svg.png"
  },
  {
    name: "Bulgaria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Bulgaria.svg/1080px-Flag_of_Bulgaria.svg.png"
  },
  {
    name: "Burkina Faso",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/1080px-Flag_of_Burkina_Faso.svg.png"
  },
  {
    name: "Burundi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Flag_of_Burundi.svg/1080px-Flag_of_Burundi.svg.png"
  },
  {
    name: "Cambodia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/1080px-Flag_of_Cambodia.svg.png"
  },
  {
    name: "Cameroon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Cameroon.svg/1080px-Flag_of_Cameroon.svg.png"
  },
  {
    name: "Canada",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/1080px-Flag_of_Canada.svg.png"
  },
  {
    name: "Cape Verde",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_Cape_Verde_%282-3_ratio%29.svg/1080px-Flag_of_Cape_Verde_%282-3_ratio%29.svg.png"
  },
  {
    name: "Central African Republic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Central_African_Republic.svg/1080px-Flag_of_the_Central_African_Republic.svg.png"
  },
  {
    name: "Chad",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Flag_of_Chad.svg/1080px-Flag_of_Chad.svg.png"
  },
  {
    name: "Chile",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1080px-Flag_of_Chile.svg.png"
  },
  {
    name: "China",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1080px-Flag_of_the_People%27s_Republic_of_China.svg.png"
  },
  {
    name: "Colombia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/1080px-Flag_of_Colombia.svg.png"
  },
  {
    name: "Comoros",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Flag_of_the_Comoros.svg/1080px-Flag_of_the_Comoros.svg.png"
  },
  {
    name: "Democratic Republic of the Congo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/1080px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png"
  },
  {
    name: "Republic of the Congo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_the_Republic_of_the_Congo.svg/1080px-Flag_of_the_Republic_of_the_Congo.svg.png"
  },
  {
    name: "Costa Rica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Costa_Rica_%28state%29.svg/1080px-Flag_of_Costa_Rica_%28state%29.svg.png"
  },
  {
    name: "Croatia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Croatia.svg/1080px-Flag_of_Croatia.svg.png"
  },
  {
    name: "Cuba",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Flag_of_Cuba.svg/1080px-Flag_of_Cuba.svg.png"
  },
  {
    name: "Cyprus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Cyprus.svg/1080px-Flag_of_Cyprus.svg.png"
  },
  {
    name: "Czechia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_Czech_Republic.svg/1080px-Flag_of_the_Czech_Republic.svg.png"
  },
  {
    name: "Denmark",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/1080px-Flag_of_Denmark.svg.png"
  },
  {
    name: "Djibouti",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_Djibouti.svg/1080px-Flag_of_Djibouti.svg.png"
  },
  {
    name: "Dominica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flag_of_Dominica.svg/1080px-Flag_of_Dominica.svg.png"
  },
  {
    name: "Dominican Republic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_the_Dominican_Republic.svg/1080px-Flag_of_the_Dominican_Republic.svg.png"
  },
  {
    name: "East Timor",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_East_Timor.svg/1080px-Flag_of_East_Timor.svg.png"
  },
  {
    name: "Ecuador",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/1080px-Flag_of_Ecuador.svg.png"
  },
  {
    name: "Egypt",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/1080px-Flag_of_Egypt.svg.png"
  },
  {
    name: "El Salvador",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_El_Salvador.svg/1080px-Flag_of_El_Salvador.svg.png"
  },
  {
    name: "Equatorial Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Equatorial_Guinea.svg/1080px-Flag_of_Equatorial_Guinea.svg.png"
  },
  {
    name: "Eritrea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/1080px-Flag_of_Eritrea.svg.png"
  },
  {
    name: "Estonia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flag_of_Estonia.svg/1080px-Flag_of_Estonia.svg.png"
  },
  {
    name: "Eswatini",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Flag_of_Eswatini.svg/1080px-Flag_of_Eswatini.svg.png"
  },
  {
    name: "Ethiopia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1080px-Flag_of_Ethiopia.svg.png"
  },
  {
    name: "Fiji",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Fiji.svg/1080px-Flag_of_Fiji.svg.png"
  },
  {
    name: "Finland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/1080px-Flag_of_Finland.svg.png"
  },
  {
    name: "France",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Flag_of_France_%281958%E2%80%931976%2C_2020-%29.svg/1080px-Flag_of_France_%281958%E2%80%931976%2C_2020-%29.svg.png"
  },
  {
    name: "Gabon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Flag_of_Gabon.svg/1080px-Flag_of_Gabon.svg.png"
  },
  {
    name: "Gambia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/1080px-Flag_of_The_Gambia.svg.png"
  },
  {
    name: "Georgia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/1080px-Flag_of_Georgia.svg.png"
  },
  {
    name: "Germany",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Flag_of_Germany_%283-2_aspect_ratio%29.svg/1080px-Flag_of_Germany_%283-2_aspect_ratio%29.svg.png"
  },
  {
    name: "Ghana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/1080px-Flag_of_Ghana.svg.png"
  },
  {
    name: "Greece",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/1080px-Flag_of_Greece.svg.png"
  },
  {
    name: "Grenada",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Grenada.svg/1080px-Flag_of_Grenada.svg.png"
  },
  {
    name: "Guatemala",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Guatemala.svg/1080px-Flag_of_Guatemala.svg.png"
  },
  {
    name: "Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Flag_of_Guinea.svg/1080px-Flag_of_Guinea.svg.png"
  },
  {
    name: "Guinea-Bissau",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Guinea-Bissau.svg/1080px-Flag_of_Guinea-Bissau.svg.png"
  },
  {
    name: "Guyana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_Guyana.svg/1080px-Flag_of_Guyana.svg.png"
  },
  {
    name: "Haiti",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Haiti.svg/1080px-Flag_of_Haiti.svg.png"
  },
  {
    name: "Honduras",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Flag_of_Honduras.svg/1080px-Flag_of_Honduras.svg.png"
  },
  {
    name: "Hungary",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Flag_of_Hungary.svg/1080px-Flag_of_Hungary.svg.png"
  },
  {
    name: "Iceland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Iceland.svg/1080px-Flag_of_Iceland.svg.png"
  },
  {
    name: "India",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1080px-Flag_of_India.svg.png"
  },
  {
    name: "Indonesia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1080px-Flag_of_Indonesia.svg.png"
  },
  {
    name: "Iran",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1080px-Flag_of_Iran.svg.png"
  },
  {
    name: "Iraq",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/1080px-Flag_of_Iraq.svg.png"
  },
  {
    name: "Ireland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/1080px-Flag_of_Ireland.svg.png"
  },
  {
    name: "Israel",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Israel.svg/1080px-Flag_of_Israel.svg.png"
  },
  {
    name: "Italy",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/1080px-Flag_of_Italy.svg.png"
  },
  {
    name: "Ivory Coast",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/1080px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png"
  },
  {
    name: "Jamaica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Jamaica.svg/1080px-Flag_of_Jamaica.svg.png"
  },
  {
    name: "Japan",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/1080px-Flag_of_Japan.svg.png"
  },
  {
    name: "Jordan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/1080px-Flag_of_Jordan.svg.png"
  },
  {
    name: "Kazakhstan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kazakhstan.svg/1080px-Flag_of_Kazakhstan.svg.png"
  },
  {
    name: "Kenya",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/1080px-Flag_of_Kenya.svg.png"
  },
  {
    name: "Kiribati",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kiribati.svg/1080px-Flag_of_Kiribati.svg.png"
  },
  {
    name: "Kuwait",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/1080px-Flag_of_Kuwait.svg.png"
  },
  {
    name: "Kyrgyzstan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Flag_of_Kyrgyzstan.svg/1080px-Flag_of_Kyrgyzstan.svg.png"
  },
  {
    name: "Laos",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Laos.svg/1080px-Flag_of_Laos.svg.png"
  },
  {
    name: "Latvia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Latvia.svg/1080px-Flag_of_Latvia.svg.png"
  },
  {
    name: "Lebanon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Flag_of_Lebanon.svg/1080px-Flag_of_Lebanon.svg.png"
  },
  {
    name: "Lesotho",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Flag_of_Lesotho.svg/1080px-Flag_of_Lesotho.svg.png"
  },
  {
    name: "Liberia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Flag_of_Liberia.svg/1080px-Flag_of_Liberia.svg.png"
  },
  {
    name: "Libya",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/1080px-Flag_of_Libya.svg.png"
  },
  {
    name: "Liechtenstein",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Flag_of_Liechtenstein.svg/1080px-Flag_of_Liechtenstein.svg.png"
  },
  {
    name: "Lithuania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Lithuania.svg/1080px-Flag_of_Lithuania.svg.png"
  },
  {
    name: "Luxembourg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/1080px-Flag_of_Luxembourg.svg.png"
  },
  {
    name: "Madagascar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Madagascar.svg/1080px-Flag_of_Madagascar.svg.png"
  },
  {
    name: "Malawi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Flag_of_Malawi.svg/1080px-Flag_of_Malawi.svg.png"
  },
  {
    name: "Malaysia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_of_Malaysia.svg/1080px-Flag_of_Malaysia.svg.png"
  },
  {
    name: "Maldives",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Maldives.svg/1080px-Flag_of_Maldives.svg.png"
  },
  {
    name: "Mali",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/1080px-Flag_of_Mali.svg.png"
  },
  {
    name: "Malta",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Malta.svg/1080px-Flag_of_Malta.svg.png"
  },
  {
    name: "Marshall Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Marshall_Islands.svg/1080px-Flag_of_the_Marshall_Islands.svg.png"
  },
  {
    name: "Mauritania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Flag_of_Mauritania.svg/1080px-Flag_of_Mauritania.svg.png"
  },
  {
    name: "Mauritius",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Mauritius.svg/1080px-Flag_of_Mauritius.svg.png"
  },
  {
    name: "Mexico",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/1080px-Flag_of_Mexico.svg.png"
  },
  {
    name: "Micronesia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg/1080px-Flag_of_the_Federated_States_of_Micronesia.svg.png"
  },
  {
    name: "Moldova",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/1080px-Flag_of_Moldova.svg.png"
  },
  {
    name: "Monaco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Flag_of_Monaco.svg/1080px-Flag_of_Monaco.svg.png"
  },
  {
    name: "Mongolia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Mongolia.svg/1080px-Flag_of_Mongolia.svg.png"
  },
  {
    name: "Montenegro",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Montenegro.svg/1080px-Flag_of_Montenegro.svg.png"
  },
  {
    name: "Morocco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/1080px-Flag_of_Morocco.svg.png"
  },
  {
    name: "Mozambique",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Mozambique.svg/1080px-Flag_of_Mozambique.svg.png"
  },
  {
    name: "Myanmar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/1080px-Flag_of_Myanmar.svg.png"
  },
  {
    name: "Namibia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Namibia.svg/1080px-Flag_of_Namibia.svg.png"
  },
  {
    name: "Nauru",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Flag_of_Nauru.svg/1080px-Flag_of_Nauru.svg.png"
  },
  {
    name: "Nepal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/98px-Flag_of_Nepal.svg.png"
  },
  {
    name: "Netherlands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1080px-Flag_of_the_Netherlands.svg.png"
  },
  {
    name: "New Zealand",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1080px-Flag_of_New_Zealand.svg.png"
  },
  {
    name: "Nicaragua",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Nicaragua.svg/1080px-Flag_of_Nicaragua.svg.png"
  },
  {
    name: "Niger",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Niger.svg/1080px-Flag_of_Niger.svg.png"
  },
  {
    name: "Nigeria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/1080px-Flag_of_Nigeria.svg.png"
  },
  {
    name: "North Korea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/1080px-Flag_of_North_Korea.svg.png"
  },
  {
    name: "North Macedonia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_North_Macedonia.svg/1080px-Flag_of_North_Macedonia.svg.png"
  },
  {
    name: "Norway",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_Norway_%28c81329_for_red_%26_14275b_for_blue%29.svg/1080px-Flag_of_Norway_%28c81329_for_red_%26_14275b_for_blue%29.svg.png"
  },
  {
    name: "Oman",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Oman.svg/1080px-Flag_of_Oman.svg.png"
  },
  {
    name: "Pakistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1080px-Flag_of_Pakistan.svg.png"
  },
  {
    name: "Palau",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Palau.svg/1080px-Flag_of_Palau.svg.png"
  },
  {
    name: "Palestine",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/1080px-Flag_of_Palestine.svg.png"
  },
  {
    name: "Panama",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Flag_of_Panama.svg/1080px-Flag_of_Panama.svg.png"
  },
  {
    name: "Papua New Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Flag_of_Papua_New_Guinea.svg/1080px-Flag_of_Papua_New_Guinea.svg.png"
  },
  {
    name: "Paraguay",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/1080px-Flag_of_Paraguay.svg.png"
  },
  {
    name: "Peru",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Flag_of_Peru_%28state%29.svg/1080px-Flag_of_Peru_%28state%29.svg.png"
  },
  {
    name: "Philippines",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_the_Philippines.svg/1080px-Flag_of_the_Philippines.svg.png"
  },
  {
    name: "Poland",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/1080px-Flag_of_Poland.svg.png"
  },
  {
    name: "Portugal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1080px-Flag_of_Portugal.svg.png"
  },
  {
    name: "Qatar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Qatar.svg/1080px-Flag_of_Qatar.svg.png"
  },
  {
    name: "Romania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Romania.svg/1080px-Flag_of_Romania.svg.png"
  },
  {
    name: "Russia",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/1080px-Flag_of_Russia.svg.png"
  },
  {
    name: "Rwanda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Rwanda.svg/1080px-Flag_of_Rwanda.svg.png"
  },
  {
    name: "Saint Kitts and Nevis",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Saint_Kitts_and_Nevis.svg/1080px-Flag_of_Saint_Kitts_and_Nevis.svg.png"
  },
  {
    name: "Saint Lucia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Saint_Lucia.svg/1080px-Flag_of_Saint_Lucia.svg.png"
  },
  {
    name: "Saint Vincent and the Grenadines",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Flag_of_Saint_Vincent_and_the_Grenadines.svg/1080px-Flag_of_Saint_Vincent_and_the_Grenadines.svg.png"
  },
  {
    name: "Samoa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Samoa.svg/1080px-Flag_of_Samoa.svg.png"
  },
  {
    name: "San Marino",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Flag_of_San_Marino.svg/1080px-Flag_of_San_Marino.svg.png"
  },
  {
    name: "S\xE3o Tom\xE9 and Pr\xEDncipe",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Sao_Tome_and_Principe.svg/1080px-Flag_of_Sao_Tome_and_Principe.svg.png"
  },
  {
    name: "Saudi Arabia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1080px-Flag_of_Saudi_Arabia.svg.png"
  },
  {
    name: "Senegal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/1080px-Flag_of_Senegal.svg.png"
  },
  {
    name: "Serbia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Flag_of_Serbia.svg/1080px-Flag_of_Serbia.svg.png"
  },
  {
    name: "Seychelles",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Seychelles.svg/1080px-Flag_of_Seychelles.svg.png"
  },
  {
    name: "Sierra Leone",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Sierra_Leone.svg/1080px-Flag_of_Sierra_Leone.svg.png"
  },
  {
    name: "Singapore",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1080px-Flag_of_Singapore.svg.png"
  },
  {
    name: "Slovakia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Slovakia.svg/1080px-Flag_of_Slovakia.svg.png"
  },
  {
    name: "Slovenia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Flag_of_Slovenia.svg/1080px-Flag_of_Slovenia.svg.png"
  },
  {
    name: "Solomon Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Flag_of_the_Solomon_Islands.svg/1080px-Flag_of_the_Solomon_Islands.svg.png"
  },
  {
    name: "Somalia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/1080px-Flag_of_Somalia.svg.png"
  },
  {
    name: "South Africa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/1080px-Flag_of_South_Africa.svg.png"
  },
  {
    name: "Sudan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Sudan.svg/1080px-Flag_of_Sudan.svg.png"
  },
  {
    name: "South Korea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1080px-Flag_of_South_Korea.svg.png"
  },
  {
    name: "South Sudan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_South_Sudan.svg/1080px-Flag_of_South_Sudan.svg.png"
  },
  {
    name: "Spain",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/1080px-Flag_of_Spain.svg.png"
  },
  {
    name: "Sri Lanka",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Sri_Lanka.svg/1080px-Flag_of_Sri_Lanka.svg.png"
  },
  {
    name: "Suriname",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Flag_of_Suriname.svg/1080px-Flag_of_Suriname.svg.png"
  },
  {
    name: "Sweden",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Flag_of_Sweden.svg/1080px-Flag_of_Sweden.svg.png"
  },
  {
    name: "Switzerland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/1080px-Flag_of_Switzerland.svg.png"
  },
  {
    name: "Syria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flag_of_Syria.svg/1080px-Flag_of_Syria.svg.png"
  },
  {
    name: "Tajikistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Tajikistan.svg/1080px-Flag_of_Tajikistan.svg.png"
  },
  {
    name: "Tanzania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/1080px-Flag_of_Tanzania.svg.png"
  },
  {
    name: "Thailand",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/1080px-Flag_of_Thailand.svg.png"
  },
  {
    name: "Togo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Togo.svg/1080px-Flag_of_Togo.svg.png"
  },
  {
    name: "Tonga",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Tonga.svg/1080px-Flag_of_Tonga.svg.png"
  },
  {
    name: "Trinidad and Tobago",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Trinidad_and_Tobago.svg/1080px-Flag_of_Trinidad_and_Tobago.svg.png"
  },
  {
    name: "Tunisia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/1080px-Flag_of_Tunisia.svg.png"
  },
  {
    name: "Turkey",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1080px-Flag_of_Turkey.svg.png"
  },
  {
    name: "Turkmenistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Turkmenistan.svg/1080px-Flag_of_Turkmenistan.svg.png"
  },
  {
    name: "Tuvalu",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tuvalu.svg/1080px-Flag_of_Tuvalu.svg.png"
  },
  {
    name: "Uganda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/1080px-Flag_of_Uganda.svg.png"
  },
  {
    name: "Ukraine",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/1080px-Flag_of_Ukraine.svg.png"
  },
  {
    name: "United Arab Emirates",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/1080px-Flag_of_the_United_Arab_Emirates.svg.png"
  },
  {
    name: "United Kingdom",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1080px-Flag_of_the_United_Kingdom.svg.png"
  },
  {
    name: "United States",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1080px-Flag_of_the_United_States.svg.png"
  },
  {
    name: "Uruguay",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/1080px-Flag_of_Uruguay.svg.png"
  },
  {
    name: "Uzbekistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/1080px-Flag_of_Uzbekistan.svg.png"
  },
  {
    name: "Vanuatu",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Flag_of_Vanuatu_%28official%29.svg/1080px-Flag_of_Vanuatu_%28official%29.svg.png"
  },
  {
    name: "Vatican City",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_the_Vatican_City.svg/1080px-Flag_of_the_Vatican_City.svg.png"
  },
  {
    name: "Venezuela",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Venezuela.svg/1080px-Flag_of_Venezuela.svg.png"
  },
  {
    name: "Vietnam",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1080px-Flag_of_Vietnam.svg.png"
  },
  {
    name: "Yemen",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Yemen.svg/1080px-Flag_of_Yemen.svg.png"
  },
  {
    name: "Zambia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Zambia.svg/1080px-Flag_of_Zambia.svg.png"
  },
  {
    name: "Zimbabwe",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1080px-Flag_of_Zimbabwe.svg.png"
  },
  {
    name: "Abkhazia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_the_Republic_of_Abkhazia.svg/1080px-Flag_of_the_Republic_of_Abkhazia.svg.png"
  },
  {
    name: "Artsakh",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Flag_of_Artsakh.svg/1080px-Flag_of_Artsakh.svg.png"
  },
  {
    name: "Cook Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_the_Cook_Islands.svg/1080px-Flag_of_the_Cook_Islands.svg.png"
  },
  {
    name: "Kosovo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/1080px-Flag_of_Kosovo.svg.png"
  },
  {
    name: "Niue",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Niue.svg/1080px-Flag_of_Niue.svg.png"
  },
  {
    name: "Northern Cyprus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg/1080px-Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg.png"
  },
  {
    name: "Somaliland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/1080px-Flag_of_Somaliland.svg.png"
  },
  {
    name: "South Ossetia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_South_Ossetia.svg/1080px-Flag_of_South_Ossetia.svg.png"
  },
  {
    name: "Taiwan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Flag_of_the_Republic_of_China.svg/1080px-Flag_of_the_Republic_of_China.svg.png"
  },
  {
    name: "Transnistria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Transnistria_%28state%29.svg/1080px-Flag_of_Transnistria_%28state%29.svg.png"
  },
  {
    name: "Western Sahara",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/1080px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png"
  }
];

// src/game.svelte
function add_css() {
  var style = element("style");
  style.id = "svelte-hvjeeu-style";
  style.textContent = ".redborder.svelte-hvjeeu{border:10px solid red}h1.svelte-hvjeeu{margin:0}img.svelte-hvjeeu{width:50%}.center.svelte-hvjeeu{width:50%}";
  append(document.head, style);
}
function create_fragment2(ctx) {
  let h1;
  let t1;
  let p;
  let t2;
  let t3;
  let img;
  let img_src_value;
  let t4;
  let br0;
  let t5;
  let button0;
  let t6_value = ctx[2][0].name + "";
  let t6;
  let button0_class_value;
  let t7;
  let br1;
  let t8;
  let button1;
  let t9_value = ctx[2][1].name + "";
  let t9;
  let button1_class_value;
  let t10;
  let br2;
  let t11;
  let button2;
  let t12_value = ctx[2][2].name + "";
  let t12;
  let button2_class_value;
  let t13;
  let br3;
  let t14;
  let button3;
  let t15_value = ctx[2][3].name + "";
  let t15;
  let button3_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      h1 = element("h1");
      h1.textContent = "What flag is this???";
      t1 = space();
      p = element("p");
      t2 = text(ctx[0]);
      t3 = space();
      img = element("img");
      t4 = space();
      br0 = element("br");
      t5 = space();
      button0 = element("button");
      t6 = text(t6_value);
      t7 = space();
      br1 = element("br");
      t8 = space();
      button1 = element("button");
      t9 = text(t9_value);
      t10 = space();
      br2 = element("br");
      t11 = space();
      button2 = element("button");
      t12 = text(t12_value);
      t13 = space();
      br3 = element("br");
      t14 = space();
      button3 = element("button");
      t15 = text(t15_value);
      attr(h1, "class", "center svelte-hvjeeu");
      attr(p, "class", "center svelte-hvjeeu");
      attr(img, "class", "center svelte-hvjeeu");
      if (img.src !== (img_src_value = ctx[1].url))
        attr(img, "src", img_src_value);
      attr(img, "alt", "flag");
      attr(button0, "class", button0_class_value = "" + (null_to_empty(ctx[2][0].isRed ? "redborder" : "") + " svelte-hvjeeu"));
      attr(button1, "class", button1_class_value = "" + (null_to_empty(ctx[2][1].isRed ? "redborder" : "") + " svelte-hvjeeu"));
      attr(button2, "class", button2_class_value = "" + (null_to_empty(ctx[2][2].isRed ? "redborder" : "") + " svelte-hvjeeu"));
      attr(button3, "class", button3_class_value = "" + (null_to_empty(ctx[2][3].isRed ? "redborder" : "") + " svelte-hvjeeu"));
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      insert(target, t1, anchor);
      insert(target, p, anchor);
      append(p, t2);
      insert(target, t3, anchor);
      insert(target, img, anchor);
      insert(target, t4, anchor);
      insert(target, br0, anchor);
      insert(target, t5, anchor);
      insert(target, button0, anchor);
      append(button0, t6);
      insert(target, t7, anchor);
      insert(target, br1, anchor);
      insert(target, t8, anchor);
      insert(target, button1, anchor);
      append(button1, t9);
      insert(target, t10, anchor);
      insert(target, br2, anchor);
      insert(target, t11, anchor);
      insert(target, button2, anchor);
      append(button2, t12);
      insert(target, t13, anchor);
      insert(target, br3, anchor);
      insert(target, t14, anchor);
      insert(target, button3, anchor);
      append(button3, t15);
      if (!mounted) {
        dispose = [
          listen(button0, "click", ctx[6]),
          listen(button1, "click", ctx[7]),
          listen(button2, "click", ctx[8]),
          listen(button3, "click", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t2, ctx2[0]);
      if (dirty & 2 && img.src !== (img_src_value = ctx2[1].url)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 4 && t6_value !== (t6_value = ctx2[2][0].name + ""))
        set_data(t6, t6_value);
      if (dirty & 4 && button0_class_value !== (button0_class_value = "" + (null_to_empty(ctx2[2][0].isRed ? "redborder" : "") + " svelte-hvjeeu"))) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & 4 && t9_value !== (t9_value = ctx2[2][1].name + ""))
        set_data(t9, t9_value);
      if (dirty & 4 && button1_class_value !== (button1_class_value = "" + (null_to_empty(ctx2[2][1].isRed ? "redborder" : "") + " svelte-hvjeeu"))) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & 4 && t12_value !== (t12_value = ctx2[2][2].name + ""))
        set_data(t12, t12_value);
      if (dirty & 4 && button2_class_value !== (button2_class_value = "" + (null_to_empty(ctx2[2][2].isRed ? "redborder" : "") + " svelte-hvjeeu"))) {
        attr(button2, "class", button2_class_value);
      }
      if (dirty & 4 && t15_value !== (t15_value = ctx2[2][3].name + ""))
        set_data(t15, t15_value);
      if (dirty & 4 && button3_class_value !== (button3_class_value = "" + (null_to_empty(ctx2[2][3].isRed ? "redborder" : "") + " svelte-hvjeeu"))) {
        attr(button3, "class", button3_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(h1);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(p);
      if (detaching)
        detach(t3);
      if (detaching)
        detach(img);
      if (detaching)
        detach(t4);
      if (detaching)
        detach(br0);
      if (detaching)
        detach(t5);
      if (detaching)
        detach(button0);
      if (detaching)
        detach(t7);
      if (detaching)
        detach(br1);
      if (detaching)
        detach(t8);
      if (detaching)
        detach(button1);
      if (detaching)
        detach(t10);
      if (detaching)
        detach(br2);
      if (detaching)
        detach(t11);
      if (detaching)
        detach(button2);
      if (detaching)
        detach(t13);
      if (detaching)
        detach(br3);
      if (detaching)
        detach(t14);
      if (detaching)
        detach(button3);
      mounted = false;
      run_all(dispose);
    }
  };
}
function rand(min, max) {
  return Math.floor(Math.random() * max) + min;
}
function instance2($$self, $$props, $$invalidate) {
  let {settings} = $$props;
  let progresscheck = "??/??";
  let currentflag = {};
  let guesses = [
    {name: "", isRed: false},
    {name: "", isRed: false},
    {name: "", isRed: false},
    {name: "", isRed: false}
  ];
  let flaglist = [];
  let flagnum = 0;
  let correct = 0;
  let missedquestions = 0;
  function populatequestion(num) {
    $$invalidate(1, currentflag = flaglist[num]);
    flagnum = num;
    missedquestions = 0;
    for (var i = 0; i < 4; i++) {
      $$invalidate(2, guesses[i].name = randomcountryflag().name, guesses);
      $$invalidate(2, guesses[i].isRed = false, guesses);
    }
    console.log(currentflag);
    $$invalidate(2, guesses[rand(0, 3)].name = currentflag.name, guesses);
  }
  function chose(x) {
    console.log("clicked button #" + x);
    if (guesses[x].name == currentflag.name) {
      console.log("CORRECT");
      if (missedquestions == 0)
        correct++;
      flagnum++;
      populatequestion(flagnum);
      $$invalidate(0, progresscheck = correct + "/" + settings.count);
    } else {
      console.log("WRONG");
      $$invalidate(2, guesses[x].isRed = true, guesses);
      missedquestions++;
    }
  }
  function randomcountryflag() {
    return countryflags[Math.floor(Math.random() * countryflags.length)];
  }
  function start(set) {
    console.log("generating " + settings.count + " flags");
    while (flaglist.length < settings.count) {
      let rand2 = randomcountryflag();
      if (!flaglist.includes(rand2)) {
        flaglist.push(rand2);
      }
    }
    console.log(flaglist);
    $$invalidate(0, progresscheck = "0/" + settings.count);
    populatequestion(0);
  }
  start();
  const click_handler = () => chose(0);
  const click_handler_1 = () => chose(1);
  const click_handler_2 = () => chose(2);
  const click_handler_3 = () => chose(3);
  $$self.$$set = ($$props2) => {
    if ("settings" in $$props2)
      $$invalidate(4, settings = $$props2.settings);
  };
  return [
    progresscheck,
    currentflag,
    guesses,
    chose,
    settings,
    start,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3
  ];
}
var Game = class extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-hvjeeu-style"))
      add_css();
    init(this, options, instance2, create_fragment2, safe_not_equal, {settings: 4, start: 5});
  }
  get start() {
    return this.$$.ctx[5];
  }
};
var game_default = Game;

// src/app.svelte
function add_css2() {
  var style = element("style");
  style.id = "svelte-9k5trb-style";
  style.textContent = "h1.svelte-9k5trb{margin:0}";
  append(document.head, style);
}
function create_else_block(ctx) {
  let game2;
  let updating_settings;
  let current;
  function game_settings_binding(value) {
    ctx[3].call(null, value);
  }
  let game_props = {};
  if (ctx[1] !== void 0) {
    game_props.settings = ctx[1];
  }
  game2 = new game_default({props: game_props});
  binding_callbacks.push(() => bind(game2, "settings", game_settings_binding));
  return {
    c() {
      create_component(game2.$$.fragment);
    },
    m(target, anchor) {
      mount_component(game2, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const game_changes = {};
      if (!updating_settings && dirty & 2) {
        updating_settings = true;
        game_changes.settings = ctx2[1];
        add_flush_callback(() => updating_settings = false);
      }
      game2.$set(game_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(game2.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(game2.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(game2, detaching);
    }
  };
}
function create_if_block(ctx) {
  let menu2;
  let current;
  menu2 = new menu_default({});
  menu2.$on("startgame", ctx[2]);
  return {
    c() {
      create_component(menu2.$$.fragment);
    },
    m(target, anchor) {
      mount_component(menu2, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(menu2.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(menu2.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(menu2, detaching);
    }
  };
}
function create_fragment3(ctx) {
  let h1;
  let t1;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0])
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      h1 = element("h1");
      h1.textContent = "FLAG QUIZ";
      t1 = space();
      if_block.c();
      if_block_anchor = empty();
      attr(h1, "class", "svelte-9k5trb");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      insert(target, t1, anchor);
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(h1);
      if (detaching)
        detach(t1);
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance3($$self, $$props, $$invalidate) {
  let inmenu = true;
  let gsettings;
  function startgame(s) {
    $$invalidate(0, inmenu = false);
    $$invalidate(1, gsettings = s.detail);
    console.log("got settings: ", s.detail);
  }
  function game_settings_binding(value) {
    gsettings = value;
    $$invalidate(1, gsettings);
  }
  return [inmenu, gsettings, startgame, game_settings_binding];
}
var App = class extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-9k5trb-style"))
      add_css2();
    init(this, options, instance3, create_fragment3, safe_not_equal, {});
  }
};
var app_default = App;

// src/app.js
new app_default({
  target: document.body
});