const dependencyContainer = () => ({
    dependencies: new Map(),
    register(name, dependency) {
      this.dependencies.set(name, dependency);
    },
    createInstance(clazz) {
      const clazzDependencies = clazz.inject();
      const dependenciesToInject = clazzDependencies.map((name) => this.dependencies.get(name));
      return Reflect.construct(clazz, dependenciesToInject);
    },
  });
  
  window.Utils = {};
  
  window.Utils.debounce = (fn, wait) => {
    if (!fn || !fn instanceof Function) {
      throw new Error('debounce(): First argument must be a Function!');
    }
  
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        fn.apply(this, args);
      }, wait);
    };
  };
  
  window.Utils.countElapsedTime = (time) => {
    if (!time) {
      throw new Error('countElapsedTime(): Argument is missing!');
    }
  
    const now = Math.floor(Date.now() / 1000);
    const seconds = Math.floor(now - time);
  
    if (seconds === 0) {
      return 'przed chwilą';
    }
  
    if (seconds > 0 && seconds < 5) {
      return seconds === 1 ? 'sekundę temu' : `${seconds} sekundy temu`;
    }
  
    const timeChange = new Date(time * 1000);
    return `${timeChange.toLocaleDateString()} ${timeChange.toLocaleTimeString()}`;
  };
  
  window.Utils.validNip = (nip) => {
    
    if (!nip) {
      throw new Error('validNip(): Argument is missing!');
    }
  
    const type = typeof nip;
    const replaceExp = /[\s-]/g;
  
    if (type === 'number') {
      nip = nip.toString();
    } else {
      nip = nip.replace(replaceExp, '');
    }
    
    if (nip.length !== 10) {
      return false;
    }
  
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7, 1];
    const result = weights
      .map((weight, index) => weight * Number(nip[index]))
      .reduce((prevValue, value) => prevValue + value);
  
    const mod = result % 11;
    
    return mod !== 10;
  };
  
  window.App = {};
  
  window.App.Model = class Model {
    constructor() {
      this.data = this.getDataFromLocalStorage('form');
    }
  
    getDataFromLocalStorage(key) {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return {};
    }
  
    saveDataToLocalStorage(key) {
      const json = JSON.stringify(this.data);
      if (json) {
        window.localStorage.setItem(key, json);
      }
    }
  
    set(key, value) {
      const changed = Math.floor(Date.now() / 1000);
      const valueExp = typeof value === 'object' ? Object.assign({}, this.data[key], value) : value;
      
      Object.assign(this.data, {
        changed,
        [key]: valueExp,
      });
      this.saveDataToLocalStorage('form');
    }
  
    get(key) {
      return this.data[key];
    }
  
    isEmpty() {
      return Object.keys(this.data).length === 0;
    }
  };
  
  window.App.Form = class Form {
    static inject() { return ['model', 'validNip', 'debounce', 'countElapsedTime']; }
  
    constructor(model, validNip, debounce, countElapsedTime) {
      this.model = model;
      this.debounce = debounce;
      this.countElapsedTime = countElapsedTime;
      this.validationRule = {
        nip(value) {
          return validNip(value);
        },
      };
    }
    
    getGroup(name) {
      const groupExp = /^(\w+)(?:-(\w+))?$/;
      return name.match(groupExp);
    }
  
    saveValueToModel({ name, value }) {
      const [, group, subgroup] = this.getGroup(name);
  
      if (subgroup) {
        this.model.set(group, {
          [subgroup]: value,
        });
      } else {
        this.model.set(group, value);
      }
    }
    
    getValueFromModel(key) {
      return this.model.get(key);
    }
  
    printLastChangeTime() {
      const changed = this.getValueFromModel('changed');
  
      if (changed) {
        this.lastChangeEl.textContent = `Ostatnio zapisany ${this.countElapsedTime(changed)}.`;
      }
    }
  
    isValid(target) {
      const { dataset, value } = target;
  
      const { validRule } = dataset;
      const validAction = this.validationRule[validRule];
  
      if (validRule && validAction) {
        return target.checkValidity() && validAction(value);
      }
  
      return !!value.trim() && target.checkValidity();
    }
  
    toggleInvalidClass(target, className = 'invalid') {
      if (target.type !== 'radio' && !this.isValid(target)) {
        target.classList.add(className);
      } else if (target.classList.contains(className)){
        target.classList.remove(className);
      }
    }
  
    onChangeValue({ target }) {
      this.saveValueToModel(target);
      this.toggleInvalidClass(target);
      this.printLastChangeTime();
    }
  
    addEventListenerToInput(input) {
      const { type } = input;
      const listener = this.debounce(this.onChangeValue.bind(this), 250);
  
      if (type === 'radio') {
        input.addEventListener('change', listener);
      } else {
        input.addEventListener('input', listener);
      }
    }
  
    setAsChecked(value, input) {
      if (value === input.value) {
        input.checked = true;
      }
    }
  
    setValueInInput(input) {
      const { name } = input;
      const [, group, subgroup] = this.getGroup(name);
      const value = this.getValueFromModel(group);
  
      if (!value) {
        return;
      }
  
      if (input.type === 'radio') {
        this.setAsChecked(value, input);
        return;
      }
  
      if (subgroup) {
        if (value[subgroup]) {
          input.value = value[subgroup];
        }
      } else {
        input.value = value;
      }
    }
  
    init(formEl, lastChangeEl) {
      if (!formEl || !(formEl instanceof Element)) {
        throw new Error('init(): First argument must be a DOM Element!');
      }
  
      if (!lastChangeEl || !(lastChangeEl instanceof Element)) {
        throw new Error('init(): Second argument must be a DOM Element!');
      }
      
      this.lastChangeEl = lastChangeEl;
  
      const inputs = Array.from(formEl.querySelectorAll('input'));
  
      this.printLastChangeTime();
  
      for (const input of inputs) {
        if (!this.model.isEmpty()) {
          this.setValueInInput(input);
          this.toggleInvalidClass(input);
        }
        this.addEventListenerToInput(input);
      }
    }
  };
  
  (() => {
    const { validNip, debounce, countElapsedTime } = window.Utils;
    const { Form, Model } = window.App;
  
    const container = dependencyContainer();
    container.register('model', new Model());
    container.register('validNip', validNip);
    container.register('debounce', debounce);
    container.register('countElapsedTime', countElapsedTime);
  
    const form = container.createInstance(Form);
    form.init(document.querySelector('form'), document.querySelector('#lastChange'));
  })();
  