var mongodb = require("./db");
var markdown = require("markdown").markdown;
function Post(name, title, content, tags) {
    this.name = name;
    this.title = title;
    this.content = content;
    this.tags = tags;
}

Post.prototype.save = function (callback) {
    //初始化用户信息
    var post = {
        name: this.name,
        title: this.title,
        content: this.content,
        time: new Date().getTime(),
        tags: this.tags,
        comments: [],
        reprint_info: {
            reprint_from:{},
            reprint_to:[]
        }
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
                    //doc.content = markdown.toHTML(comment.content);

                    if (doc) {
                        collection.update(
                            {"name": name, "title": title},
                            {$inc: {"pv": 1}}, function (error) {
                                mongodb.close();
                                if (error) {
                                    return callback(error);
                                }
                            });
                        doc.comments.forEach(function (comment) {
                            comment.content = markdown.toHTML(comment.content);
                        });
                    }
                    callback(null, doc);
                })
        });
    });
};

/**
 *
 * @param name 获取所有
 * @param callback 回调函数
 */
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
Post.prototype.update = function (name, title, content, callback) {
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
            collection.update(
                {
                    "name": name,
                    "title": title
                }, {$set: {"content": content, "title": title}}, function (error) {
                    if (error) {
                        return callback(error);
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
Post.prototype.remove = function (name, title, callback) {
    mongodb.close();
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection("posts", function (err, collection) {
            if (err) {
                callback(err);
            }
            //删除对应文章的转载
            collection.findOne({
                name:name,
                title:title
            },function (error,doc){
                if(error){
                    return callback(error);
                }

                var reprint_from = "";
                if(doc.reprint_info.reprint_from){
                    reprint_from = doc.reprint_info.reprint_from;
                }

                if(reprint_from!=""){
                    collection.update({
                        "name":reprint_from.name,
                        "title":reprint_from.title
                    },{$pull:{
                        "reprint_info.reprint_to":{
                        "name":name,
                         "title":title
                         }
                      }},function (error){
                          if(error){
                              mongodb.close();
                             return callback(error);
                          }
                       });
                }
            });

            collection.remove({
                "name": name,
                "title": title
            }, function (err) {
                if (err) {
                    callback(err);
                }
                callback(null);
            });
        });
    });
};
/**
 * 增加标签查找功能
 * @param tags  标签的名称目前只支持一个
 * @param callback  回调函数
 */
Post.prototype.getTag = function (tags, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("posts", function (error, collection) {
            collection.find({tags: tags}).sort({time: -1}).toArray(function (error, docs) {
                if (error) {
                    callback(error);
                }
                callback(null, docs);
            });
        });
    });

};

/**
 *
 * @param reprint_from 转载的元文章
 * @param reprint_to  转载之后的文章
 * @param callback  回调转载函数
 */
Post.prototype.reprint = function (reprint_from, reprint_to, callback) {

    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("posts", function (error, collection) {
            collection.findOne({
                "name": reprint_from.name,
                "title": reprint_from.title
            }, function (error, post) {
                if (error) {
                    return callback(error);
                }
                //删除唯一标识 转载产生一条新的数据
                delete post._id;

                post.name = reprint_to.name;
                post.title = (post.title.search(/[转载]/) > -1) ? post.title : "[转载]" + post.title;
                post.comment = [];
                post.reprint_info = {"reprint_from": reprint_from};
                post.pv = 0;

                //更新原有数据 reprint_to 意义为被转载之后的数据  rerpint_to 设计为数组 所有的被转载记录记录到这个数组里
                collection.update({
                    "name":reprint_from.name,
                    "title":reprint_from.title
                },{$push:{"reprint_info.reprint_to":{"title":post.title,"name":post.name}}},function (error){
                    if(error){
                        return callback(error);
                    }


                    //生成一条转载后的数据  将数据的来源写入到reprint_from 中 reprint_from 永远为一维数组
                    collection.insert(post,{safe:true},function (error,doc){
                        if(error){
                            return callback(error);
                        }
                        callback(null,doc[0]);
                    });
                });
                //这里取消回调
                //callback(null, post);
            });
        });
    });
};
module.exports = new Post("test", "tset", "test");
