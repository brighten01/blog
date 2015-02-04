/**
 * 路由文件 写所有的路由请求
 * @param app
 */
var crypto = require("crypto");
var User = require("../models/user.js");
var  Post = require("../models/post.js");

module.exports = function (app) {
    //默认主页路由
    app.get("/", function (req, res) {
        var newPost = new Post();
        newPost.get(null, function (error, posts) {
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

        var newUser = new User(
            {
                name: username,
                email: email,
                password: password
            }
        );
        newUser.get(newUser.name, function (error, user) {
            if (user) {
                req.flash("error", "用户名已经存在");
                console.log("错误，您注册的用户名已经存在");
                return res.redirect("/reg");
            }
            newUser.save(function (error, user) {
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
            user: req.session.user,
            title: "主页",
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
        var newUser = new User(
            {
                name: req.body.name,
                password: password
            }
        );
        newUser.get(req.body.name, function (error, user) {
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
        res.render("post", {title: "发布博客"});
    });

    app.post("/post", checkLogin);
    app.post("/post", function (req, res) {
        //处理博客请求
        var currentUser = req.session.user;
        var content = req.body.content;
        var title = req.body.title;
        var name = currentUser.name;
        var newPost = new Post(name, title, content);
        newPost.save(function (error) {
            if (error) {
                req.flash("error", "未知错误" + error);
            }
            req.flash("success", "发布成功");
            res.redirect("/");
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