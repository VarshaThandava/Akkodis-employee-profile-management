"""add new employee fields

Revision ID: 459b8533cf30
Revises: 
Create Date: 2026-10-28 21:18:14.266519

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '459b8533cf30'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'employees',
        sa.Column('current_role', sa.String(length=255), nullable=True)
    )

    op.add_column(
        'employees',
        sa.Column('years_of_experience', sa.Float(), nullable=True)
    )

    op.add_column(
        'employees',
        sa.Column('location', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('employees', 'location')
    op.drop_column('employees', 'years_of_experience')
    op.drop_column('employees', 'current_role')
