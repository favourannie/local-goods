const goodsDb = require("./localGoods.json")
const http = require("http")
const fs = require("fs")
const { log, error } = require("console")
const { json } = require("stream/consumers")
const PORT = 5050

const server = http.createServer((req,res)=>{
    const {url,method} = req
    const uuid = require ("uuid").v4()

    if(url === "/input-goods" && method === "POST"){
        let body = ''
        req.on("data", (chunks)=> {
            body += chunks
        })
        req.on("end", (chunks)=>{
            const data = JSON.parse(body)

            const localGoods ={
                id: uuid,
                name: data.name,
                inStock: data.inStock,
                unit: data.unit,
                unitPrice: data.unitPrice,
                totalPrice: data.unit * data.unitPrice
            }
            goodsDb.push(localGoods)
            fs.writeFile("./localgoods.json", JSON.stringify(goodsDb,null,2), "utf-8", (error,data)=>{
                if (error){
                    res.writeHead(400,{"content-type":"text/plain"})
                    res.end("Bad request")
                } else{
                    res.writeHead(201, {"content-type":"application/json"})
                    res.end(JSON.stringify({
                        message: "List has successfully been created",
                        data: localGoods
                    }))
                }
            })
        })
    } 
      else if(url.startsWith("/goods") && method === "GET"){
        if (goodsDb.length < 1){
            res.writeHead(404, {"content-type": "text/plain"})
            res.end("No goods found")
        } else {
            res.writeHead(200,{"content-type":"text/plain"})
            res.end(JSON.stringify({
                message: "All goods are listed below:",
                total: goodsDb.length,
                data: goodsDb
            }))
        }
      }
      else if(url.startsWith("/good") && method === "GET"){
        const id = url.split("/")[2]
        const good = goodsDb.find((e)=> e.id === id )
        if (!good){
            res.writeHead(404, {"content-type": "text/plain"})
            res.end("Goods not found")
        } else{
            res.writeHead(200, {"content-type":"application/json"})
            res.end(JSON.stringify({
                message: "Item below",
                data: good
            }))
        }
      }
 else if (url.startsWith("/update-goods") && method === "PATCH"){
    let body = ""
    req.on ("data", (chunks) =>{
        body += chunks
    })
    req.on("end", ()=>{
        const update = JSON.parse(body)
        const id = url.split("/")[2]
        const good = goodsDb.find((e)=>e.id === id)
        Object.assign(good,update)
        const index = goodsDb.findIndex((e)=> e.id === good.id)
        if (index !== -1){
            goodsDb[index] = good
        }
        fs.writeFile("./localGoods.json", JSON.stringify(goodsDb, null, 2), "utf-8", (error, data)=>{
            if (error){
                res.writeHead(500, {"content-type":"text/plain"})
                res.end("Error! Couldn't update list")
            } else{
                res.writeHead(200, {"content-type": "application/json"})
                res.end(JSON.stringify({
                    message: "List updated successfully",
                    data: good
                }))
            }
        })
    })
 }
 else if(url.startsWith("/delete-goods") && method === "DELETE"){
    const id = url.split("/")[2]
    const good = goodsDb.find((e)=>e.id === id)
    const index = goodsDb.findIndex((e)=>e.id === good.id)
    if(!good){
        res.writeHead(404, {"content-type":"text/plain"})
        return res.end("Item not found")
    }
    goodsDb.splice(index, 1)
    fs.writeFile("./localgoods.json", JSON.stringify(goodsDb, null, 2), "utf-8", (error, data)=>{
        if (error){
            res.writeHead(500, {"content-type": "text/plain"})
            res.end("Error! Couldn't delete an item.")
        }else{
            res.writeHead(200, {"content-type":"text/plain"})
            res.end("Item successfully deleted.")
        }
    })
 }
})
server.listen(PORT, () =>{
    console.log(`Server is running on PORT: ${PORT}`);
})