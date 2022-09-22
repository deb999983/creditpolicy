from django.urls import re_path
from . import views

# Update the url patterns

urlpatterns = [
    re_path(r'^policies/$', views.PolicyListCreateView.as_view(), name='policy-list-create'),
    re_path(r'^policies/(?P<pk>\d+)/$', views.PolicyDetailView.as_view(), name='policy-list-create'),
    re_path(r'^policies/(?P<pk>\d+)/complete/$', views.PolicyCompleteView.as_view(), name='policy-complete'),

    re_path(r'^policies/(?P<pk>\d+)/attributes/$', views.PolicyAttributesUpdateView.as_view(), name='policy-attribute-update'),
    re_path(r'^policies/(?P<pk>\d+)/apply/$', views.ApplyForCreditView.as_view(), name='apply-for-credit'),

    re_path(r'^conditions/(?P<pk>\d+)/(?P<val>true|false)/child/$', views.ConditionCreateView.as_view(), name='condition-create'),
    re_path(r'^conditions/(?P<pk>\d+)/$', views.ConditionUpdateRemoveView.as_view(), name='condition-update-remove'),
]

