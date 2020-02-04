"""Added description requirement config

Revision ID: e4b5bd2a05cc
Revises: 56a1480bb7cc
Create Date: 2020-02-04 03:04:27.899172

"""

# revision identifiers, used by Alembic.
revision = 'e4b5bd2a05cc'
down_revision = '56a1480bb7cc'

from alembic import op
import sqlalchemy as sa
import oh_queue.models
from oh_queue.models import *


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    db.session.add(ConfigEntry(
        key='description_required',
        value='false',
        public=True
    ))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    db.session.remove(ConfigEntry(
        key='description_required',
    ))
    # ### end Alembic commands ###
