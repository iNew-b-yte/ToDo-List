//get to know more about EJS using ejs.co
//.ejs file contains the html text generally
//Ejs is a template


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Naveen:Test123@cluster0.yz2yp.mongodb.net/toDoListDB", {useNewUrlParser: true});

const itemSchema = {
    name : String
}

const Item = mongoose.model("Item",itemSchema);

const eat = new Item({ name : "eat" });

const play = new Item({ name : "play" });

const code = new Item({ name : "code" });

const defaultArray = [eat,play,code];

const listSchema = {
    name : String,
    items : [itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        
    if(foundItems.length === 0){

    Item.insertMany(defaultArray,function(err){
    if(err){  console.log(err);}
    else{ console.log("Success!!"); }
    });
    res.redirect("/");
        }else{
            res.render("list",{listTittle:"Today",_newItems:foundItems});
        }
  });
});

//creating a custom route directly and creating new List documents 
app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name : customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //creates a new list if not found
                const list = new List({
                    name : customListName,
                    items : defaultArray
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{listTittle:foundList.name,_newItems:foundList.items});
            }
        }
    });
});

app.post("/",function(req,res){
    let itemName = req.body.newItem;
    const listName = req.body.list;

  const item = new Item({ name : itemName});
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name : listName},function(err,foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
      });
  }
   

});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body._listName;
    console.log(checkedItemId);

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Success!!");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name : listName},{$pull:{items :{_id:checkedItemId}}},function(err,foundList){
           if(!err){
            res.redirect("/"+listName);
           }
        });
    }
    
});


app.get("/about",function(req,res){
   res.render("about"); 
});

app.listen(3000,function(){
    console.log("Server started at port 3000");
});

