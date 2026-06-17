from django.urls import path
from .views import (
    CategoryListView, UnitListView, VendorListView, ItemListView,
    PurchaseView, IssueView, WastageView, DashboardStatsView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('units/', UnitListView.as_view(), name='unit-list'),
    path('vendors/', VendorListView.as_view(), name='vendor-list'),
    path('items/', ItemListView.as_view(), name='item-list'),
    path('purchase/', PurchaseView.as_view(), name='record-purchase'),
    path('issue/', IssueView.as_view(), name='record-issue'),
    path('wastage/', WastageView.as_view(), name='record-wastage'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
