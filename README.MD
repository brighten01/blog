本系统前期采用express 导出 导出的命令式  
express -e blog

目前的express 都是4.0 以上版本先交代express 还原成3.5  方法如下 

    1.卸载: npm uninstall -g express
    2.安装指定版本: npm install -g express@3.5.0
    3.查看版本: express -V
    注意express -V中的V要大写,不然很多版本中会不识别