  export let activeEffect = null;
  export const targetMap = new WeakMap();
  export const listeners = new WeakMap();
  export const compoListener=new Set()
  export const disconnectedEffects = new Map();
  export const templateCache = new Map()
  export const componentInstances = new Map()
  export const componentMount=new Map()
  let queue = new Set();
  let isFlushing = false;

  export const queueEffect = (effect) => {
    queue.add(effect);
    if (!isFlushing) {
      isFlushing = true;
      Promise.resolve().then(() => {
        queue.forEach((effect) => effect());
        queue.clear();
        isFlushing = false;
      });
    }
  };

  const isConnectedToDOM = (effect) => {
    
    if (!effect.el) return true; // If no element, assume always active
    let el = effect.el;
    while (el) {
      if (!el.isConnected) return false;
      el = el.parentElement;
    }
    return true;
  };
  const trackLatestState = (effect) => {
    if (!effect.el) return;
    
    for (const [target, depsMap] of disconnectedEffects.entries()) {
      for (const [key, depSet] of depsMap.entries()) {
        if (depSet.has(effect)) {
          depSet.delete(effect);
          track(target, key); // Re-track the effect
          queueEffect(effect); // Immediately trigger update
        }
      }
    }
  };
  
  // Add parent tracking to effects
  export const createEffect = (fn, el) => {
    const effect = () => {
        activeEffect = effect;
        effect.el = el;
        effect.parentEl = el?.parentElement; // Track parent for deeper checks
        fn();
        activeEffect = null;
    };

    let effectQueue = new Set();
    let isBatching = false;

    function batchEffect() {
        if (isBatching) return;
        isBatching = true;
        
        Promise.resolve().then(() => {
            effectQueue.forEach(eff => eff());
            effectQueue.clear();
            isBatching = false;
        });
    }

    const runEffect = () => {
        effectQueue.add(effect);
        batchEffect();
    };

    // Run effect initially in batch
    runEffect();

    if (el) {
        const observer = new MutationObserver(() => {
    
            if (isConnectedToDOM(effect)) {
                trackLatestState(effect); // Immediately update on reconnection
                runEffect(); // Schedule batched update
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        effect.observer = observer;
    }

    return effect;
};

  

export const track = (target, key) => {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }

    if (isConnectedToDOM(activeEffect)) {
      
      dep.add(activeEffect);
      disconnectedEffects.delete(activeEffect);
    } else {
      // Store effect separately for when it reconnects
      let depSet = disconnectedEffects.get(target);
      if (!depSet) {
        disconnectedEffects.set(target, (depSet = new Map()));
      }
      let keyDep = depSet.get(key);
      if (!keyDep) {
        depSet.set(key, (keyDep = new Set()));
      }
      keyDep.add(activeEffect);
      dep.delete(activeEffect); // Remove from active tracking
    }
  }
};


export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const dep = depsMap.get(key);
    if (dep) {
      
      dep.forEach(effect => queueEffect(effect));
    }
  }

  // If an effect reconnects, move it back to active tracking
  const disconnectedDep = disconnectedEffects.get(target)?.get(key);
  if (disconnectedDep) {
    disconnectedDep.forEach((effect) => {

      if (isConnectedToDOM(effect)) {

        track(target, key); // Re-track effect when reconnected
        queueEffect(effect);
      }
    });
  }

    // Update affected components
    componentInstances.forEach((instance, id) => {
      // console.log(target, instance.deps)
      if (instance.deps?.has(key)) {
        updateComponent(id)
      }
    })
};


