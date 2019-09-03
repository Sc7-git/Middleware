/**
 * Sc7 2019.8.18
 *  经典中间件 又名：.Net Core 中间件
 *  1、增加map(分支)中间件，每一次map都是一个Middleware对象
 */
function Middleware(nextContext) {
    var context = this;
    context._middlewareArray = [];    
    context._endMiddleware = (context) => console.log("中间件文档参考: https://github.com/Sc7-git/Middleware");
    context._nextContext = nextContext;
    context.maps = {};
    context.separator = ",";
}

Middleware.prototype.run = function () {
    var context = this;
    isOnly(context._start);
    context._start = true;
    context.next = context.AOP();
    context.next(context._nextContext)
}

//(next) => (context) =>  {}
Middleware.prototype.use = function (middleware) {
    this._middlewareArray.push(middleware);
    return this;
}

Middleware.prototype.one = function (middleware) {
    isOnly(this._oneMiddleware);
    this._oneMiddleware = middleware;
    return this;
}

//end不是附加，而是覆盖;end的参数只需要(context) =>{}
Middleware.prototype.end = function (func) {
    this._endMiddleware = func;
    return this;
}

//每个map都会返回一个新的中间件(Middleware)
Middleware.prototype.map = function (mapPath, middleware) {
    //每次调用map都创建一个Middleware对象
    var context = this, middlewareArray = context._middlewareArray;
    //mapPath不能包含特定符
    containsSeparatorError(mapPath, context.separator);
    var newMw = new Middleware(context._nextContext);
    context.maps[mapPath] = newMw;
    newMw.one(middleware);
    var previous = middlewareArray.pop();
    var previousType = typeof (previous);
    if (previousType == "string") {
        mapPath = previous + context.separator + mapPath;
    } else {
        context.use(previous);
    }
    context.use(mapPath);
    return newMw;
}

Middleware.prototype.concatMiddleware = function () {
    var context = this, middlewareArray = context._middlewareArray;

    //第一个中间件
    if (context._oneMiddleware)
        middlewareArray.unshift(context._oneMiddleware);

    /*
    //最后一个中间件
    if (context._endMiddleware)
        middlewareArray.push(context._endMiddleware);
    */
    return middlewareArray;
}

Middleware.prototype.AOP = function () {
    var context = this, middlewareArray = context.concatMiddleware();

    //最后一个中间件，并且按序合并了所有中间件
    //var next = (context) => console.log("中间件文档参考: https://github.com/Sc7/Middleware");
    var next = context._endMiddleware;
    var mapNext = {};
    middlewareArray.reverse();

    middlewareArray.forEach(function (middleware) {
        var type = typeof (middleware);
        if (type == "string") {
            var mArray = middleware.split(context.separator);
            mArray.forEach(function (mapPath) {
                var mapContext = context.maps[mapPath];
                mapContext.end(next)
                mapNext[mapPath] = mapContext.AOP();
            })
            next = mapNext;
        }
        else if (type == "function")
            next = middleware(next);
    });
    return next;
}

function isOnly(obj) {
    if (obj) {
        var msg = '只能初始化一次！';
        myAlert(msg);
        abort(msg);
    }
}

function myAlert(msg) {
    alert(msg)
}

function abort(msg) {
    throw msg;
}

//包含特定符异常
function containsSeparatorError(str, separator) {
    if (str.indexOf(separator) != -1)
        abort('mapPath不应出现特定符"' + separator + '"')
}

/**
 Demo:
 1、 var mw=new Middleware();
 2、自定义中间件
     mw.use((next) => (context) => { console.log("自定义中间件1"); next(context) })
       .use((next) => (context) => { console.log("自定义中间件2"); next(context) });
 3、启动中间件
     mw.run()
 4、验证中间件是否全部通过，根据返回值选择自定义业务
    context.Continue

 */