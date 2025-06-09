FROM image.cestc.cn/ccos/nginx124-cclinux2209-consoleplugin:20231122
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx
# ！！！注意，最后一步必须是复制产物，流水线只能拿出最后一个layer做为产物的压缩包
COPY ./dist /usr/share/nginx/html