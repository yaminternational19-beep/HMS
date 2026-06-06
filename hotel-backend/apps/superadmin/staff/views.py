from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from core.middleware.jwt_auth import superadmin_required
from .services import StaffService
from .serializers import StaffSerializer
from .models import Staff, StaffLog


# =====================================================================
# SUPER ADMIN ONLY: GET All Staff Listing
# =====================================================================
@superadmin_required
def get_staff_list(request):
    """
    Retrieves the complete list of staff agents, supporting searching
    and category filtering. Restricted strictly to Super Admins.
    """
    try:
        filters = {
            'search': request.GET.get('search'),
            'dept': request.GET.get('dept'),
            'status': request.GET.get('status'),
            'shiftId': request.GET.get('shiftId'),
            'duty': request.GET.get('duty')
        }
        staff_list = StaffService.get_all_staff(filters)
        return success_response(
            message="Staff directory fetched successfully",
            data=staff_list,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to fetch staff directory.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: POST Onboard Staff Agent
# =====================================================================
@superadmin_required
def onboard_staff_agent(request):
    """
    Validates payload and registers a new custom staff record.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data
        
        # Validates payload using StaffSerializer for standard constraints
        serializer = StaffSerializer(data=data)
        if not serializer.is_valid():
            error_msgs = []
            for field, errs in serializer.errors.items():
                detail = errs[0] if isinstance(errs, list) else str(errs)
                error_msgs.append(f"{field}: {detail}")
            clear_message = "Validation failed: " + "; ".join(error_msgs)
            
            return error_response(
                message=clear_message,
                errors=serializer.errors,
                status_code=StatusCodes.BAD_REQUEST
            )

        new_member = StaffService.create_staff(data=serializer.validated_data, files=request.FILES)
        
        return success_response(
            message="Staff agent successfully onboarded!",
            data=new_member,
            status_code=StatusCodes.CREATED
        )
        
    except ValueError as ve:
        return error_response(
            message=str(ve),
            errors={"validation": str(ve)},
            status_code=StatusCodes.BAD_REQUEST
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return error_response(
            message="An unexpected error occurred during staff onboarding.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# ROUTER: GET (List) & POST (Create)
# =====================================================================
@api_view(['GET', 'POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@superadmin_required
def staff_list_create(request):
    """
    Routes GET requests to list all staff and POST requests to onboard new staff.
    Guarded via @superadmin_required.
    """
    if request.method == 'GET':
        return get_staff_list(request)
    elif request.method == 'POST':
        return onboard_staff_agent(request)


# =====================================================================
# SUPER ADMIN ONLY: PUT Update Staff Details
# =====================================================================
@superadmin_required
def update_staff_agent(request, staff_id):
    """
    Validates partial payload and updates staff attributes for specified ID.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data

        try:
            member_instance = Staff.objects.get(id=staff_id.strip())
        except Staff.DoesNotExist:
            return error_response(
                message=f"Staff agent {staff_id} does not exist.",
                errors={"not_found": "Staff missing"},
                status_code=StatusCodes.NOT_FOUND
            )

        # Validates payload using StaffSerializer in partial mode
        serializer = StaffSerializer(member_instance, data=data, partial=True)
        if not serializer.is_valid():
            error_msgs = []
            for field, errs in serializer.errors.items():
                detail = errs[0] if isinstance(errs, list) else str(errs)
                error_msgs.append(f"{field}: {detail}")
            clear_message = "Validation failed: " + "; ".join(error_msgs)
            
            return error_response(
                message=clear_message,
                errors=serializer.errors,
                status_code=StatusCodes.BAD_REQUEST
            )

        updated_member = StaffService.update_staff(staff_id=staff_id, data=serializer.validated_data, files=request.FILES)
        
        return success_response(
            message="Staff profile successfully updated.",
            data=updated_member,
            status_code=StatusCodes.OK
        )
    except ValueError as ve:
        return error_response(
            message=str(ve),
            errors={"validation": str(ve)},
            status_code=StatusCodes.BAD_REQUEST
        )
    except Exception as e:
        return error_response(
            message="An unexpected error occurred during profile modification.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: DELETE Offboard Staff Agent
# =====================================================================
@superadmin_required
def delete_staff_agent(request, staff_id):
    """
    Deletes (offboards) the specified staff record from the system.
    Restricted strictly to Super Admins.
    """
    try:
        deleted = StaffService.delete_staff(staff_id)
        if not deleted:
            return error_response(
                message=f"Staff agent {staff_id} does not exist.",
                errors={"not_found": "Staff missing"},
                status_code=StatusCodes.NOT_FOUND
            )
        return success_response(
            message="Staff member successfully retired and deleted.",
            data={},
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="An unexpected error occurred during staff deletion.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# ROUTER: PUT (Update) & DELETE (Delete)
# =====================================================================
@api_view(['PUT', 'DELETE'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@superadmin_required
def staff_detail_update_delete(request, staff_id):
    """
    Routes PUT (Edit) and DELETE (Remove) requests for a single staff ID.
    Guarded via @superadmin_required.
    """
    if request.method == 'PUT':
        return update_staff_agent(request, staff_id)
    elif request.method == 'DELETE':
        return delete_staff_agent(request, staff_id)


# =====================================================================
# SUPER ADMIN ONLY: GET All Staff Login/Logout Logs
# =====================================================================
@api_view(['GET'])
@superadmin_required
def staff_logs_view(request):
    """
    Retrieves a paginated list of staff login/logout logs or daily summary groupings.
    Supports filtering by period, staff ID, month, and year. Includes dynamic stats.
    """
    try:
        from zoneinfo import ZoneInfo
        from datetime import datetime, timedelta
        from core.services.pagination import DefaultPagination
        
        ist_tz = ZoneInfo('Asia/Kolkata')
        now_ist = datetime.now(ist_tz)
        today_date = now_ist.date()
        tomorrow_date = today_date + timedelta(days=1)
        
        queryset = StaffLog.objects.all().order_by('-timestamp')
        
        # 1. Filter by Staff ID
        staff_id = request.GET.get('staffId') or request.GET.get('staff_id')
        if staff_id and staff_id != 'all':
            queryset = queryset.filter(staff_id=staff_id.strip())
            
        # 2. Filter by Period / Custom Month & Year
        period = request.GET.get('period', 'today')
        month = request.GET.get('month')
        year = request.GET.get('year')
        
        filtered_logs = []
        for log in queryset:
            ist_timestamp = log.timestamp.astimezone(ist_tz)
            log_date = ist_timestamp.date()
            
            if period == 'today':
                if log_date != today_date:
                    continue
            elif period == 'tomorrow':
                if log_date != tomorrow_date:
                    continue
            elif period == 'week':
                diff_days = (today_date - log_date).days
                if not (-1 <= diff_days <= 7):
                    continue
            elif period == 'month':
                if ist_timestamp.year != today_date.year or ist_timestamp.month != today_date.month:
                    continue
            elif period == 'year':
                if ist_timestamp.year != today_date.year:
                    continue
            elif period == 'all':
                if month and month != 'all' and ist_timestamp.month != int(month):
                    continue
                if year and year != 'all' and ist_timestamp.year != int(year):
                    continue
            
            filtered_logs.append(log)
            
        # 3. Calculate Stats based on all filtered logs
        total_logins = sum(1 for log in filtered_logs if log.action == 'login')
        total_logouts = sum(1 for log in filtered_logs if log.action == 'logout')
        total_activities = len(filtered_logs)
        
        stats = {
            "totalLogins": total_logins,
            "totalLogouts": total_logouts,
            "totalActivities": total_activities
        }
        
        # 4. Check active Tab
        tab = request.GET.get('tab', 'chronological')
        paginator = DefaultPagination()
        
        if tab == 'dailySummary':
            # Aggregate Daily Summaries
            summary_map = {}
            for log in filtered_logs:
                ist_timestamp = log.timestamp.astimezone(ist_tz)
                log_date_str = ist_timestamp.strftime("%Y-%m-%d")
                key = f"{log_date_str}_{log.staff.id}"
                
                if key not in summary_map:
                    summary_map[key] = {
                        "date": log_date_str,
                        "staffId": log.staff.id,
                        "staffCode": log.staff.uniqueCode,
                        "staffName": log.staff.name,
                        "role": log.staff.dept,
                        "shiftName": log.staff.shift.name,
                        "shiftTime": log.staff.shift.time,
                        "logins": 0,
                        "logouts": 0
                    }
                    
                if log.action == 'login':
                    summary_map[key]["logins"] += 1
                elif log.action == 'logout':
                    summary_map[key]["logouts"] += 1
            
            daily_summary_list = list(summary_map.values())
            # Stable sort: first by staffId ascending, then by date descending
            daily_summary_list.sort(key=lambda x: x["staffId"])
            daily_summary_list.sort(key=lambda x: x["date"], reverse=True)
            
            paginated_data = paginator.paginate_queryset(daily_summary_list, request)
            
            return success_response(
                message="Staff daily summaries fetched successfully",
                data={
                    "dailySummaries": paginated_data,
                    "pagination": {
                        "totalItems": paginator.page.paginator.count,
                        "totalPages": paginator.page.paginator.num_pages,
                        "currentPage": paginator.page.number,
                        "itemsPerPage": paginator.page_size,
                        "hasNext": paginator.page.has_next()
                    },
                    "stats": stats
                },
                status_code=StatusCodes.OK
            )
            
        else:
            # Chronological Logs
            paginated_logs = paginator.paginate_queryset(filtered_logs, request)
            
            logs_data = []
            for log in paginated_logs:
                ist_timestamp = log.timestamp.astimezone(ist_tz)
                logs_data.append({
                    "id": log.id,
                    "staffId": log.staff.id,
                    "staffCode": log.staff.uniqueCode,
                    "staffName": log.staff.name,
                    "role": log.staff.dept,
                    "shiftName": log.staff.shift.name,
                    "shiftTime": log.staff.shift.time,
                    "action": log.action,
                    "timestamp": ist_timestamp.isoformat(),
                    "date": ist_timestamp.strftime("%Y-%m-%d"),
                    "time": ist_timestamp.strftime("%I:%M:%S %p")
                })
                
            return success_response(
                message="Staff logs fetched successfully",
                data={
                    "logs": logs_data,
                    "pagination": {
                        "totalItems": paginator.page.paginator.count,
                        "totalPages": paginator.page.paginator.num_pages,
                        "currentPage": paginator.page.number,
                        "itemsPerPage": paginator.page_size,
                        "hasNext": paginator.page.has_next()
                    },
                    "stats": stats
                },
                status_code=StatusCodes.OK
            )
            
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return error_response(
            message="Failed to fetch staff logs.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )
