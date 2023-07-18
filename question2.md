## 代码存在的问题：
1、Dom操作最好一次性操作，避免多次，问题代码
```
const userIcon = document.createElement("div");
userIcon.classList.add("user-message");
userIcon.classList.add("user-icon");

// 改成
userIcon.classList.add("user-message", "user-icon");
```

2、太多操作Dom的地方, 可以简化调用方法名（建议）：
document.createElement => createElement
DOM.setAttribute => setAttribute

3、按照功能同一功能的方法，目前看代码完全平铺

4、另外该文件有800多行，如果是开发过程，难以理解。
可以使用把文件按功能拆分（消息框，InddexDB，拖拽，历史记录），使用rollup等工具最后再打包到一起


## 架构调整
-- views(功能模块)  
&ensp;&ensp;--消息框  
&ensp;&ensp;--发送  
&ensp;&ensp;--...  
--message（消息相关）  
--store(indexDB, 历史记录)  
--utils(拖拽，dom相关函数抽象， markdown解析)  
--config.js  
--main.js // 入口文件  
