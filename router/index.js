const express = require('express')
//加密的东东
const md5 = require('blueimp-md5');
const Users = require('../model/users')
const cookieParser = require('cookie-parser')

const Router = express.Router;
const router = new Router();
//post请求拿不到，去请求体中拿 要用bodyparser
//但是现在已经挂载到express上面了 可以直接用

router.use(express.urlencoded({extended:true}))
router.use(cookieParser())
//登陆
router.post('/login', async(req,res)=>{
  
  const {username,password} = req.body;
  if(!username||!password){
    res.json({
      "code": 2,
      "msg": "用户输入不合法"
    })
    return;
  }
//  .去数据库看看是否有相同的数据存在

   try {
     const data = await Users.findOne({username,password:md5(password)})
     
     if(data){
       // 找到了 登陆成功
       res.cookie('userid',data.id,{maxAge:1000*3600*24*7})
       res.json({
         "code": 0,
         "data": {
           "_id": data.id,
           "username": data.username,
           "type": data.type
         }
       })
     }else {
       //  没找到
       res.json({
         "code": 1,
         "msg":"用户名或密码错误",
       })
     }
   } catch(e) {
     res.json({
       "code": 3,
       "msg":"网不好",
     })
   }
})

//注册
router.post('/register',async (req, res) => {
  const {username, password, type} = req.body;
  console.log(username, password, type);
  if (!username || !password || !type) {
    console.log(username, password, type);
    res.json({
      "code": 2,
      "msg": "用户输入1不合法"
    });
    return;
  }
  // 3. 去数据库查
  try {
    const data = await Users.findOne({username});
    if (data) {
      res.json({
        "code": 1,
        "msg": "用户名已存在"
      });
    } else {
      const data = await Users.create({username, password: md5(password), type});
      res.cookie('userid', data.id, {maxAge:1000*3600*24*7});
      res.json({
        code: 0,
        data: {
          _id: data.id,
          username: data.username,
          type: data.type
        }
      })
    }
  } catch (e) {
    res.json({
      "code": 3,
      "msg": "网络不稳定"
    })
  }
  
})
// 更新用户信息的路由
router.post('/update', (req, res) => {
  const userid = req.cookies.userid
  if (!userid) {
    return res.json({code: 1, msg: '请先登陆'});
  }
  const user = req.body // 没有_id
  Users.findByIdAndUpdate({_id: userid}, user)
    .then(oldUser => {
      if (!oldUser) {
        res.clearCookie('userid');
        res.json({code: 1, msg: '要先登陆'});
      } else {
        const {_id, username, type} = oldUser;
        const data = Object.assign({_id, username, type}, user)
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      res.send({code: 3, msg: '网络不稳定'})
    })
})
module.exports = router;