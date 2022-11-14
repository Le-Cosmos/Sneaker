const Express = require('express');
const SneaksAPI = require('sneaks-api');
const Maths = require('mathjs')
const sneaks = new SneaksAPI();
const app = Express();
const ejs = require("ejs");
const bodyParser = require("body-parser");


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(Express.static('public'));


const nombreDeJour = 10;
const daysArray = [];
const dateArray = [];
var date = new Date();
var bestDeal = [];
var shoesSearch = [];
app.get("/", function(req, res) {

  bestDeal = [];
  shoesSearch = [];
  var j = 0;
  for (let k = 0; k < nombreDeJour; k ++) {
    var jour = date.getDate() + "";
    if (jour.length === 1){
      jour = "0" + jour;
    }
    var moi = date.getMonth() + 1 + "";
    if (moi.length === 1){
      moi = "0" + moi;
    }
    let d = date.getFullYear() + "-" + moi + "-" + jour;

    sneaks.getProducts(d, 10, function(err, products) {

      var shoesArray = [];
      let diffPrice = 0;
      let stockxPrice = 0;
      let flightClubPrice = 0;
      let goatPrice = 0;
      var arrayPrice = [];
      if (products) {
        for (let index = 0; index < products.length; index ++) {
          if (products[index].releaseDate === d){
            shoesArray[index] = products[index];
            stockxPrice = products[index].lowestResellPrice.stockX;
            flightClubPrice = products[index].lowestResellPrice.flightClub;
            goatPrice = products[index].lowestResellPrice.goat;
            arrayPrice = [stockxPrice, flightClubPrice, goatPrice];
            for (let i = 0; i < 3; i ++){
              if (typeof arrayPrice[i] === "undefined") {
                arrayPrice.splice(i, 1, 0);
              }
            }
            diffPrice = Maths.min(arrayPrice) - products[index].retailPrice;
            if (j > 3) {
            let bestDealLen = bestDeal.length;
            for (let tri = 1; tri < bestDealLen; tri = tri + 2){
              if (diffPrice > bestDeal[tri]){
                bestDeal.splice(tri - 1, 0, products[index].shoeName);
                bestDeal.splice(tri, 0, diffPrice);
                break;
                  }
                }
              } else if (j === 2) {
              if (bestDeal[j - 1] < diffPrice) {
                bestDeal.splice(0, 0, products[index].shoeName);
                bestDeal.splice(1, 0, diffPrice);
              } else {
                  bestDeal.splice(2, 0, products[index].shoeName);
                  bestDeal.splice(3, 0, diffPrice);
              }
            } else if (j === 0) {
                bestDeal.splice(0, 1, products[index].shoeName);
                bestDeal.splice(1, 1, diffPrice);
            }
            j = j + 2;
          }
        }
      daysArray[k] = shoesArray.slice();
      dateArray[k] = d;
      }
    });
    date.setDate(date.getDate() + 1);
  }
  console.log(bestDeal);
  res.render("main", {bestDeal: bestDeal, daysArray: daysArray , dateArray: dateArray});
});
app.post("/", function(req, res){
  res.redirect("/");
});
app.post("/search", function(req, res){
  const shoesSearch = [];
  const re = req.body.recherche;
  console.log(re);
  sneaks.getProducts(re, 10, function(err, products){
    if(products){
    for (let i = 0; i < products.length; i ++){
      shoesSearch[i] = products[i];
    }
    }
  });
  res.render("search", {shoesSearch: shoesSearch});
});

app.get("/:sneaker", function(req, res){
  const shoesSearched = req.body.p;
  res.render("sneaker", {shoesSearched: shoesSearched});
});

app.listen(3000, function(){
  console.log("server running 3000");
});
