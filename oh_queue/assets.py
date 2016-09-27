import glob
import os

import webassets
import webassets.filter

ASSETS_DIRECTORY = 'oh_queue/static'

assets_env = webassets.Environment(
    directory=ASSETS_DIRECTORY,
    url='/static',
)
assets_env.config['BABEL_BIN'] = 'node_modules/babel-cli/bin/babel.js'

babel = webassets.filter.get_filter('babel', presets='es2015,react')

assets_env.register('style.css',
    'css/style.css',
    output='public/style.css',
)

def glob_assets(pattern):
    cwd = os.getcwd()
    try:
        os.chdir(ASSETS_DIRECTORY)
        return glob.glob(pattern, recursive=True)
    finally:
        os.chdir(cwd)

assets_env.register('common.js',
    *glob_assets('js/components/*.js'),
    'js/common.js',  # must be last
    filters=babel,
    output='public/common.js',
)
