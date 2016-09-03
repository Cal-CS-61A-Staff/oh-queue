from webassets import Environment

assets_env = Environment(
    directory='oh_queue/static',
    url='/static')

assets_env.register('style.css',
    'css/style.css',
    output='public/style.css',
)

assets_env.register('common.js',
    'js/common.js',
    output='public/common.js',
)

assets_env.register('index.js',
    'js/index.js',
    output='public/index.js',
)

assets_env.register('ticket.js',
    'js/ticket.js',
    output='public/ticket.js',
)
