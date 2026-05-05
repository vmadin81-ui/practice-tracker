@router.get("/enterprises", response_model=PaginatedResponse[EnterpriseAnalyticsItem])
def get_enterprise_analytics(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=500),

    status_date: date = Query(...),
    search: str | None = None,
    has_issues: bool | None = None,  # red/yellow
    sort: str = Query(default="total"),  # total | red | yellow

    db: Session = Depends(get_db),
):
    total, items = get_enterprise_analytics_data(
        db=db,
        skip=skip,
        limit=limit,
        status_date=status_date,
        search=search,
        has_issues=has_issues,
        sort=sort,
    )

    return {"total": total, "items": items}
