from django.urls import path

from . import views

urlpatterns = [
    path("login", views.LoginView.as_view(), name="auth-login"),
    path("register/farmer", views.RegisterFarmerView.as_view(), name="auth-register-farmer"),
    path("register/supplier", views.RegisterSupplierView.as_view(), name="auth-register-supplier"),
    path("logout", views.LogoutView.as_view(), name="auth-logout"),
    path("me", views.MeView.as_view(), name="auth-me"),
    path("profile", views.UpdateProfileView.as_view(), name="auth-update-profile"),
    path("profile/avatar", views.AvatarUploadView.as_view(), name="auth-avatar-upload"),
    path("change-password", views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("forgot-password", views.ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password", views.ResetPasswordView.as_view(), name="auth-reset-password"),
]
