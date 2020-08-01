"""require appointment fields

Revision ID: 046d24dc80b6
Revises: 4c81c3744bc4
Create Date: 2020-08-01 04:40:56.908992

"""

# revision identifiers, used by Alembic.
revision = '046d24dc80b6'
down_revision = '4c81c3744bc4'

from alembic import op
import sqlalchemy as sa
import oh_queue.models
from oh_queue.models import *


def upgrade():
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    for course in session.query(ConfigEntry.course).distinct():
        session.add(ConfigEntry(key='appointment_fields_required', value='false', public=True, course=course[0]))

    session.commit()

def downgrade():
    pass
