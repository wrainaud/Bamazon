var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

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
    showProducts();
  });

  function showProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at showProducts(): " + err);

        var table = new Table({
            head: ['ID ', 'Product Name', 'Department', 'Price', 'Stock'],
            colWidths: [6, 50, 25, 11, 8],
            style : {compact : false, 'padding-left' : 1}
        });
        
        for (var i = 0; i < res.length; i++){

            table.push([res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]);
            
        }

        console.log(table.toString());
        
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
              message: "Enter the ID of the product you wish to purchase:\n",
            },
            {
              name: "units",
              type: "input",
              message: "How many units would you like to buy?\n",
              validate: function(value) {
                  if (isNaN(value) === false) {
                    return true;
                  }
                  return false;
                }
          }      
        ])
        .then(function(answer) {
        var customerQuery = "SELECT * FROM products WHERE ?";
        connection.query(customerQuery, { item_id: answer.id }, function(err, res) {

            var currentStock = res[0].stock_quantity;
            var purchaseStock = answer.units;

            if (currentStock >= purchaseStock){

                var updatedStock = currentStock - purchaseStock;

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: updatedStock
                        },
                        {
                            item_id: answer.id
                        }
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log("\n==============================================\n");
                        console.log("Purchase Complete\n");
                        var subTotal = res[0].price * answer.units;
                        console.log("Subtotal: " + "$" + subTotal);
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