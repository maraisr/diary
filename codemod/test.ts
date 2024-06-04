import { info } from 'diary';
import { fatal, warn } from 'diary';
import x from 'y';

let user = { name: 'John' };

info('Hello, world!');
info('Hello %s', 'world');
info('Hello %o', { world: true });
info('Hello %o', user);
info('Hello %o for %o', user, user);

info('Hello %s with %s', 'world', 'extra', 'props');

function scope_example() {
    info('Hello %s %o', 'world', {
        user,
        user1: { name: 'John3' }, 
    });
}

fatal(new Error());

try {} catch(e) {
    fatal(e)
}

let errors = ['a', 'b']

warn('something bad', ...errors)
warn('something bad %s', ...errors);
warn('something bad %s', ...['a', 'b'])