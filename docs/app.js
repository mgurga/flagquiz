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
function init(component, options, instance5, create_fragment5, not_equal, props, dirty = [-1]) {
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
  $$.ctx = instance5 ? instance5(component, prop_values, (i, ret, ...rest) => {
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
  $$.fragment = create_fragment5 ? create_fragment5($$.ctx) : false;
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
  let div;
  let label0;
  let t1;
  let select;
  let option0;
  let option1;
  let option2;
  let t5;
  let br1;
  let t6;
  let label1;
  let t7;
  let input;
  let t8;
  let br2;
  let t9;
  let br3;
  let t10;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      br0 = element("br");
      t0 = space();
      div = element("div");
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
      br1 = element("br");
      t6 = space();
      label1 = element("label");
      t7 = text("Timed:\n    ");
      input = element("input");
      t8 = space();
      br2 = element("br");
      t9 = space();
      br3 = element("br");
      t10 = space();
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
      attr(div, "class", "root");
    },
    m(target, anchor) {
      insert(target, br0, anchor);
      insert(target, t0, anchor);
      insert(target, div, anchor);
      append(div, label0);
      append(label0, t1);
      append(label0, select);
      append(select, option0);
      append(select, option1);
      append(select, option2);
      select_option(select, ctx[0]);
      append(div, t5);
      append(div, br1);
      append(div, t6);
      append(div, label1);
      append(label1, t7);
      append(label1, input);
      input.checked = ctx[1];
      append(div, t8);
      append(div, br2);
      append(div, t9);
      append(div, br3);
      append(div, t10);
      append(div, button);
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
        detach(div);
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
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/1080px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png",
    region: "AS"
  },
  {
    name: "Albania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Flag_of_Albania.svg/1080px-Flag_of_Albania.svg.png",
    region: "EU"
  },
  {
    name: "Algeria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/1080px-Flag_of_Algeria.svg.png",
    region: "AF"
  },
  {
    name: "Andorra",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Andorra.svg/1080px-Flag_of_Andorra.svg.png",
    region: "EU"
  },
  {
    name: "Angola",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Flag_of_Angola.svg/1080px-Flag_of_Angola.svg.png",
    region: "AF"
  },
  {
    name: "Antigua and Barbuda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Antigua_and_Barbuda.svg/1080px-Flag_of_Antigua_and_Barbuda.svg.png",
    region: "NA"
  },
  {
    name: "Argentina",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1080px-Flag_of_Argentina.svg.png",
    region: "SA"
  },
  {
    name: "Armenia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flag_of_Armenia.svg/1080px-Flag_of_Armenia.svg.png",
    region: "AS"
  },
  {
    name: "Australia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1080px-Flag_of_Australia_%28converted%29.svg.png",
    region: "OC",
    similar: ["New Zealand"]
  },
  {
    name: "Austria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/1080px-Flag_of_Austria.svg.png",
    region: "EU"
  },
  {
    name: "Azerbaijan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Azerbaijan.svg/1080px-Flag_of_Azerbaijan.svg.png",
    region: "AS"
  },
  {
    name: "Bahamas",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flag_of_the_Bahamas.svg/1080px-Flag_of_the_Bahamas.svg.png",
    region: "NA"
  },
  {
    name: "Bahrain",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Bahrain.svg/1080px-Flag_of_Bahrain.svg.png",
    region: "AS"
  },
  {
    name: "Bangladesh",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/1080px-Flag_of_Bangladesh.svg.png",
    region: "AS"
  },
  {
    name: "Barbados",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1080px-Flag_of_Barbados.svg.png",
    region: "NA"
  },
  {
    name: "Belarus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Flag_of_Belarus.svg/1080px-Flag_of_Belarus.svg.png",
    region: "EU"
  },
  {
    name: "Belgium",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Belgium.svg/1080px-Flag_of_Belgium.svg.png",
    region: "EU"
  },
  {
    name: "Belize",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Flag_of_Belize.svg/1080px-Flag_of_Belize.svg.png",
    region: "NA"
  },
  {
    name: "Benin",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Benin.svg/1080px-Flag_of_Benin.svg.png",
    region: "AF"
  },
  {
    name: "Bhutan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Flag_of_Bhutan.svg/1080px-Flag_of_Bhutan.svg.png",
    region: "AS"
  },
  {
    name: "Bolivia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bandera_de_Bolivia_%28Estado%29.svg/1080px-Bandera_de_Bolivia_%28Estado%29.svg.png",
    region: "SA"
  },
  {
    name: "Bosnia and Herzegovina",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Flag_of_Bosnia_and_Herzegovina.svg/1080px-Flag_of_Bosnia_and_Herzegovina.svg.png",
    region: "EU"
  },
  {
    name: "Botswana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_Botswana.svg/1080px-Flag_of_Botswana.svg.png",
    region: "AF"
  },
  {
    name: "Brazil",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/1080px-Flag_of_Brazil.svg.png",
    region: "SA"
  },
  {
    name: "Brunei",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Brunei.svg/1080px-Flag_of_Brunei.svg.png",
    region: "AS"
  },
  {
    name: "Bulgaria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Bulgaria.svg/1080px-Flag_of_Bulgaria.svg.png",
    region: "EU"
  },
  {
    name: "Burkina Faso",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/1080px-Flag_of_Burkina_Faso.svg.png",
    region: "AF"
  },
  {
    name: "Burundi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Flag_of_Burundi.svg/1080px-Flag_of_Burundi.svg.png",
    region: "AF"
  },
  {
    name: "Cambodia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/1080px-Flag_of_Cambodia.svg.png",
    region: "AS"
  },
  {
    name: "Cameroon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Cameroon.svg/1080px-Flag_of_Cameroon.svg.png",
    region: "AF"
  },
  {
    name: "Canada",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/1080px-Flag_of_Canada.svg.png",
    region: "NA"
  },
  {
    name: "Cape Verde",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_Cape_Verde_%282-3_ratio%29.svg/1080px-Flag_of_Cape_Verde_%282-3_ratio%29.svg.png",
    region: "AF"
  },
  {
    name: "Central African Republic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Central_African_Republic.svg/1080px-Flag_of_the_Central_African_Republic.svg.png",
    region: "AF"
  },
  {
    name: "Chad",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Flag_of_Chad.svg/1080px-Flag_of_Chad.svg.png",
    same: ["Romania"],
    region: "AF"
  },
  {
    name: "Chile",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1080px-Flag_of_Chile.svg.png",
    region: "SA"
  },
  {
    name: "China",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1080px-Flag_of_the_People%27s_Republic_of_China.svg.png",
    region: "AS"
  },
  {
    name: "Colombia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/1080px-Flag_of_Colombia.svg.png",
    region: "SA"
  },
  {
    name: "Comoros",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Flag_of_the_Comoros.svg/1080px-Flag_of_the_Comoros.svg.png",
    region: "AF"
  },
  {
    name: "Democratic Republic of the Congo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/1080px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png",
    region: "AF"
  },
  {
    name: "Republic of the Congo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_the_Republic_of_the_Congo.svg/1080px-Flag_of_the_Republic_of_the_Congo.svg.png",
    region: "AF"
  },
  {
    name: "Costa Rica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Costa_Rica_%28state%29.svg/1080px-Flag_of_Costa_Rica_%28state%29.svg.png",
    similar: ["Thailand"],
    region: "NA"
  },
  {
    name: "Croatia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Croatia.svg/1080px-Flag_of_Croatia.svg.png",
    region: "EU"
  },
  {
    name: "Cuba",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Flag_of_Cuba.svg/1080px-Flag_of_Cuba.svg.png",
    region: "NA"
  },
  {
    name: "Cyprus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Cyprus.svg/1080px-Flag_of_Cyprus.svg.png",
    region: "AS"
  },
  {
    name: "Czechia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_Czech_Republic.svg/1080px-Flag_of_the_Czech_Republic.svg.png",
    region: "EU"
  },
  {
    name: "Denmark",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/1080px-Flag_of_Denmark.svg.png",
    region: "EU"
  },
  {
    name: "Djibouti",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_Djibouti.svg/1080px-Flag_of_Djibouti.svg.png",
    region: "AF"
  },
  {
    name: "Dominica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flag_of_Dominica.svg/1080px-Flag_of_Dominica.svg.png",
    region: "NA"
  },
  {
    name: "Dominican Republic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_the_Dominican_Republic.svg/1080px-Flag_of_the_Dominican_Republic.svg.png",
    region: "NA"
  },
  {
    name: "East Timor",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_East_Timor.svg/1080px-Flag_of_East_Timor.svg.png",
    region: "AS"
  },
  {
    name: "Ecuador",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/1080px-Flag_of_Ecuador.svg.png",
    region: "SA"
  },
  {
    name: "Egypt",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/1080px-Flag_of_Egypt.svg.png",
    region: "AF"
  },
  {
    name: "El Salvador",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_El_Salvador.svg/1080px-Flag_of_El_Salvador.svg.png",
    region: "NA"
  },
  {
    name: "Equatorial Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Equatorial_Guinea.svg/1080px-Flag_of_Equatorial_Guinea.svg.png",
    region: "AF"
  },
  {
    name: "Eritrea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/1080px-Flag_of_Eritrea.svg.png",
    region: "AF"
  },
  {
    name: "Estonia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flag_of_Estonia.svg/1080px-Flag_of_Estonia.svg.png",
    region: "EU"
  },
  {
    name: "Eswatini",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Flag_of_Eswatini.svg/1080px-Flag_of_Eswatini.svg.png",
    region: "AF"
  },
  {
    name: "Ethiopia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1080px-Flag_of_Ethiopia.svg.png",
    region: "AF"
  },
  {
    name: "Fiji",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Fiji.svg/1080px-Flag_of_Fiji.svg.png",
    region: "OC"
  },
  {
    name: "Finland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/1080px-Flag_of_Finland.svg.png",
    region: "EU"
  },
  {
    name: "France",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Flag_of_France_%281958%E2%80%931976%2C_2020-%29.svg/1080px-Flag_of_France_%281958%E2%80%931976%2C_2020-%29.svg.png",
    region: "EU"
  },
  {
    name: "Gabon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Flag_of_Gabon.svg/1080px-Flag_of_Gabon.svg.png",
    region: "AF"
  },
  {
    name: "Gambia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/1080px-Flag_of_The_Gambia.svg.png",
    region: "AF"
  },
  {
    name: "Georgia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/1080px-Flag_of_Georgia.svg.png",
    region: "AS"
  },
  {
    name: "Germany",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Flag_of_Germany_%283-2_aspect_ratio%29.svg/1080px-Flag_of_Germany_%283-2_aspect_ratio%29.svg.png",
    region: "EU"
  },
  {
    name: "Ghana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/1080px-Flag_of_Ghana.svg.png",
    region: "AF"
  },
  {
    name: "Greece",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/1080px-Flag_of_Greece.svg.png",
    region: "EU"
  },
  {
    name: "Grenada",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Grenada.svg/1080px-Flag_of_Grenada.svg.png",
    region: "AF"
  },
  {
    name: "Guatemala",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Guatemala.svg/1080px-Flag_of_Guatemala.svg.png",
    region: "NA"
  },
  {
    name: "Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Flag_of_Guinea.svg/1080px-Flag_of_Guinea.svg.png",
    region: "AF"
  },
  {
    name: "Guinea-Bissau",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Guinea-Bissau.svg/1080px-Flag_of_Guinea-Bissau.svg.png",
    region: "AF"
  },
  {
    name: "Guyana",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_Guyana.svg/1080px-Flag_of_Guyana.svg.png",
    region: "SA"
  },
  {
    name: "Haiti",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Haiti.svg/1080px-Flag_of_Haiti.svg.png",
    region: "NA"
  },
  {
    name: "Honduras",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Flag_of_Honduras.svg/1080px-Flag_of_Honduras.svg.png",
    region: "NA"
  },
  {
    name: "Hungary",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Flag_of_Hungary.svg/1080px-Flag_of_Hungary.svg.png",
    region: "EU"
  },
  {
    name: "Iceland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Iceland.svg/1080px-Flag_of_Iceland.svg.png",
    similar: ["Norway", "Sweden"],
    region: "EU"
  },
  {
    name: "India",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1080px-Flag_of_India.svg.png",
    region: "AS"
  },
  {
    name: "Indonesia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1080px-Flag_of_Indonesia.svg.png",
    similar: ["Poland"],
    same: ["Monaco"],
    region: "AS"
  },
  {
    name: "Iran",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1080px-Flag_of_Iran.svg.png",
    region: "AS"
  },
  {
    name: "Iraq",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/1080px-Flag_of_Iraq.svg.png",
    region: "AS"
  },
  {
    name: "Ireland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/1080px-Flag_of_Ireland.svg.png",
    region: "EU"
  },
  {
    name: "Israel",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Israel.svg/1080px-Flag_of_Israel.svg.png",
    region: "AS"
  },
  {
    name: "Italy",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/1080px-Flag_of_Italy.svg.png",
    region: "EU"
  },
  {
    name: "Ivory Coast",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/1080px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png",
    region: "AF"
  },
  {
    name: "Jamaica",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Jamaica.svg/1080px-Flag_of_Jamaica.svg.png",
    region: "NA"
  },
  {
    name: "Japan",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/1080px-Flag_of_Japan.svg.png",
    region: "AS"
  },
  {
    name: "Jordan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/1080px-Flag_of_Jordan.svg.png",
    region: "AS"
  },
  {
    name: "Kazakhstan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kazakhstan.svg/1080px-Flag_of_Kazakhstan.svg.png",
    region: "AS"
  },
  {
    name: "Kenya",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/1080px-Flag_of_Kenya.svg.png",
    region: "AF"
  },
  {
    name: "Kiribati",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kiribati.svg/1080px-Flag_of_Kiribati.svg.png",
    region: "OC"
  },
  {
    name: "Kuwait",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/1080px-Flag_of_Kuwait.svg.png",
    region: "AS"
  },
  {
    name: "Kyrgyzstan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Flag_of_Kyrgyzstan.svg/1080px-Flag_of_Kyrgyzstan.svg.png",
    region: "AS"
  },
  {
    name: "Laos",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Laos.svg/1080px-Flag_of_Laos.svg.png",
    region: "AS"
  },
  {
    name: "Latvia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Latvia.svg/1080px-Flag_of_Latvia.svg.png",
    region: "EU"
  },
  {
    name: "Lebanon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Flag_of_Lebanon.svg/1080px-Flag_of_Lebanon.svg.png",
    region: "AS"
  },
  {
    name: "Lesotho",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Flag_of_Lesotho.svg/1080px-Flag_of_Lesotho.svg.png",
    region: "AF"
  },
  {
    name: "Liberia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Flag_of_Liberia.svg/1080px-Flag_of_Liberia.svg.png",
    region: "AF"
  },
  {
    name: "Libya",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/1080px-Flag_of_Libya.svg.png",
    region: "AF"
  },
  {
    name: "Liechtenstein",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Flag_of_Liechtenstein.svg/1080px-Flag_of_Liechtenstein.svg.png",
    region: "EU"
  },
  {
    name: "Lithuania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Lithuania.svg/1080px-Flag_of_Lithuania.svg.png",
    similar: ["Armenia"],
    region: "EU"
  },
  {
    name: "Luxembourg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/1080px-Flag_of_Luxembourg.svg.png",
    region: "EU"
  },
  {
    name: "Madagascar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Madagascar.svg/1080px-Flag_of_Madagascar.svg.png",
    region: "AF"
  },
  {
    name: "Malawi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Flag_of_Malawi.svg/1080px-Flag_of_Malawi.svg.png",
    region: "AF"
  },
  {
    name: "Malaysia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_of_Malaysia.svg/1080px-Flag_of_Malaysia.svg.png",
    region: "AS"
  },
  {
    name: "Maldives",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Maldives.svg/1080px-Flag_of_Maldives.svg.png",
    region: "AS"
  },
  {
    name: "Mali",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/1080px-Flag_of_Mali.svg.png",
    region: "AF"
  },
  {
    name: "Malta",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Malta.svg/1080px-Flag_of_Malta.svg.png",
    region: "EU"
  },
  {
    name: "Marshall Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Marshall_Islands.svg/1080px-Flag_of_the_Marshall_Islands.svg.png",
    region: "OC"
  },
  {
    name: "Mauritania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Flag_of_Mauritania.svg/1080px-Flag_of_Mauritania.svg.png",
    similar: ["Mauritius"],
    region: "AF"
  },
  {
    name: "Mauritius",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Mauritius.svg/1080px-Flag_of_Mauritius.svg.png",
    similar: ["Mauritania"],
    region: "AF"
  },
  {
    name: "Mexico",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/1080px-Flag_of_Mexico.svg.png",
    region: "NA"
  },
  {
    name: "Micronesia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg/1080px-Flag_of_the_Federated_States_of_Micronesia.svg.png",
    region: "EU"
  },
  {
    name: "Moldova",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/1080px-Flag_of_Moldova.svg.png",
    region: "EU"
  },
  {
    name: "Monaco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Flag_of_Monaco.svg/1080px-Flag_of_Monaco.svg.png",
    similar: ["Poland"],
    same: ["Indonesia"],
    region: "EU"
  },
  {
    name: "Mongolia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Mongolia.svg/1080px-Flag_of_Mongolia.svg.png",
    region: "AS"
  },
  {
    name: "Montenegro",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Montenegro.svg/1080px-Flag_of_Montenegro.svg.png",
    region: "EU"
  },
  {
    name: "Morocco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/1080px-Flag_of_Morocco.svg.png",
    region: "AF"
  },
  {
    name: "Mozambique",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Mozambique.svg/1080px-Flag_of_Mozambique.svg.png",
    region: "AF"
  },
  {
    name: "Myanmar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/1080px-Flag_of_Myanmar.svg.png",
    region: "AS"
  },
  {
    name: "Namibia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Namibia.svg/1080px-Flag_of_Namibia.svg.png",
    region: "AF"
  },
  {
    name: "Nauru",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Flag_of_Nauru.svg/1080px-Flag_of_Nauru.svg.png",
    region: "AF"
  },
  {
    name: "Nepal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/98px-Flag_of_Nepal.svg.png",
    region: "AS"
  },
  {
    name: "Netherlands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1080px-Flag_of_the_Netherlands.svg.png",
    region: "EU"
  },
  {
    name: "New Zealand",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1080px-Flag_of_New_Zealand.svg.png",
    region: "OC",
    similar: ["Australia"]
  },
  {
    name: "Nicaragua",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Nicaragua.svg/1080px-Flag_of_Nicaragua.svg.png",
    region: "NA"
  },
  {
    name: "Niger",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Niger.svg/1080px-Flag_of_Niger.svg.png",
    region: "AF"
  },
  {
    name: "Nigeria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/1080px-Flag_of_Nigeria.svg.png",
    region: "AF"
  },
  {
    name: "North Korea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/1080px-Flag_of_North_Korea.svg.png",
    region: "AS"
  },
  {
    name: "North Macedonia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_North_Macedonia.svg/1080px-Flag_of_North_Macedonia.svg.png",
    region: "EU"
  },
  {
    name: "Norway",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_Norway_%28c81329_for_red_%26_14275b_for_blue%29.svg/1080px-Flag_of_Norway_%28c81329_for_red_%26_14275b_for_blue%29.svg.png",
    region: "EU"
  },
  {
    name: "Oman",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Oman.svg/1080px-Flag_of_Oman.svg.png",
    region: "AS"
  },
  {
    name: "Pakistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1080px-Flag_of_Pakistan.svg.png",
    region: "AS"
  },
  {
    name: "Palau",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Palau.svg/1080px-Flag_of_Palau.svg.png",
    region: "OC"
  },
  {
    name: "Palestine",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/1080px-Flag_of_Palestine.svg.png",
    region: "AS"
  },
  {
    name: "Panama",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Flag_of_Panama.svg/1080px-Flag_of_Panama.svg.png",
    region: "NA"
  },
  {
    name: "Papua New Guinea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Flag_of_Papua_New_Guinea.svg/1080px-Flag_of_Papua_New_Guinea.svg.png",
    region: "OC"
  },
  {
    name: "Paraguay",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/1080px-Flag_of_Paraguay.svg.png",
    region: "SA"
  },
  {
    name: "Peru",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Flag_of_Peru_%28state%29.svg/1080px-Flag_of_Peru_%28state%29.svg.png",
    region: "SA"
  },
  {
    name: "Philippines",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_the_Philippines.svg/1080px-Flag_of_the_Philippines.svg.png",
    region: "AS"
  },
  {
    name: "Poland",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/1080px-Flag_of_Poland.svg.png",
    region: "EU",
    similar: ["Monaco", "Indonesia"]
  },
  {
    name: "Portugal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1080px-Flag_of_Portugal.svg.png",
    region: "EU"
  },
  {
    name: "Qatar",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Qatar.svg/1080px-Flag_of_Qatar.svg.png",
    region: "AS",
    similar: ["Bahrain"]
  },
  {
    name: "Romania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Romania.svg/1080px-Flag_of_Romania.svg.png",
    same: ["Chad"],
    region: "EU"
  },
  {
    name: "Russia",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/1080px-Flag_of_Russia.svg.png",
    region: "AS"
  },
  {
    name: "Rwanda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Rwanda.svg/1080px-Flag_of_Rwanda.svg.png",
    region: "AF"
  },
  {
    name: "Saint Kitts and Nevis",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Saint_Kitts_and_Nevis.svg/1080px-Flag_of_Saint_Kitts_and_Nevis.svg.png",
    region: "NA"
  },
  {
    name: "Saint Lucia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Saint_Lucia.svg/1080px-Flag_of_Saint_Lucia.svg.png",
    region: "NA"
  },
  {
    name: "Saint Vincent and the Grenadines",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Flag_of_Saint_Vincent_and_the_Grenadines.svg/1080px-Flag_of_Saint_Vincent_and_the_Grenadines.svg.png",
    region: "NA"
  },
  {
    name: "Samoa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Samoa.svg/1080px-Flag_of_Samoa.svg.png",
    region: "OC"
  },
  {
    name: "San Marino",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Flag_of_San_Marino.svg/1080px-Flag_of_San_Marino.svg.png",
    region: "EU"
  },
  {
    name: "S\xE3o Tom\xE9 and Pr\xEDncipe",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Sao_Tome_and_Principe.svg/1080px-Flag_of_Sao_Tome_and_Principe.svg.png",
    region: "AF"
  },
  {
    name: "Saudi Arabia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1080px-Flag_of_Saudi_Arabia.svg.png",
    region: "AS"
  },
  {
    name: "Senegal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/1080px-Flag_of_Senegal.svg.png",
    region: "AF"
  },
  {
    name: "Serbia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Flag_of_Serbia.svg/1080px-Flag_of_Serbia.svg.png",
    region: "EU"
  },
  {
    name: "Seychelles",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Seychelles.svg/1080px-Flag_of_Seychelles.svg.png",
    region: "AF"
  },
  {
    name: "Sierra Leone",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Sierra_Leone.svg/1080px-Flag_of_Sierra_Leone.svg.png",
    region: "AF"
  },
  {
    name: "Singapore",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1080px-Flag_of_Singapore.svg.png",
    region: "AS"
  },
  {
    name: "Slovakia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Slovakia.svg/1080px-Flag_of_Slovakia.svg.png",
    region: "EU"
  },
  {
    name: "Slovenia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Flag_of_Slovenia.svg/1080px-Flag_of_Slovenia.svg.png",
    region: "EU"
  },
  {
    name: "Solomon Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Flag_of_the_Solomon_Islands.svg/1080px-Flag_of_the_Solomon_Islands.svg.png",
    region: "OC"
  },
  {
    name: "Somalia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/1080px-Flag_of_Somalia.svg.png",
    region: "AF"
  },
  {
    name: "South Africa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/1080px-Flag_of_South_Africa.svg.png",
    region: "AF"
  },
  {
    name: "Sudan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Sudan.svg/1080px-Flag_of_Sudan.svg.png",
    region: "AF"
  },
  {
    name: "South Korea",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1080px-Flag_of_South_Korea.svg.png",
    region: "AS"
  },
  {
    name: "South Sudan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_South_Sudan.svg/1080px-Flag_of_South_Sudan.svg.png",
    region: "AF"
  },
  {
    name: "Spain",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/1080px-Flag_of_Spain.svg.png",
    region: "EU"
  },
  {
    name: "Sri Lanka",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Sri_Lanka.svg/1080px-Flag_of_Sri_Lanka.svg.png",
    region: "AS"
  },
  {
    name: "Suriname",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Flag_of_Suriname.svg/1080px-Flag_of_Suriname.svg.png",
    region: "SA"
  },
  {
    name: "Sweden",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Flag_of_Sweden.svg/1080px-Flag_of_Sweden.svg.png",
    region: "EU"
  },
  {
    name: "Switzerland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/1080px-Flag_of_Switzerland.svg.png",
    region: "EU"
  },
  {
    name: "Syria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flag_of_Syria.svg/1080px-Flag_of_Syria.svg.png",
    region: "AS"
  },
  {
    name: "Tajikistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Tajikistan.svg/1080px-Flag_of_Tajikistan.svg.png",
    region: "AS"
  },
  {
    name: "Tanzania",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/1080px-Flag_of_Tanzania.svg.png",
    region: "AF"
  },
  {
    name: "Thailand",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/1080px-Flag_of_Thailand.svg.png",
    similar: ["Costa Rica"],
    region: "AS"
  },
  {
    name: "Togo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Togo.svg/1080px-Flag_of_Togo.svg.png",
    region: "AF"
  },
  {
    name: "Tonga",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Tonga.svg/1080px-Flag_of_Tonga.svg.png",
    region: "OC"
  },
  {
    name: "Trinidad and Tobago",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Trinidad_and_Tobago.svg/1080px-Flag_of_Trinidad_and_Tobago.svg.png",
    region: "NA"
  },
  {
    name: "Tunisia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/1080px-Flag_of_Tunisia.svg.png",
    region: "AF"
  },
  {
    name: "Turkey",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1080px-Flag_of_Turkey.svg.png",
    region: "AS"
  },
  {
    name: "Turkmenistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Turkmenistan.svg/1080px-Flag_of_Turkmenistan.svg.png",
    region: "AS"
  },
  {
    name: "Tuvalu",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tuvalu.svg/1080px-Flag_of_Tuvalu.svg.png",
    region: "OC"
  },
  {
    name: "Uganda",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/1080px-Flag_of_Uganda.svg.png",
    region: "AF"
  },
  {
    name: "Ukraine",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/1080px-Flag_of_Ukraine.svg.png",
    region: "EU"
  },
  {
    name: "United Arab Emirates",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/1080px-Flag_of_the_United_Arab_Emirates.svg.png",
    region: "AS"
  },
  {
    name: "United Kingdom",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1080px-Flag_of_the_United_Kingdom.svg.png",
    region: "EU"
  },
  {
    name: "United States",
    url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1080px-Flag_of_the_United_States.svg.png",
    region: "NA"
  },
  {
    name: "Uruguay",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/1080px-Flag_of_Uruguay.svg.png",
    region: "SA"
  },
  {
    name: "Uzbekistan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/1080px-Flag_of_Uzbekistan.svg.png",
    region: "AS"
  },
  {
    name: "Vanuatu",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Flag_of_Vanuatu_%28official%29.svg/1080px-Flag_of_Vanuatu_%28official%29.svg.png",
    region: "OC"
  },
  {
    name: "Vatican City",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_the_Vatican_City.svg/1080px-Flag_of_the_Vatican_City.svg.png",
    region: "EU"
  },
  {
    name: "Venezuela",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Venezuela.svg/1080px-Flag_of_Venezuela.svg.png",
    region: "SA"
  },
  {
    name: "Vietnam",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1080px-Flag_of_Vietnam.svg.png",
    region: "AS"
  },
  {
    name: "Yemen",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Yemen.svg/1080px-Flag_of_Yemen.svg.png",
    region: "AS"
  },
  {
    name: "Zambia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Zambia.svg/1080px-Flag_of_Zambia.svg.png",
    region: "AF"
  },
  {
    name: "Zimbabwe",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1080px-Flag_of_Zimbabwe.svg.png",
    region: "AF"
  },
  {
    name: "Abkhazia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_the_Republic_of_Abkhazia.svg/1080px-Flag_of_the_Republic_of_Abkhazia.svg.png",
    region: "AS"
  },
  {
    name: "Artsakh",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Flag_of_Artsakh.svg/1080px-Flag_of_Artsakh.svg.png",
    region: "AS"
  },
  {
    name: "Cook Islands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_the_Cook_Islands.svg/1080px-Flag_of_the_Cook_Islands.svg.png",
    region: "OC"
  },
  {
    name: "Kosovo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/1080px-Flag_of_Kosovo.svg.png",
    region: "EU"
  },
  {
    name: "Niue",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Niue.svg/1080px-Flag_of_Niue.svg.png",
    region: "OC"
  },
  {
    name: "Northern Cyprus",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg/1080px-Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg.png",
    region: "AS"
  },
  {
    name: "Somaliland",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/1080px-Flag_of_Somaliland.svg.png",
    region: "AF"
  },
  {
    name: "South Ossetia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_South_Ossetia.svg/1080px-Flag_of_South_Ossetia.svg.png",
    region: "AS"
  },
  {
    name: "Taiwan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Flag_of_the_Republic_of_China.svg/1080px-Flag_of_the_Republic_of_China.svg.png",
    region: "AS"
  },
  {
    name: "Transnistria",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Transnistria_%28state%29.svg/1080px-Flag_of_Transnistria_%28state%29.svg.png",
    region: "EU"
  },
  {
    name: "Western Sahara",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/1080px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png",
    region: "AF"
  }
];

// src/game.svelte
function add_css() {
  var style = element("style");
  style.id = "svelte-18lie5o-style";
  style.textContent = ".redborder.svelte-18lie5o{border:10px solid red !important}p.svelte-18lie5o{width:fit-content;margin:0px;font-size:20pt;display:inline-block}h1.svelte-18lie5o{margin:0}.progress.svelte-18lie5o{float:right}.center.svelte-18lie5o{margin:0 auto;width:fit-content}.guess.svelte-18lie5o{font-size:20pt}.guess.svelte-18lie5o:hover{background-color:royalblue}.guesses.svelte-18lie5o{width:75%;margin:0 auto}img.svelte-18lie5o{width:100%;height:fit-content;margin:auto;display:block}.imgcontainer.svelte-18lie5o{max-width:100%;max-height:50vh;width:100%;height:50vh;object-fit:cover;overflow-y:hidden;display:flex;justify-content:center;align-items:center;padding:10px}.middle.svelte-18lie5o{position:relative;left:30%;transform:translateX(-50%)}";
  append(document.head, style);
}
function create_if_block(ctx) {
  let p;
  let t0_value = ctx[5] / 10 + "";
  let t0;
  let t1;
  return {
    c() {
      p = element("p");
      t0 = text(t0_value);
      t1 = text("s");
      attr(p, "class", "middle svelte-18lie5o");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t0);
      append(p, t1);
    },
    p(ctx2, dirty) {
      if (dirty & 32 && t0_value !== (t0_value = ctx2[5] / 10 + ""))
        set_data(t0, t0_value);
    },
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_fragment2(ctx) {
  let div2;
  let h1;
  let t1;
  let p0;
  let t2;
  let t3;
  let t4;
  let p1;
  let t5;
  let t6;
  let div0;
  let img;
  let img_src_value;
  let t7;
  let div1;
  let button0;
  let t8_value = ctx[3][0].name + "";
  let t8;
  let button0_class_value;
  let t9;
  let br0;
  let t10;
  let button1;
  let t11_value = ctx[3][1].name + "";
  let t11;
  let button1_class_value;
  let t12;
  let br1;
  let t13;
  let button2;
  let t14_value = ctx[3][2].name + "";
  let t14;
  let button2_class_value;
  let t15;
  let br2;
  let t16;
  let button3;
  let t17_value = ctx[3][3].name + "";
  let t17;
  let button3_class_value;
  let mounted;
  let dispose;
  let if_block = ctx[0].timerenabled && create_if_block(ctx);
  return {
    c() {
      div2 = element("div");
      h1 = element("h1");
      h1.textContent = "What flag is this???";
      t1 = space();
      p0 = element("p");
      t2 = text(ctx[4]);
      t3 = space();
      if (if_block)
        if_block.c();
      t4 = space();
      p1 = element("p");
      t5 = text(ctx[1]);
      t6 = space();
      div0 = element("div");
      img = element("img");
      t7 = space();
      div1 = element("div");
      button0 = element("button");
      t8 = text(t8_value);
      t9 = space();
      br0 = element("br");
      t10 = space();
      button1 = element("button");
      t11 = text(t11_value);
      t12 = space();
      br1 = element("br");
      t13 = space();
      button2 = element("button");
      t14 = text(t14_value);
      t15 = space();
      br2 = element("br");
      t16 = space();
      button3 = element("button");
      t17 = text(t17_value);
      attr(h1, "class", "center svelte-18lie5o");
      attr(p0, "class", "svelte-18lie5o");
      attr(p1, "class", "progress svelte-18lie5o");
      if (img.src !== (img_src_value = ctx[2].url))
        attr(img, "src", img_src_value);
      attr(img, "alt", "flag");
      attr(img, "class", "svelte-18lie5o");
      attr(div0, "class", "imgcontainer svelte-18lie5o");
      attr(button0, "class", button0_class_value = "guess " + (ctx[3][0].isRed ? "redborder" : "") + " svelte-18lie5o");
      attr(button1, "class", button1_class_value = "guess " + (ctx[3][1].isRed ? "redborder" : "") + " svelte-18lie5o");
      attr(button2, "class", button2_class_value = "guess " + (ctx[3][2].isRed ? "redborder" : "") + " svelte-18lie5o");
      attr(button3, "class", button3_class_value = "guess " + (ctx[3][3].isRed ? "redborder" : "") + " svelte-18lie5o");
      attr(div1, "class", "guesses svelte-18lie5o");
      attr(div2, "class", "root");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, h1);
      append(div2, t1);
      append(div2, p0);
      append(p0, t2);
      append(div2, t3);
      if (if_block)
        if_block.m(div2, null);
      append(div2, t4);
      append(div2, p1);
      append(p1, t5);
      append(div2, t6);
      append(div2, div0);
      append(div0, img);
      append(div2, t7);
      append(div2, div1);
      append(div1, button0);
      append(button0, t8);
      append(div1, t9);
      append(div1, br0);
      append(div1, t10);
      append(div1, button1);
      append(button1, t11);
      append(div1, t12);
      append(div1, br1);
      append(div1, t13);
      append(div1, button2);
      append(button2, t14);
      append(div1, t15);
      append(div1, br2);
      append(div1, t16);
      append(div1, button3);
      append(button3, t17);
      if (!mounted) {
        dispose = [
          listen(window, "keydown", ctx[7]),
          listen(button0, "click", ctx[9]),
          listen(button1, "click", ctx[10]),
          listen(button2, "click", ctx[11]),
          listen(button3, "click", ctx[12])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 16)
        set_data(t2, ctx2[4]);
      if (ctx2[0].timerenabled) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div2, t4);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 2)
        set_data(t5, ctx2[1]);
      if (dirty & 4 && img.src !== (img_src_value = ctx2[2].url)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 8 && t8_value !== (t8_value = ctx2[3][0].name + ""))
        set_data(t8, t8_value);
      if (dirty & 8 && button0_class_value !== (button0_class_value = "guess " + (ctx2[3][0].isRed ? "redborder" : "") + " svelte-18lie5o")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & 8 && t11_value !== (t11_value = ctx2[3][1].name + ""))
        set_data(t11, t11_value);
      if (dirty & 8 && button1_class_value !== (button1_class_value = "guess " + (ctx2[3][1].isRed ? "redborder" : "") + " svelte-18lie5o")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & 8 && t14_value !== (t14_value = ctx2[3][2].name + ""))
        set_data(t14, t14_value);
      if (dirty & 8 && button2_class_value !== (button2_class_value = "guess " + (ctx2[3][2].isRed ? "redborder" : "") + " svelte-18lie5o")) {
        attr(button2, "class", button2_class_value);
      }
      if (dirty & 8 && t17_value !== (t17_value = ctx2[3][3].name + ""))
        set_data(t17, t17_value);
      if (dirty & 8 && button3_class_value !== (button3_class_value = "guess " + (ctx2[3][3].isRed ? "redborder" : "") + " svelte-18lie5o")) {
        attr(button3, "class", button3_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div2);
      if (if_block)
        if_block.d();
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
  let scorecount = "??/??";
  const dispatch = createEventDispatcher();
  let timer = 0;
  let timerinterval;
  function populatequestion(num) {
    $$invalidate(2, currentflag = flaglist[num]);
    flagnum = num;
    missedquestions = 0;
    for (var i = 0; i < guesses.length; i++) {
      let rand2 = randomcountryflag(currentflag.region);
      while (rand2.name == currentflag.name)
        rand2 = randomcountryflag();
      $$invalidate(3, guesses[i].name = rand2.name, guesses);
      $$invalidate(3, guesses[i].isRed = false, guesses);
    }
    $$invalidate(3, guesses[rand(0, guesses.length)].name = currentflag.name, guesses);
  }
  function chose(x) {
    console.log("clicked button #" + x);
    if (guesses[x].name == currentflag.name) {
      console.log("CORRECT");
      if (missedquestions == 0)
        correct++;
      flagnum++;
      if (flagnum + 1 == settings.count) {
        clearInterval(timerinterval);
        dispatch("win", {settings, correct, time: timer});
      }
      populatequestion(flagnum);
      $$invalidate(1, progresscheck = flagnum + 1 + "/" + settings.count);
      $$invalidate(4, scorecount = "Score: " + correct);
    } else {
      console.log("WRONG");
      $$invalidate(3, guesses[x].isRed = true, guesses);
      missedquestions++;
    }
  }
  function randomcountryflag(region) {
    let rand2 = countryflags[Math.floor(Math.random() * countryflags.length)];
    if (region == void 0)
      return rand2;
    else
      return rand2.region == region ? rand2 : randomcountryflag(region);
  }
  function start() {
    console.log("generating " + settings.count + " flags");
    while (flaglist.length < settings.count) {
      let rand2 = randomcountryflag();
      if (!flaglist.includes(rand2)) {
        flaglist.push(rand2);
      }
    }
    console.log(flaglist);
    $$invalidate(1, progresscheck = "1/" + settings.count);
    $$invalidate(4, scorecount = "Score: 0");
    if (settings.timerenabled) {
      timerinterval = setInterval(function() {
        $$invalidate(5, timer += 1);
      }, 100);
    }
    populatequestion(0);
  }
  function handleKeydown(event) {
    if (event.key == "1")
      chose(0);
    if (event.key == "2")
      chose(1);
    if (event.key == "3")
      chose(2);
    if (event.key == "4")
      chose(3);
  }
  start();
  const click_handler = () => chose(0);
  const click_handler_1 = () => chose(1);
  const click_handler_2 = () => chose(2);
  const click_handler_3 = () => chose(3);
  $$self.$$set = ($$props2) => {
    if ("settings" in $$props2)
      $$invalidate(0, settings = $$props2.settings);
  };
  return [
    settings,
    progresscheck,
    currentflag,
    guesses,
    scorecount,
    timer,
    chose,
    handleKeydown,
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
    if (!document.getElementById("svelte-18lie5o-style"))
      add_css();
    init(this, options, instance2, create_fragment2, safe_not_equal, {settings: 0, start: 8});
  }
  get start() {
    return this.$$.ctx[8];
  }
};
var game_default = Game;

// src/finish.svelte
function add_css2() {
  var style = element("style");
  style.id = "svelte-132t7yw-style";
  style.textContent = ".root.svelte-132t7yw{width:50%;margin:0 auto}@media(max-width: 1000px){.root.svelte-132t7yw{width:40%}}@media(max-width: 800px){.root.svelte-132t7yw{width:90%}}.result.svelte-132t7yw,.rainbow.svelte-132t7yw,.center.svelte-132t7yw{margin:0 auto;font-size:30pt;width:fit-content}.result.svelte-132t7yw{animation:svelte-132t7yw-monochrome 2.5s linear;animation-iteration-count:infinite}.rainbow.svelte-132t7yw{animation:svelte-132t7yw-rainbow 2.5s linear;animation-iteration-count:infinite;font-size:40pt}@keyframes svelte-132t7yw-rainbow{100%,0%{color:rgb(255,0,0)}8%{color:rgb(255,127,0)}16%{color:rgb(255,255,0)}25%{color:rgb(127,255,0)}33%{color:rgb(0,255,0)}41%{color:rgb(0,255,127)}50%{color:rgb(0,255,255)}58%{color:rgb(0,127,255)}66%{color:rgb(0,0,255)}75%{color:rgb(127,0,255)}83%{color:rgb(255,0,255)}91%{color:rgb(255,0,127)}}@keyframes svelte-132t7yw-monochrome{0%,100%{color:white}50%{color:black}}";
  append(document.head, style);
}
function create_else_block(ctx) {
  let h2;
  return {
    c() {
      h2 = element("h2");
      h2.textContent = "bad";
      attr(h2, "class", "result svelte-132t7yw");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(h2);
    }
  };
}
function create_if_block_2(ctx) {
  let h2;
  return {
    c() {
      h2 = element("h2");
      h2.textContent = "ok i guess";
      attr(h2, "class", "result svelte-132t7yw");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(h2);
    }
  };
}
function create_if_block_1(ctx) {
  let h1;
  return {
    c() {
      h1 = element("h1");
      h1.textContent = "EPIC";
      attr(h1, "class", "rainbow svelte-132t7yw");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(h1);
    }
  };
}
function create_if_block2(ctx) {
  let h3;
  let t0;
  let t1_value = ctx[0].time / 10 + "";
  let t1;
  let t2;
  return {
    c() {
      h3 = element("h3");
      t0 = text("time: ");
      t1 = text(t1_value);
      t2 = text("s");
      attr(h3, "class", "center svelte-132t7yw");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, t0);
      append(h3, t1);
      append(h3, t2);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].time / 10 + ""))
        set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching)
        detach(h3);
    }
  };
}
function create_fragment3(ctx) {
  let div;
  let h1;
  let t1;
  let br0;
  let t2;
  let t3;
  let br1;
  let t4;
  let h3;
  let t5;
  let t6_value = ctx[0].correct + 1 + "";
  let t6;
  let t7;
  let t8_value = ctx[0].settings.count + "";
  let t8;
  let t9;
  let t10;
  let br2;
  let t11;
  let button;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (ctx2[1] == 100)
      return create_if_block_1;
    if (ctx2[1] < 100 && ctx2[1] >= 50)
      return create_if_block_2;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block0 = current_block_type(ctx);
  let if_block1 = ctx[0].settings.timerenabled && create_if_block2(ctx);
  return {
    c() {
      div = element("div");
      h1 = element("h1");
      h1.textContent = "FINISHED";
      t1 = space();
      br0 = element("br");
      t2 = space();
      if_block0.c();
      t3 = space();
      br1 = element("br");
      t4 = space();
      h3 = element("h3");
      t5 = text("YOUR SCORE: ");
      t6 = text(t6_value);
      t7 = text("/");
      t8 = text(t8_value);
      t9 = space();
      if (if_block1)
        if_block1.c();
      t10 = space();
      br2 = element("br");
      t11 = space();
      button = element("button");
      button.textContent = "Try Again";
      attr(h1, "class", "center svelte-132t7yw");
      attr(h3, "class", "center svelte-132t7yw");
      attr(div, "class", "root svelte-132t7yw");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h1);
      append(div, t1);
      append(div, br0);
      append(div, t2);
      if_block0.m(div, null);
      append(div, t3);
      append(div, br1);
      append(div, t4);
      append(div, h3);
      append(h3, t5);
      append(h3, t6);
      append(h3, t7);
      append(h3, t8);
      append(div, t9);
      if (if_block1)
        if_block1.m(div, null);
      append(div, t10);
      append(div, br2);
      append(div, t11);
      append(div, button);
      if (!mounted) {
        dispose = listen(button, "click", ctx[2]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && t6_value !== (t6_value = ctx2[0].correct + 1 + ""))
        set_data(t6, t6_value);
      if (dirty & 1 && t8_value !== (t8_value = ctx2[0].settings.count + ""))
        set_data(t8, t8_value);
      if (ctx2[0].settings.timerenabled) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block2(ctx2);
          if_block1.c();
          if_block1.m(div, t10);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      if_block0.d();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function instance3($$self, $$props, $$invalidate) {
  let {enddata} = $$props;
  let percent = (enddata.correct + 1) / enddata.settings.count * 100;
  const dispatch = createEventDispatcher();
  function tryagain() {
    dispatch("gotomain");
  }
  $$self.$$set = ($$props2) => {
    if ("enddata" in $$props2)
      $$invalidate(0, enddata = $$props2.enddata);
  };
  return [enddata, percent, tryagain];
}
var Finish = class extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-132t7yw-style"))
      add_css2();
    init(this, options, instance3, create_fragment3, safe_not_equal, {enddata: 0});
  }
};
var finish_default = Finish;

// src/app.svelte
function add_css3() {
  var style = element("style");
  style.id = "svelte-tvo689-style";
  style.textContent = "h1.svelte-tvo689{margin:0 auto;width:fit-content}body{background-color:rgb(209, 223, 228)}button{width:100%;border:1px solid black;text-align:center;background-color:rgb(77, 77, 255);color:white;padding:10px;margin-top:2px;margin-bottom:2px;margin-left:auto;margin-right:auto}";
  append(document.head, style);
}
function create_else_block2(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "invalid menu";
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block_22(ctx) {
  let finish2;
  let updating_enddata;
  let current;
  function finish_enddata_binding(value) {
    ctx[7].call(null, value);
  }
  let finish_props = {};
  if (ctx[2] !== void 0) {
    finish_props.enddata = ctx[2];
  }
  finish2 = new finish_default({props: finish_props});
  binding_callbacks.push(() => bind(finish2, "enddata", finish_enddata_binding));
  finish2.$on("gotomain", ctx[5]);
  return {
    c() {
      create_component(finish2.$$.fragment);
    },
    m(target, anchor) {
      mount_component(finish2, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const finish_changes = {};
      if (!updating_enddata && dirty & 4) {
        updating_enddata = true;
        finish_changes.enddata = ctx2[2];
        add_flush_callback(() => updating_enddata = false);
      }
      finish2.$set(finish_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(finish2.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(finish2.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(finish2, detaching);
    }
  };
}
function create_if_block_12(ctx) {
  let game2;
  let updating_settings;
  let current;
  function game_settings_binding(value) {
    ctx[6].call(null, value);
  }
  let game_props = {};
  if (ctx[1] !== void 0) {
    game_props.settings = ctx[1];
  }
  game2 = new game_default({props: game_props});
  binding_callbacks.push(() => bind(game2, "settings", game_settings_binding));
  game2.$on("win", ctx[4]);
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
function create_if_block3(ctx) {
  let menu_1;
  let current;
  menu_1 = new menu_default({});
  menu_1.$on("startgame", ctx[3]);
  return {
    c() {
      create_component(menu_1.$$.fragment);
    },
    m(target, anchor) {
      mount_component(menu_1, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(menu_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(menu_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(menu_1, detaching);
    }
  };
}
function create_fragment4(ctx) {
  let div;
  let t1;
  let style;
  let t3;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block3, create_if_block_12, create_if_block_22, create_else_block2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] === 0)
      return 0;
    if (ctx2[0] === 1)
      return 1;
    if (ctx2[0] === 2)
      return 2;
    return 3;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      div = element("div");
      div.innerHTML = `<h1 class="svelte-tvo689">FLAG QUIZ</h1>`;
      t1 = space();
      style = element("style");
      style.textContent = "/* desktop */\n    .root {\n      width: 30%;\n      margin: 0 auto;\n    }\n\n    /* small desktop */\n    @media (max-width: 1100px) {\n      .root {\n        width: 60%;\n      }\n    }\n\n    /* mobile */\n    @media (max-width: 700px) {\n      .root {\n        width: 90%;\n      }\n\n      .imgcontainer {\n        max-height: 40vh !important;\n        height: 40vh !important;\n      }\n    }";
      t3 = space();
      if_block.c();
      if_block_anchor = empty();
      attr(div, "class", "root");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      insert(target, t1, anchor);
      append(document.head, style);
      insert(target, t3, anchor);
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
        detach(div);
      if (detaching)
        detach(t1);
      detach(style);
      if (detaching)
        detach(t3);
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance4($$self, $$props, $$invalidate) {
  let menu2 = 0;
  let gsettings;
  let enddata;
  function startgame(s) {
    $$invalidate(0, menu2 = 1);
    $$invalidate(1, gsettings = s.detail);
    console.log("got settings: ", s.detail);
  }
  function winner(w) {
    $$invalidate(0, menu2 = 2);
    $$invalidate(2, enddata = w.detail);
  }
  function gotomain() {
    $$invalidate(0, menu2 = 0);
  }
  function game_settings_binding(value) {
    gsettings = value;
    $$invalidate(1, gsettings);
  }
  function finish_enddata_binding(value) {
    enddata = value;
    $$invalidate(2, enddata);
  }
  return [
    menu2,
    gsettings,
    enddata,
    startgame,
    winner,
    gotomain,
    game_settings_binding,
    finish_enddata_binding
  ];
}
var App = class extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-tvo689-style"))
      add_css3();
    init(this, options, instance4, create_fragment4, safe_not_equal, {});
  }
};
var app_default = App;

// src/app.js
new app_default({
  target: document.body
});
