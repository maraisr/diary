import { debug, diary, error, info, warn, log } from './src';

error('im a generic error');
warn('im a generic warn');
info('im a generic info');
debug('im a generic debug');
log('im a generic log');

const scoped = diary('my-module');
scoped.error('im error');
scoped.warn('im warn');
scoped.info('im info');
scoped.debug('im debug');
scoped.log('im log');

scoped.info('with an object', { hello: 'world' });
scoped.info('with an object', {
	lorem: 'ipsum',
	dolor: { sit: 'amet' },
	second: { lorem: 'ipsum', dolor: { sit: 'amet' } },
});
