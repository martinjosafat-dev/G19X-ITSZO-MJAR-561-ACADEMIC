"""Add interview evaluation feedback.

Revision ID: 7a3f2c1d9b60
Revises: 58cba2bf0696
Create Date: 2026-10-15 15:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7a3f2c1d9b60"
down_revision: Union[str, Sequence[str], None] = "58cba2bf0696"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "interviews",
        sa.Column("evaluation_feedback", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("interviews", "evaluation_feedback")
