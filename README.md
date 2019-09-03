# Middleware #
## 一、入门 ##
    //1、实例化中间件
    var mw, context = { Continue: false };
    mw = new Middleware(context);
    
    //2、注册自定义中间件
    mw.use((next) => (context) => { console.log("自定义中间件1"); next(context) })
      .use((next) => (context) => {
	      console.log("自定义中间件2");
	      //2.1、选择分支
	      //next["map1"](context);
	      next["map2"](context)
      });
    
    //3、注册分支map1和map2
    var map1 = mw.map("map1", next => context => { console.log("map1"); next["map1.2"](context) });
       		   mw.map("map2", next => context => { console.log("map2"); next(context) });
    
    //4、为map1注册子分支
    map1.map("map1.1", next => context => { console.log("map1.1"); next(context) });
    map1.map("map1.2", next => context => { console.log("map1.2"); context.Continue = true });
    
    //5、去end中间件默认提示
    //end是最后一个中间件，注意没有next。
    mw.end(context => { console.log("end"); })
    
    //6、启动中间件
    mw.run();
    
    //按上诉代码只有执行了map1.2才会打印true
    console.log(context.Continue);
    

----------


## 二、事件进阶 ##
# html：#
	<button type="button" id="btn1" class="btn btn-primary" style="width:100px;text-align:center;margin-bottom: 10px;">map1</button>
	<button type="button" id="btn2" class="btn btn-primary" style="width:100px;text-align:center;margin-bottom: 10px;">map2</button>
    
# js：#
    //1、实例化中间件
    var mw,context = {};
    mw = new Middleware(context);
    //2、自定义中间件
    mw.use((next) => (context) => { console.log("自定义中间件1"); next(context) })
        .use((next) => (context) => {
            console.log("自定义中间件2");
            //2.1、根据条件选择分支
            $("#btn1").click(function () {
                next["map1"](context)
            })
            $("#btn2").click(function () {
                next["map2"](context)
            })
        });

    //3、注册分支map1和map2
    //注意：每次map都是一个新的Middleware对象，同一个Middleware对象注册的map是同一层级的分支。
    var map1 = mw.map("map1", next => context => { console.log("map1"); next["map1.2"](context); });
               mw.map("map2", next => context => { console.log("map2"); next(context); });

    //4、为map1注册子分支
    map1.map("map1.1", next => context => { console.log("map1.1"); next(context); });
    map1.map("map1.2", next => context => { console.log("map1.2"); next(context); });

    //5、去end中间件默认提示,end是最后一个中间件，注意没有next。
    mw.end((context) => { console.log("end"); });

    //6、启动中间件
    mw.run()
