from inspect import isawaitable
from loguru import logger
from pydantic import ValidationError

from api.db import db_client
from api.enums import OrganizationConfigurationKey
from api.schemas.business_hours import BusinessHoursConfiguration

async def get_business_hours(
    organization_id: int | None,
    db=None,
) -> BusinessHoursConfiguration:
    if organization_id is None:
        return BusinessHoursConfiguration()

    db = db or db_client
    row = db.get_configuration(
        organization_id,
        OrganizationConfigurationKey.BUSINESS_HOURS.value,
    )
    if isawaitable(row):
        row = await row

    if row is None or not row.value:
        return BusinessHoursConfiguration()

    try:
        return BusinessHoursConfiguration.model_validate(row.value)
    except ValidationError as exc:
        logger.warning(
            f"Invalid business hours configuration for organization {organization_id}: {exc}. Returning defaults."
        )
        return BusinessHoursConfiguration()

async def upsert_business_hours(
    organization_id: int,
    config: BusinessHoursConfiguration,
) -> BusinessHoursConfiguration:
    await db_client.upsert_configuration(
        organization_id,
        OrganizationConfigurationKey.BUSINESS_HOURS.value,
        config.model_dump(mode="json", exclude_none=True),
    )
    return config
