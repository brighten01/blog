/**
 * 路由文件 写所有的路由请求
 * @param app
 */
var crypto = require("crypto");
var User = require("../models/user.js");
var Post = require("../models/post.js");
var Comment = require("../models/comment.js");
//如果你使用prototype 扩展了应用并且 此例中的所有对象都需要接受参数请初始化对应的参数
//User = new User({
//    name:"test",
//    email:"test@test.com",
//    passwor:"test@test.com"
//});
//Post = new Post("test","test","test");
// 如果只是第一个使用protype扩展，那么不需要初始化参数直接使用可以将上述注销掉
module.exports = function (app) {
    //默认主页路由
    app.get("/", function (req, res) {
        Post.get(null, function (error, posts) {
            if (error) {
                posts = [];
            }
            res.render("index", {
                user: req.session.user,
                title: "主页",
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash("error").toString()
            });
        });

    });
    // 如果用户已经登录
    app.get("/reg", checkNotLogin);
    //注册用户信息
    app.get("/reg", function (req, res) {
        res.render("register", {
            user: req.session.user,
            title: "主页",
            success: req.flash('success').toString(),
            error: req.flash("error").toString()
        });
    });

    //如果用户未登录
    app.get("/reg", checkLogin);
    app.post("/reg", function (req, res) {
        //处理用户注册请求
        //接受用户信息处理
        var md5 = crypto.createHash("md5");
        var username = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var password_repeat = req.body.password_repeat;
        /**
         * 判断是否输入的密码和确认密码一致
         */
        if (password_repeat != password) {
            req.flash("error", "您输入的两次密码不一致");
            console.log("错误，您两次输入的密码不一样");
            return res.redirect("/reg");
        }
        // 更新密码结果
        password = md5.update(password).digest("hex");
        //修改初始化的User
        User.name = username;
        User.email = email;
        User.password = password;
        User.get(User.name, function (error, user) {
            if (user) {
                req.flash("error", "用户名已经存在");
                console.log("错误，您注册的用户名已经存在");
                return res.redirect("/reg");
            }
            User.save(function (error, user) {
                if (error) {
                    req.flash("error", "发生错误");
                    console.log("发生位置错误错误代码" + error);
                    return res.redirect("/index");
                }
                req.session.user = user;
                req.flash("success", "注册成功");
                res.redirect("/post");
            });
        });
    });
    /**
     * 登录路由
     */
    app.get("/login", checkNotLogin);
    app.get("/login", function (req, res) {
        res.render("login", {
            title: "主页",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash("error").toString()
        });
    });

    /**
     * 登录判断逻辑
     */
    app.post("/login", checkNotLogin);
    app.post("/login", function (req, res) {
        //登录跳转到发布页面
        var md5 = crypto.createHash("md5");
        var password = req.body.password;
        password = md5.update(password).digest("hex");
        User.name = req.body.name;
        User.pasword = password;
        User.get(req.body.name, function (error, user) {
            if (error) {
                req.flash("error", error);
            }
            if (!user) {
                req.flash("error", "此用户不存在");
                return res.redirect("/login");
            }
            req.session.user = user;
            req.flash("success", "登录成功");
            res.redirect("/post");
        });
    });

    /**
     * 退出路由
     */
    app.get("/logout", function (req, res) {
        //跳转到主页
        req.session.user = null;
        req.flash("success", "退出成功");
        res.redirect("/");
    });

    app.get("/post", checkLogin);
    app.get("/post", function (req, res) {
        res.render("post", {
            title: "发布博客",
            user: req.session.user,
            success: req.flash("success").toString(),
            error: req.flash("error").toString()
        });
    });

    app.post("/post", checkLogin);
    app.post("/post", function (req, res) {
        //处理博客请求
        var currentUser = req.session.user;
        var content = req.body.content;
        var title = req.body.title;
        var name = currentUser.name;
        //var newPost = new Post(name, title, content);
        Post.name = name;
        Post.title = title;
        Post.content = content;
        Post.tags = req.body.tags;
        Post.save(function (error) {
            if (error) {
                req.flash("error", "未知错误" + error);
            }
            req.flash("success", "发布成功");
            res.redirect("/");
        });
    });


    /**
     * 获取用户发布的文章
     */
    app.get("/u/:name", checkLogin);
    app.get("/u/:name", function (req, res) {
        var name = req.params.name;
        User.get(name, function (error, user) {
            if (!user) {
                req.flash("error", "此用户不存在");
                return res.redirect("/");
            }

            Post.getAll(name, function (error, docs) {
                if (error) {
                    req.flash("error", "未知错误" + error);
                    res.redirect("/");
                }
                res.render("index",
                    {
                        user: "test",
                        title: "我发布的文章",
                        success: req.flash("success").toString(),
                        posts: docs,
                        error: req.flash("error").toString()
                    });
            });
        });
    });

    /**
     * 查找文章 根据作者和文章标题
     */
    app.get("/u/:name/:title", function (req, res) {
        var name = req.params.name;
        var title = req.params.title;

        User.get(name, function (error, user) {
            if (!user) {
                req.flash("error", "无此用户");
                return res.render("/");
            }
            Post.getOne(name, title, function (error, post) {
                if (error) {
                    req.flash("error", "错误");
                    return res.render('/');
                }

                res.render("article",
                    {
                        title: title,
                        name: name,
                        user: req.session.user,
                        success: req.flash("success").toString(),
                        error: req.flash("error").toString(),
                        post: post

                    }
                );
            })
        });
    });


    //验证登录
    app.post("/u/:name/:title",checkLogin);
    app.post("/u/:name/:title" ,function (req,res){

        var comment = {
            name:req.body.name,
            title:req.body.title,
            website : req.body.website,
            time:new Date().getTime(),
            content: req.body.content
        };

        var newComment = new Comment(req.params.name,req.params.title,comment);
        newComment.save(function (error){
            if(error){
                req.flash("error","出现错误"+error);
                return res.redirect("/");
            }

            req.flash("success","发表评论成功");
            res.redirect('back');
        });
    });
    //验证登录
    app.get("/edit/:name/:title", checkLogin);
    app.get("/edit/:name/:title", function (req, res) {
        var name = req.params.name;
        var title = req.params.title;
        User.get(name, function (error, user) {
            if (!user) {
                req.flash("error", "此用户不存在");
                return res.redirect("/");
            }

            Post.edit(name, title, function (error, doc) {
                if (error) {
                    req.flash("error", "未知错误");
                    return res.redirect("/");
                }
                res.render("edit",
                    {
                        title: "编辑博客",
                        post: doc,
                        user: req.session.user,
                        success: req.flash("success").toString(),
                        error: req.flash("error").toString()
                    }
                );
            });
        });
    });

    /**
     *修改页面
     */
    app.post("/edit/:name/:title", checkLogin);
    app.post("/edit/:name/:title", function (req, res) {
        var title = req.body.title;
        var content = req.body.content;
        var name = req.params.name;
        var comment_title = req.body.title;
        var comment_content = req.body.comment;
        var currentUser = req.session.user;
        var comment_name = currentUser.name;
        var newComment = new Comment(comment_name,comment_title,comment_content);
        newComment.save(function (error){
            if(error){
                req.flash("发布评论失败");
                return res.redirect("/");
            }
            req.flash("success","发布评论成功");
            res.redirect("/");
        });
        Post.update(name, title, content, function (error) {
            if (error) {
                req.flash("修改文章发生错误" + error);
                return res.redirect("/");
            }
            req.flash("success", "修改成功");
            return res.redirect("/");
        });

    });

    //验证登录
    app.get("/delete/:name/:title", checkLogin);
    app.get("/delete/:name/:title", function (req, res) {
        var name = req.params.name;
        var title = req.params.title;
        Post.remove(name, title, function (error) {
            if (error) {
                req.flash("error", "删除错误");
                return res.redirect("/");
            }
            req.flash("success", "删除成功");
            res.redirect("/");
        });
    });

    app.get("/tags/:tags",function (req,res){
        var tags  = req.params.tags;
        Post.getTag(tags,function (error,docs){
            if(error){
                req.flash("error","发生错误");
                res.redirect("/");
            }

            res.render("list",
                {
                    user:req.session.user,
                    title:"标签查找",
                    success:req.flash("success").toString(),
                    error:req.flash("error").toString(),
                    posts:docs
                });
        });

    });
    /**
     *  验证用户登录
     * @param req 请求
     * @param res 相应
     * @param next 授权下一步
     */
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash("error", "请您登录");
            res.redirect("/login");
        }
        next();
    }

    /**
     *  验证用户登录
     * @param req 请求
     * @param res 相应
     * @param next 授权下一步
     */
    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash("success", "已经登录");
            res.redirect('back');
        }
        next();
    }

}