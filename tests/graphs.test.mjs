import test from 'node:test';
import assert from 'node:assert/strict';
import {Scope} from '../dist/graphs.js';
test('Playing scope retains one animation loop across repeated resize and update',()=>{
  let id=0,resize;const frames=new Map();
  globalThis.requestAnimationFrame=cb=>{frames.set(++id,cb);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.matchMedia=()=>({matches:false});
  globalThis.window={devicePixelRatio:1};
  globalThis.ResizeObserver=class{constructor(cb){resize=cb;}observe(){}};
  const ctx=new Proxy({},{get:(obj,key)=>obj[key]??(()=>{}),set:(obj,key,value)=>(obj[key]=value,true)});
  const canvas={clientWidth:600,clientHeight:200,getContext:()=>ctx,setAttribute(){}};
  const scope=new Scope(canvas);scope.update(0,{value:90,mode:'sum'},'en',true);
  assert.equal(frames.size,1);resize();resize();assert.equal(frames.size,1);
  scope.update(0,{value:180,mode:'sum'},'en',true);assert.equal(frames.size,1);
  scope.update(0,{value:180,mode:'sum'},'en',false);assert.equal(frames.size,0);
});
