from django.urls import path
from .views import CategoryListView, ItemListView, ItemDetailView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='inventory-categories'),
    path('items/', ItemListView.as_view(), name='inventory-items'),
    path('items/<int:item_id>/', ItemDetailView.as_view(), name='inventory-item-detail'),
]
