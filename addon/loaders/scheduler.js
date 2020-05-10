import Ember from 'ember';
export const defaultScheduler = (work) => Ember.run.schedule('afterRender', work);

let scheduler = defaultScheduler;

export function setScheduler(_scheduler) {
  scheduler = _scheduler;
}

export function scheduleWork(work) {
  Ember.run.join(scheduler, work);
}