************windows系统下安装rabbitMQ************
1.安装Erlang语言(http://www.erlang.org/downloads)，根据系统版本下载；
    # 添加bin目录至系统环境;
2.安装rabbitMQ-server；
    # 添加bin目录至系统环境;
3.设置rabbitMQ
    rabbitmqctl add_user myuser mypassword
    rabbitmqctl add_vhost myvhost
    rabbitmqctl set_user_tags myuser mytag
    rabbitmqctl set_permissions -p myvhost myuser ".*" ".*" ".*"  # 必须给用户与host授予权限
4.运行rabbitMQ
    rabbitmq-server
    rabbitmq-server -detached  # 后台运行
    rabbitmqctl stop  # 关闭rabbitMQ
5.broker配置
    BROKER_URL = 'amqp://root:password@localhost:5672/myvhost'
6.管理rabbitMQ
    # 启动服务
    rabbitmq-plugins enable rabbitmq_management
    # 访问http://localhost:15672


************windows系统下安装redis************
1.github下载地址：https://github.com/MSOpenTech/redis/tags 
    # 选择下载Redis-x64-3.2.100
    # 添加bin目录至系统环境;
2.启动redis
    redis-server redis.windows.conf # 指定配置文件开启
    redis-server --service-install redis.windows-service.conf --loglevel verbose  # 开机自动启用
3.测试redis启动情况
    redis-cli.exe -h 127.0.0.1 -p 6379
    >> ping
    >> pong
    

************Linux系统下，运行程序前需要安装wkhtmltopdf启动程序，用以生成pdf文件************
1.下载地址：https://wkhtmltopdf.org/downloads.html
2.安装依赖(ubuntu16.4为例):sudo apt-get -f install xfonts-75dpi
3.安装wkhtmltopdf:dpkg -i wkhtmltox_0.12.5-1.xenial_amd64.deb


************windows需要手动启用winrm服务************
1.将网络修改成专用网络;
1.在windows系统中通过管理员权限启动cmd终端;
2.输入命令winrm qc
  # 会弹出窗口：执行这些更改吗[y/n]?
  # 输入y   确认启用
3.输入命令:
winrm set winrm/config/service/auth @{Basic="true"}
winrm set winrm/config/service @{AllowUnencrypted="true"}


************Centos系统下部署环境 nginx+uwsgi+django************
一.更新系统软件包
yum update -y

二.安装软件管理包和可能使用的依赖
yum -y groupinstall "Development tools"
yum install openssl-devel bzip2-devel expat-devel gdbm-devel readline-devel sqlite-devel

三、安装python3
wget https://www.python.org/ftp/python/3.6.6/Python-3.6.6.tgz

# 解压
tar -zxvf Python-3.6.6.tgz

cd /Python-3.6.6
# 编译
./configure --prefix=/usr/local/python3
make
make install

# 建立软链接
ln -s /usr/local/python3/bin/python3.6 /usr/bin/python3
ln -s /usr/local/python3/bin/pip3.6 /usr/bin/pip3

# 查看python3与pip3版本
python3
pip3 -V

四、安装django项目依赖包与uwsgi(requirements.txt已经提供)
pip3 install uwsgi
pip3 install -r requirements.txt

五、配置uwsgi
# 在项目目录下创建TSDRM.xml
<uwsgi>
    <socket>127.0.0.1:8997</socket><!-- 内部端口，自定义 -->
    <chdir>/var/www/html/TSDRM/</chdir><!-- 项目路径 -->
    <module>TSDRM.wsgi</module>
    <processes>4</processes> <!-- 进程数 -->
    <daemonize>uwsgi.log</daemonize><!-- 日志文件 -->
</uwsgi>

六、安装/配置nginx
# 在/home目录下
wget http://nginx.org/download/nginx-1.13.7.tar.gz

# 解压/配置
tar -zxvf nginx-1.13.7.tar.gz
cd nginx-1.13.7
./configure
make
make install

# 备份nginx配置文件
cd /usr/local/nginx/conf/
cp nginx.conf nginx.conf.bak

# 修改nginx配置(删除原有的)
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    server {
        listen       80;
        server_name  localhost;
        charset utf-8;
        location / {
            include uwsgi_params;
            uwsgi_pass 127.0.0.1:8997;
            uwsgi_param UWSGI_SCRIPT TSDRM.wsgi;
            uwsgi_param UWSGI_CHDIR /var/www/html/TSDRM;
        }
        location /static/ {
            alias /var/www/html/TSDRM/static/;
        }
    }
}

七.启动nginx
/usr/local/nginx/sbin/nginx
# /usr/local/nginx/sbin/nginx -t 检查
# /usr/local/nginx/sbin/nginx -s reload 重启nginx

八.启动uwsgi
cd /var/www/html/TSDRM
uwsgi -x TSDRM.xml

# 重启nginx
# 此时项目就可以访问了，只是静态文件未读取？？？

九.解决静态文件问题
# settings.py文件中写入静态文件物理路径(已经写了)
SITE_ROOT=os.path.join(os.path.abspath(os.path.dirname(__file__)),'..')
STATIC_ROOT = os.path.join(SITE_ROOT,'static')

# 添加静态文件访问逻辑路径
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static')
]

# 收集静态文件
python3 manage.py collectstatic

# 注销掉物理路径
# STATIC_ROOT,SITE_ROOT

九.重新启动nginx与uwsgi




************Ubuntu系统下部署环境 apache+mod_wsgi************(没访问成功....)

1.准备依赖包/安装包
wget http://mirror.bit.edu.cn/apache/httpd/httpd-2.4.35.tar.gz
wget http://mirror.bit.edu.cn/apache/apr/apr-1.6.5.tar.gz
wget http://mirror.bit.edu.cn/apache/apr/apr-util-1.6.1.tar.gz 
wget https://sourceforge.net/projects/pcre/files/pcre/8.41/pcre-8.41.tar.gz/download   # 下载后修改文件名:mv download pcre-8.41.tar.gz 
wget https://pypi.python.org/packages/28/a7/de0dd1f4fae5b2ace921042071ae8563ce47dac475b332e288bc1d773e8d/mod_wsgi-4.5.7.tar.gz


2.解压/编译/安装
tar -xzvf apr-1.6.5.tar.gz
tar -xzvf apr-util-1.6.1.tar.gz
tar -xzvf pcre-8.41.tar.gz
tar -xzvf httpd-2.4.35.tar.gz
tar -xzvf mod_wsgi-4.5.7.tar.gz

# 进入文件目录/编译安装/退出文件目录
cd apr-1.6.5
sudo ./configure --prefix=/usr/local/apr
sudo make
sudo make install
cd ..

cd apr-util-1.6.1
sudo ./configure --prefix=/usr/local/apr-util --with-apr=/usr/local/apr/bin/apr-1-config
sudo make
sudo make install
cd ..

cd pcre-8.41
sudo ./configure --prefix=/usr/local/pcre
sudo make
sudo make install
cd ..

cd httpd-2.4.29 
sudo ./configure --prefix=/usr/local/apache --with-pcre=/usr/local/pcre --with-apr=/usr/local/apr --with-apr-util=/usr/local/apr-util
sudo make
sudo make install
cd ..


# 添加/修改配置:
# httpd.conf文件中添加ServerName localhost:80
sudo vi /usr/local/apache/conf/httpd.conf +193

# 启动/测试apache
sudo /usr/local/apache/bin/apachectl start 

# 查看apache启动状况
ps -ajx|grep apache  # 关闭apache:sudo /usr/local/apache/bin/apachectl stop


2.安装/配置mod_wsgi(将mod_wsgi关联apache与python，启动apache时会自动调用mod_wsgi与python)
cd mod_wsgi-4.5.7/
sudo ./configure --with-apxs=/usr/local/apache/bin/apxs --with-python=/usr/bin/python3
sudo make 
sudo make install  # 相关报错处理(当前无报错)：./configure --prefix=/usr/local/ CFLAGS=-fPIC
chmod 755 /usr/local/apache/modules/mod_wsgi.so


3.配置apache
  3.1
	# 取消注释：#Include conf/extra/httpd-vhosts.conf
	# 加上LoadModule wsgi_module modules/mod_wsgi.so
	sudo vi /usr/local/apache/conf/httpd.conf 
  3.2
	# 编辑/usr/local/apache/conf/extra/httpd-vhosts.conf
	sudo vi /usr/local/apache/conf/extra/httpd-vhosts.conf
	# 注释掉原本配置，添加下面配置:
		<VirtualHost *:8000>
		        DocumentRoot /var/www/html/TSDRM/TSDRM
		                WSGIScriptAlias / /var/www/html/TSDRM/TSDRM/wsgi.py

		        <Directory /var/www/html/TSDRM/TSDRM>
		                AllowOverride All
		                Require all granted
		        </Directory>
		</VirtualHost>
		Alias /static /var/www/html/TSDRM/faconstor/static
		<Directory /var/www/html/TSDRM/faconstor/static>
		        AllowOverride None
		        Options None
		        Require all granted
		</Directory>


4.启动/重新启动apache
sudo /usr/local/apache/bin/apachectl start # restart


5.访问项目:http://ip:port

