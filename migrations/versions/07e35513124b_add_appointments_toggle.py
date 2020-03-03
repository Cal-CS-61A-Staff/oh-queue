"""add appointments toggle

Revision ID: 07e35513124b
Revises: 7141eb5952ee
Create Date: 2020-03-02 23:50:26.954020

"""

# revision identifiers, used by Alembic.
revision = '07e35513124b'
down_revision = '7141eb5952ee'

from alembic import op
import sqlalchemy as sa
import oh_queue.models
from sqlalchemy import orm
from oh_queue.models import *


def upgrade():
    # Get alembic DB bind
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    # Seed default config values
    session.add(ConfigEntry(key='appointments_open', value='false', public=True))

    session.commit()

def downgrade():
    # Get alembic DB bind
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    # Delete config values
    query = session.query(ConfigEntry)
    query.filter(ConfigEntry.key == 'appointments_open').delete(synchronize_session=False)

    session.commit()
