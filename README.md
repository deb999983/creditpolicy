#### Build Process:
To build the project download the project, and just run command 
```
`./build.sh.
```

This command does the following things, 
 - Starts an nginx server.
 - Starts the database server.
 - Builds and starts up the python/django service.


#### Local Urls:
- **ApiService**: 
  - http://localhost:9010/api/
- **ApiDoc**: Has a description of apis, and the corresponding request and response data 
  - http://localhost:9010/api/swagger/
- **Client**:
  - http://localhost:9010/client/



#### Remote Urls:
- **ApiService**: 
  - http://ec2-13-127-98-111.ap-south-1.compute.amazonaws.com:9010/api/
- **ApiDoc**: Has a description of apis, and the corresponding request and response data 
  - http://ec2-13-127-98-111.ap-south-1.compute.amazonaws.com:9010/api/swagger/
- **Client**:
  - http://ec2-13-127-98-111.ap-south-1.compute.amazonaws.com:9010/client/
