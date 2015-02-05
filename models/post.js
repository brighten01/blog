var mongodb= require("./db");
function Post(name,title,content){
    this.name = name;
    this.title = title;
    this.content = content;
}

Post.prototype.save =function (callback){
    //初始化用户信息
    var post = {
        name: this.name,
        title :this.title,
        content:this.content,
        time: new Date().getTime()
    };
    //
    mongodb.close();
    mongodb.open(function (error,db){
        if(error){
            return  callback(error);
        }
        db.collection("posts",function (error,collection){
            if(error){
                callback(error);
            }
            collection.insert(post,{safe:true},function (err,post){
                mongodb.close();
                if(err){
                    mongodb.close();
                    return  callback(err);
                }
                callback(null ,post);
            }); // end insert

        });//end collection
    }); // end open
};

/**
 * 查找文章列表
 * @param name
 * @param callback
 */
Post.prototype.get = function (name ,callback){
    var date  = new Date();
    mongodb.close();
    mongodb.open(function (err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        var query= {};

        if(name){
            query.name = name;
        }
        db.collection("posts",function(error,collection){
            collection.find(query).sort({time:-1}).toArray(function (err,docs){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};

//获取单条数据
Post.prototype.getOne=function (name,title,callback){
    mongodb.close();
    mongodb.open(function (error,db){
        db.collection("posts",function (error,collection){
            if(error){
                return callback(error);
            }
            collection.findOne(
                {
                    name:name,
                    title:title
                },function (error,doc){
                    if(error){
                        callback(error);
                    }
                    callback(null,doc);
                })
        });
    });
};


Post.prototype.getAll = function (name ,callback){
    var date  = new Date();
    mongodb.close();
    mongodb.open(function (err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        var query= {};

        if(name){
            query.name = name;
        }
        db.collection("posts",function(error,collection){
            collection.find(query).sort({time:-1}).toArray(function (err,docs){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};

module.exports = new Post("test","tset","test");
