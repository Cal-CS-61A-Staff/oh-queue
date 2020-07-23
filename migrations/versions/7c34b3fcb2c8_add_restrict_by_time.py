"""add restrict_by_time

Revision ID: 7c34b3fcb2c8
Revises: 4c81c3744bc4
Create Date: 2020-07-22 19:35:15.597100

"""

# revision identifiers, used by Alembic.
revision = '7c34b3fcb2c8'
down_revision = '4c81c3744bc4'

from alembic import op
import sqlalchemy as sa
import oh_queue.models
from oh_queue.models import *


def upgrade():

    # Get alembic DB bind
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    for course in session.query(ConfigEntry.course).distinct():
        session.add(ConfigEntry(key='restrict_by_time', value='false', public=True, course=course[0]))

    session.commit()


def downgrade():
    pass
