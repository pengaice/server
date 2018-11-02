/**
 * Created by asus-z on 2018/11/1.
 */
const express = require('express')

const db = require('./db')
const router = require('./router')
const app = express();



(async () => {
  await db;
  //应用路由器
  app.use(router)
})()


app.listen('4000',err=>{
  if(!err){
    console.log('服务器连接成功');
  }else {
    console.log(err);
  }
})