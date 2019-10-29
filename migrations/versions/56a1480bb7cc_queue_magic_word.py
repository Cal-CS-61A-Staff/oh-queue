"""Add queue password support

Revision ID: 56a1480bb7cc
Revises: 1b5a90520562
Create Date: 2019-10-14 01:01:34.298396

"""

# revision identifiers, used by Alembic.
revision = '56a1480bb7cc'
down_revision = '1b5a90520562'

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.ext.declarative import declarative_base
from oh_queue.models import ConfigEntry

# BaseTable = declarative_base()

# class ConfigEntry(BaseTable):
#     __tablename__ = 'config_entries'
#     key = sa.Column(sa.String(255), primary_key=True)
#     value = sa.Column(sa.Text(), nullable=False)
#     public = sa.Column(sa.Boolean, default=False)

def upgrade():
    # Get alembic DB bind
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    # Seed default config values
    session.add(ConfigEntry(key='queue_magic_word_mode', value='none', public=True))
    session.add(ConfigEntry(key='queue_magic_word_data', value='', public=False))

    session.commit()

def downgrade():
    # Get alembic DB bind
    connection = op.get_bind()
    session = orm.Session(bind=connection)

    # Delete config values
    query = session.query(ConfigEntry)
    query.filter(ConfigEntry.key == 'queue_magic_word_mode').delete(synchronize_session=False)
    query.filter(ConfigEntry.key == 'queue_magic_word_data').delete(synchronize_session=False)

    session.commit()
