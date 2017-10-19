var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
  });
  
  // connect to the mysql server and sql database
  connection.connect(function(err) {
    if (err) throw console.log("error at connection.connect: " + err);
    console.log("connected as id: " + connection.threadId + "\n");
    showProducts();
  });

  function start(){
      console.log("We da best!");
  };

  function showProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        
        for (var i = 0; i < res.length; i++){
            console.log("ID: " + res[i].id + " | " + " Product Name: " + res[i].product_name + " Department: " + res[i].department_name + " Price: " + res[i].price + " Stock Qty: " + res[i].stock_quantity);
        }
        purchaseProducts();
    });
}

// function which prompts the user for what action they should take
function purchaseProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw console.log("connection error: " + err);
        inquirer.prompt([
          {
              name: "id",
              type: "input",            
              message: "Enter the ID of the product you wish to purchase",
            },
            {
              name: "units",
              type: "input",
              message: "How many would you like to buy?",
              validate: function(value) {
                  if (isNaN(value) === false) {
                    return true;
                  }
                  return false;
                }
          }      
        ])
        .then(function(answer) {
        var query = "SELECT * FROM products WHERE ?";
        connection.query(query, { id: answer.id }, function(err, res) {

            var dbStock = res[0].stock_quantity;
            var reqStock = answer.units;

            if (dbStock >= reqStock){

                var NewStock = dbStock - reqStock;

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: NewStock
                        },
                        {
                            id: answer.id
                        }
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log("\n==============================================\n");
                        console.log("Purchase Complete\n");
                        var totalCost = res[0].price * answer.units;
                        console.log("Your Item(s) Cost: " + totalCost);
                        console.log("\n==============================================\n");
                        showProducts();
                    
                      }
                );
            }
            else {
                console.log("\n==============================================\n");
                console.log("Out of Stock - Please choose a different product or quantity");
                console.log("\n==============================================\n");
                showProducts();
               
              }
        
        });

         
        });
    });
  }