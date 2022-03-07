FROM django

ARG INSTALL_DIR=/src
ENV PYTHONPATH=$INSTALL_DIR
ENV INSTALL_DIR=$INSTALL_DIR
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
