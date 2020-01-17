```shell

# Windows
start nginx.exe -c conf\xpause4me-reverseproxy.conf
nginx -s stop

tasklist /fi "imagename eq nginx.exe"
taskkill /F /T /IM nginx.exe

```
