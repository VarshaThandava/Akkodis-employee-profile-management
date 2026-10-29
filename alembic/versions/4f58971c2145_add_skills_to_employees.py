"""add skills to employees

Revision ID: 4f58971c2145
Revises: a03373349b3d
Create Date: 2026-10-29 13:25:17.850315

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f58971c2145'
down_revision: Union[str, Sequence[str], None] = 'a03373349b3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column(
            "technical_skill",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'")
        )
    )


def downgrade() -> None:
    op.drop_column("employees", "technical_skill")