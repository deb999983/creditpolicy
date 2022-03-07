FROM python:3.9.7-alpine

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install mysql-client, Git, ffmpeg
RUN apk update \
    && apk add --no-cache --virtual .build-deps gcc musl-dev mariadb-connector-c-dev \
    && pip install --upgrade pip \
    && pip install mysqlclient \
    && apk del .build-deps \
    && apk add --no-cache -q git ffmpeg mariadb-connector-c

## Install dependencies.
RUN pip install --upgrade pip && \
    pip install urllib3 requests pytz \
    Django==3.2.* djangorestframework \
    django-filter djangorestframework-filters==1.0.0.dev2 \
    drf-spectacular \
    gunicorn
