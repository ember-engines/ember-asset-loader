import { test, skip } from 'qunit';

const isPhantom = window.navigator.userAgent.indexOf('PhantomJS') !== -1;

export default function skipIfPhantom(title, ...args) {
  if (isPhantom) {
    return skip(`PHANTOM SKIP: ${title}`, ...args);
  } else {
    return test(...arguments);
  }
}
