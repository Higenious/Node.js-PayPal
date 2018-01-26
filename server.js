var express       = require('express');
var bodyParser    = require('body-parser');
var paypal        = require('paypal-rest-sdk');
var nodemon       = require('nodemon');
var app           = express();
app.use(express.static(__dirname +'/Client'));


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Enter ID',
    'client_secret': 'Enter ID'
  });



app.get('/',  function(req,  res){
     console.log('index serving ');
     res.senFile('index');
});

app.post('/pay',  function(req, res){
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Pen",
                    "sku": "001",
                    "price": "20.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "20.00"
            },
            "description": "Payment for pen"
        }]
   
    }
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                  }
                }
            }
          });

});
app.get('/success', function(req, res){
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "20.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
});


app.get('/cancel', function(req, res){
    res.send('cancelled');
});

app.listen(3000,  function() {
    console.log('server started On 3000');
});
