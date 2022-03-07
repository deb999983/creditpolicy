import os

from . import *

INSTALLED_APPS += [
	"corsheaders",
	"rest_framework",
	"drf_spectacular",
	"credit_policy"
]

CORS_ORIGIN_ALLOW_ALL = True

MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"] + MIDDLEWARE


REST_FRAMEWORK = {
	# YOUR SETTINGS
	'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',

	# Use Django's standard `django.contrib.auth` permissions,
	# or allow read-only access for unauthenticated users.
	'DEFAULT_PERMISSION_CLASSES': [],
	'DEFAULT_AUTHENTICATION_CLASSES': [],
	'UNAUTHENTICATED_USER': None
}

SPECTACULAR_SETTINGS = {
	'TITLE': 'Credit Policy API',
	'DESCRIPTION': 'Your project description',
	'VERSION': '1.0.0',
	'SERVE_AUTHENTICATION': None,
	'SERVE_PERMISSIONS': [],
	# OTHER SETTINGS

	'SERVERS': [
		{"url": "/"},
		{"url": "/api/dev"},
		{"url": "/api"},
	]
}


DATABASES = {
    'default': {
		'ENGINE': 'django.db.backends.mysql',
		'HOST': os.environ.get('MY_DB_HOST', 'localhost'),
		'PORT': os.environ.get('MY_DB_PORT', '3306'),
		'NAME': os.environ.get('MY_DB_NAME', 'cp_local',),
		'USER': os.environ.get('MY_DB_USER', 'root'),
		'PASSWORD': os.environ.get('MY_DB_PASSWORD', 'mindfire')
	}
}
