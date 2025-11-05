const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');


const app = express();
const port = 8080;

const path = require("path");
app.set("view-engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));




const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "prac_app",
  password: "1111", // this is an random pass you may put your SQL db root
});


// i use this to generate fake data in my sql database.
let getauser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};



//Home ROute
app.get("/",(req, res)=>{
    let q ="SELECT count(*) FROM user";
    
try {
  connection.query(q, (err, result) => {
    if (err) throw err;
   let countUser = result[0]["count(*)"];
    res.render("home.ejs",{countUser});
  });
} catch (err) {
  console.log(err);
  res.send("some error in DB");
}
});

// Show ROute
app.get("/user",(req,res)=>{
    let q = "SELECT * FROM user";
   try{
connection.query(q,(err, users)=>{
    if(err) throw err;
    res.render("user.ejs",{users});

});
   }catch(err){
res.send("error occur in user data fetching")
   }
});



// Edit ROute
app.get("/user/:id/edit",(req,res)=>{
    let{id} = req.params;
    let q = `SELECT * FROM user WHERE id ="${id}"`;
 try{
connection.query(q,(err, result)=>{
    if(err) throw err;
    let user =result[0];
    console.log(user);
    res.render("edit.ejs",{user});

});
   }catch(err){
res.send("error occur in user data fetching")
   }
});

// update ROute
app.patch("/user/:id",(req,res)=>{

    let{id} = req.params;
    let q = `SELECT * FROM user WHERE id ="${id}"`;
 try{
connection.query(q,(err, result)=>{
    if(err) throw err;
    let user =result[0];
let{username:newuser, password:formpass}=req.body;
if(formpass != user.password){
res.send("Invalid Password");
}
 else{
    let q2 =`UPDATE user SET username='${newuser}' WHERE id='${id}'`;
    connection.query(q2,(err, result)=>{
        try{
            if(err) throw err;
            res.redirect("/user");
        }catch(err){
res.send("Unable to update new username")

        }
    })
 }

});
   }catch(err){
res.send("error occur in user data fetching")
   }
});

// delete

// fetching for delete
app.get("/user/:id/delete",(req,res)=>{
    let{id} = req.params;
    let q = `SELECT * FROM user WHERE id ="${id}"`;
 try{
connection.query(q,(err, result)=>{
    if(err) throw err;
    let user =result[0];
    console.log(user);
    res.render("delete.ejs",{user});

});
   }catch(err){
res.send("error occur in user data fetching")
   }
});

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = ?`;

    connection.query(q, [id], (err, result) => {
        if (err) {
            return res.send("Error occurred while fetching user data");
        }

        let user = result[0];

        if (!user) {
            return res.send("User not found");
        }

        let { email: newemail, password: formpass } = req.body;

        if (formpass !== user.password || newemail !== user.email) {
            return res.send("Invalid credentials");
        } else {
            let q2 = `DELETE FROM user WHERE id = ?`;
            connection.query(q2, [id], (err2, result2) => {
                if (err2) {
                    return res.send("Unable to delete user");
                }
                res.redirect("/user");  
            });
        }
    });
});


// Add new user
app.get("/user/add", (req, res) => {
  res.render("adduser.ejs");
});
app.post("/user/add", (req, res) => {
  let { username, email, password } = req.body;  
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
  connection.query(q, [id, username, email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error occurred while adding user");
    }
    res.redirect("/user");
  });
});



app.listen(port, ()=>{
    console.log("server up!");
});



