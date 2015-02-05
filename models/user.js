var mongodb = require("./db");

function User(user){
        this.name = user.name;
        this.email = user.email;
        this.password= user.password;
}

/**
 * 保存用户信息
 * @param callback 回调函数
 */
User.prototype.save =function (callback){
    //初始化用户信息
    var user = {
        name :this.name,
        email:this.email,
        password: this.password
    };
    //
    mongodb.close();
    mongodb.open(function (error,db){
        if(error){
           return  callback(error);
        }
        db.collection("users",function (error,collection){
            if(error){
                callback(error);
            }
            collection.insert(user,{safe:true},function (err,user){
                mongodb.close();
                if(err){
                    mongodb.close();
                   return  callback(err);
                }
                callback(null ,user[0]);
            }); // end insert

        });//end collection
    }); // end open
};

/**
 * 根据用户名查找信息
 * @param name  用户名
 * @param callback 回调函数
 */
User.prototype.get =function (name,callback){

    mongodb.open(function (err,db){
        if(err) {
            return callback(err);
        }

        db.collection("users",function (err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:name},function (err,user){
                if(err){
                    return callback(err);
                }
                callback(null,user);
            });
        })
    });
};
//原来为  module.exports = User;

module.exports = new User({name:"test",email:"test@test.com",password:"password"});


