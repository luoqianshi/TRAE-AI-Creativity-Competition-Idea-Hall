from sqlalchemy.orm import Session

from app.models.user import User
from app.models.world import World
from app.schemas.world import WorldOut, WorldUpdate


def _world_to_out(world: World) -> WorldOut:
    return WorldOut(
        id=world.id,
        user_id=world.user_id,
        name=world.name,
        desc=world.desc,
        powerSystem=world.power_system,
        created_at=world.created_at,
        updated_at=world.updated_at,
    )


def get_world(db: Session, current_user: User) -> WorldOut:
    world = db.query(World).filter(World.user_id == current_user.id).first()
    if world is None:
        world = World(user_id=current_user.id)
        db.add(world)
        db.commit()
        db.refresh(world)
    return _world_to_out(world)


def upsert_world(db: Session, current_user: User, payload: WorldUpdate) -> WorldOut:
    world = db.query(World).filter(World.user_id == current_user.id).first()
    if world is None:
        world = World(user_id=current_user.id)
        db.add(world)

    world.name = payload.name or ""
    world.desc = payload.desc or ""
    world.power_system = payload.powerSystem or ""
    db.commit()
    db.refresh(world)
    return _world_to_out(world)
