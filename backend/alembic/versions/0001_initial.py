"""initial

Revision ID: 0001
Revises:
Create Date: 2026-03-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### distributors ###
    op.create_table(
        'distributors',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('billing_email', sa.String(length=255), nullable=False),
        sa.Column('subscription_plan', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('billing_email'),
    )

    # ### outlets ###
    op.create_table(
        'outlets',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('distributor_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['distributor_id'], ['distributors.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    # ### users ###
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('distributor_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'STAFF', name='userrole'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['distributor_id'], ['distributors.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    # ### user_outlets ###
    op.create_table(
        'user_outlets',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('outlet_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['outlet_id'], ['outlets.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'outlet_id'),
    )

    # ### products ###
    op.create_table(
        'products',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('distributor_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sku', sa.String(length=100), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['distributor_id'], ['distributors.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('distributor_id', 'sku', name='uq_product_sku_per_distributor'),
    )

    # ### stock_ledger ###
    op.create_table(
        'stock_ledger',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('outlet_id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('type', sa.Enum('IN', 'OUT', 'ADJUSTMENT', name='ledgertype'), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['outlet_id'], ['outlets.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_stock_ledger_outlet_id'), 'stock_ledger', ['outlet_id'], unique=False)
    op.create_index(op.f('ix_stock_ledger_product_id'), 'stock_ledger', ['product_id'], unique=False)
    op.create_index(op.f('ix_stock_ledger_created_at'), 'stock_ledger', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_stock_ledger_created_at'), table_name='stock_ledger')
    op.drop_index(op.f('ix_stock_ledger_product_id'), table_name='stock_ledger')
    op.drop_index(op.f('ix_stock_ledger_outlet_id'), table_name='stock_ledger')
    op.drop_table('stock_ledger')
    op.drop_table('products')
    op.drop_table('user_outlets')
    op.drop_table('users')
    op.drop_table('outlets')
    op.drop_table('distributors')
    op.execute('DROP TYPE IF EXISTS ledgertype')
    op.execute('DROP TYPE IF EXISTS userrole')
