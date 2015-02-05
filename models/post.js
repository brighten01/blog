var mongodb = require("./db");
function Post(name, title, content) {
    this.name = name;
    this.title = title;
    this.content = content;
}

Post.prototype.save = function (callback) {
    //初始化用户信息
    var post = {
        name: this.name,
        title: this.title,
        content: this.content,
        time: new Date().getTime()
    };
    //
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            return callback(error);
        }
        db.collection("posts", function (error, collection) {
            if (error) {
                callback(error);
            }
            collection.insert(post, {safe: true}, function (err, post) {
                mongodb.close();
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                callback(null, post);
            }); // end insert

        });//end collection
    }); // end open
};

/**
 * 查找文章列表
 * @param name
 * @param callback
 */
Post.prototype.get = function (name, callback) {
    var date = new Date();
    mongodb.close();
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        var query = {};

        if (name) {
            query.name = name;
        }
        db.collection("posts", function (error, collection) {
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

//获取单条数据
Post.prototype.getOne = function (name, title, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        db.collection("posts", function (error, collection) {
            if (error) {
                return callback(error);
            }
            collection.findOne(
                {
                    name: name,
                    title: title
                }, function (error, doc) {
                    if (error) {
                        callback(error);
                    }
                    callback(null, doc);
                })
        });
    });
};


Post.prototype.getAll = function (name, callback) {
    var date = new Date();
    mongodb.close();
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        var query = {};

        if (name) {
            query.name = name;
        }
        db.collection("posts", function (error, collection) {
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

/**
 * 编辑博客
 * @param name 用户名
 * @param title 标题
 * @param callback 回调函数
 */
Post.prototype.edit = function (name, title, callback) {

    mongodb.close();
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
        }
        db.collection("posts", function (err, collection) {
            collection.findOne({name: name, title: title}, function (error, post) {
                if (error) {
                    callback(error);
                }
                callback(null, post);
            });
        });
    });
};


/**
 * 修改程序
 * @param title    标 题
 * @param content  内 容
 * @param callback 回调函数
 */
Post.prototype.update = function (title, content, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            callback(error);
        }
        db.collection("posts", function (error, collection) {
            if (error) {
                mongodb.close();
                callback(error);
            }
            collection.update({
                "title": title,
                "content": content,
                "time": new Date().getTime()
            }, {$set: {post: content}}, function (error) {
                if (error) {
                   return  callback(error);
                }
                callback(null);
            });

        });
    });
}

/**
 * 删除文章  需要传递作者名称和文章标题
 * @param name
 * @param title
 * @param callback
 */
Post.prototype.remove=function (name,title,callback){
    mongodb.close();
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection("posts",function(err,collection){
            if(err){
                callback(err);
            }
            collection.remove({
                "name":name,
                "title":title
            },function (err){
                if(err){
                    callback(err);
                }
                callback(null);
            });
        });
    });
}
module.exports = new Post("test", "tset", "test");
