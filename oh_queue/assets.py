import webassets
import webassets.filter

assets_env = webassets.Environment(
    directory='oh_queue/static',
    url='/static',
)
assets_env.config['BABEL_BIN'] = 'node_modules/babel-cli/bin/babel.js'

babel = webassets.filter.get_filter('babel', presets='es2015,react')

assets_env.register('style.css',
    'css/style.css',
    output='public/style.css',
)

assets_env.register('common.js',
'js/components/app.js',
    'js/components/jumbotron.js',
    'js/components/navbar.js',
    'js/components/queue.js',
    'js/components/ticket.js',
    'js/components/ticket_view.js',
    'js/common.js',
    filters=babel,
    output='public/common.js',
)

assets_env.register('ticket.js',
    'js/ticket.js',
    filters=babel,
    output='public/ticket.js',
)
