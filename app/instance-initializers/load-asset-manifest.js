import manifest from '../asset-manifest';

export function initialize(instance) {
  const service = instance.lookup('service:asset-loader');
  service.pushManifest(manifest);
}

export default {
  name: 'load-asset-manifest',
  initialize
};
