docker rm -f $(docker ps --filter name=xpp4m --format {{.ID}})
docker rmi -f xpp4m