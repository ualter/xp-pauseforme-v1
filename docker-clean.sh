docker rm -f $(docker ps --filter name=xp-pause4me --format {{.ID}})
docker rmi -f xp-pause4me