FROM django

ARG BASE_DIR=/src
ENV PYTHONPATH=$BASE_DIR
ENV INSTALL_DIR=$BASE_DIR/api
WORKDIR $INSTALL_DIR

### Pull code
COPY . .


### Install dependencies
RUN pip install -r requirements.txt

## Port expose
EXPOSE 8000

## Run entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
