"""Add position to interviews.

Revision ID: 9c4e6d1a2b7f
Revises: 7a3f2c1d9b60
Create Date: 2026-10-29 10:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c4e6d1a2b7f"
down_revision: Union[str, Sequence[str], None] = "7a3f2c1d9b60"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "interviews",
        sa.Column("position", sa.String(length=120), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("interviews", "position")
